import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { AttendanceService } from '../application/attendance.service.js'

const idSchema = z.string().uuid()

const bulkMarkSchema = z.object({
  academicYearId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional().nullable(),
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      attendanceStatus: z.enum(['present', 'absent', 'late', 'leave', 'excused']),
      remarks: z.string().optional().nullable(),
    }),
  ).min(1, 'At least one student record is required.'),
})

const correctionRequestSchema = z.object({
  attendanceRecordId: z.string().uuid(),
  requestedStatus: z.enum(['present', 'absent', 'late', 'leave', 'excused']),
  reason: z.string().min(5, 'Reason must be at least 5 characters.'),
})

export function createAttendanceRouter(dependencies: {
  service: AttendanceService
  authentication: AuthenticationService
  authorization: AuthorizationService
  audit: AuditService
}): Router {
  const router = Router()
  const authenticated = authenticate(dependencies.authentication)
  const globalScope = enforceRecordScope(dependencies.authorization, dependencies.audit, () => ({
    kind: 'all',
  }))
  const permitted = (permission: string) =>
    requirePermission(dependencies.authorization, dependencies.audit, permission)

  router.get('/sessions', authenticated, permitted('attendance.mark'), globalScope, async (req, res, next) => {
    try {
      const { academicYearId, classId, sectionId, date } = req.query
      const sessions = await dependencies.service.listSessions({
        academicYearId: academicYearId ? String(academicYearId) : undefined,
        classId: classId ? String(classId) : undefined,
        sectionId: sectionId ? String(sectionId) : undefined,
        date: date ? String(date) : undefined,
      })
      res.json(successResponse(sessions))
    } catch (err) {
      next(err)
    }
  })

  router.post('/sessions/records', authenticated, permitted('attendance.mark'), globalScope, async (req, res, next) => {
    try {
      const input = bulkMarkSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const result = await dependencies.service.bulkMarkAttendance(actorProfileId, input)
      res.status(201).json(successResponse(result))
    } catch (err) {
      next(err)
    }
  })

  router.get('/sessions/:id/records', authenticated, globalScope, async (req, res, next) => {
    try {
      const sessionId = idSchema.parse(req.params.id)
      const records = await dependencies.service.getSessionRecords(sessionId)
      res.json(successResponse(records))
    } catch (err) {
      next(err)
    }
  })

  router.post('/sessions/:id/lock', authenticated, permitted('attendance.lock'), globalScope, async (req, res, next) => {
    try {
      const sessionId = idSchema.parse(req.params.id)
      const session = await dependencies.service.lockSession(sessionId)
      res.json(successResponse(session))
    } catch (err) {
      next(err)
    }
  })

  router.post('/corrections/request', authenticated, permitted('attendance.correct'), globalScope, async (req, res, next) => {
    try {
      const input = correctionRequestSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const correction = await dependencies.service.createCorrectionRequest(
        actorProfileId,
        input.attendanceRecordId,
        input.requestedStatus,
        input.reason,
      )
      res.status(201).json(successResponse(correction))
    } catch (err) {
      next(err)
    }
  })

  router.get('/corrections/pending', authenticated, permitted('attendance.correct'), globalScope, async (_req, res, next) => {
    try {
      const list = await dependencies.service.listPendingCorrections()
      res.json(successResponse(list))
    } catch (err) {
      next(err)
    }
  })

  router.post('/corrections/:id/review', authenticated, permitted('attendance.correct'), globalScope, async (req, res, next) => {
    try {
      const correctionId = idSchema.parse(req.params.id)
      const { status } = z.object({ status: z.enum(['approved', 'rejected']) }).parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const updated = await dependencies.service.reviewCorrection(
        correctionId,
        actorProfileId,
        status,
      )
      res.json(successResponse(updated))
    } catch (err) {
      next(err)
    }
  })

  router.get('/students/:studentId/history', authenticated, globalScope, async (req, res, next) => {
    try {
      const studentId = idSchema.parse(req.params.studentId)
      const history = await dependencies.service.getStudentAttendanceHistory(studentId)
      res.json(successResponse(history))
    } catch (err) {
      next(err)
    }
  })

  return router
}
