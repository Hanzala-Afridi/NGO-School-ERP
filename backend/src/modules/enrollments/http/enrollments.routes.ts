import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { EnrollmentsService } from '../application/enrollments.service.js'

const idSchema = z.string().uuid()

const enrollmentCreateSchema = z.object({
  studentId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().nullable().optional(),
  rollNumber: z.number().int().min(1).nullable().optional(),
  startDate: z.string().date().optional(),
})

const enrollmentUpdateSchema = z
  .object({
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().nullable().optional(),
    rollNumber: z.number().int().min(1).nullable().optional(),
    status: z.enum(['active', 'promoted', 'transferred', 'withdrawn', 'completed']).optional(),
    endDate: z.string().date().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const promoteSchema = z.object({
  targetAcademicYearId: z.string().uuid(),
  targetClassId: z.string().uuid(),
  targetSectionId: z.string().uuid().nullable().optional(),
  newRollNumber: z.number().int().min(1).nullable().optional(),
})

const transferSchema = z.object({
  targetClassId: z.string().uuid().optional(),
  targetSectionId: z.string().uuid(),
  newRollNumber: z.number().int().min(1).nullable().optional(),
})

const withdrawSchema = z.object({
  reason: z.string().trim().max(500).optional(),
})

export function createEnrollmentsRouter(dependencies: {
  service: EnrollmentsService
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

  router.get('/enrollments', authenticated, permitted('enrollments.read'), globalScope, async (request, response) => {
    const { studentId, academicYearId, classId, sectionId, status, page, limit } = request.query
    const result = await dependencies.service.listEnrollments({
      studentId: studentId ? String(studentId) : undefined,
      academicYearId: academicYearId ? String(academicYearId) : undefined,
      classId: classId ? String(classId) : undefined,
      sectionId: sectionId ? String(sectionId) : undefined,
      status: status ? (status as any) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    })
    response.json(successResponse(result.items, { total: result.total }))
  })

  router.get('/enrollments/:id', authenticated, permitted('enrollments.read'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const enrollment = await dependencies.service.getEnrollment(id)
    response.json(successResponse(enrollment))
  })

  router.post('/enrollments', authenticated, permitted('enrollments.create'), globalScope, async (request, response) => {
    const input = enrollmentCreateSchema.parse(request.body)
    const enrollment = await dependencies.service.createEnrollment(request.auth!, input)
    response.status(201).json(successResponse(enrollment))
  })

  router.patch('/enrollments/:id', authenticated, permitted('enrollments.update'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const patch = enrollmentUpdateSchema.parse(request.body)
    const enrollment = await dependencies.service.updateEnrollment(request.auth!, id, patch)
    response.json(successResponse(enrollment))
  })

  router.post('/enrollments/:id/promote', authenticated, permitted('enrollments.promote'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const input = promoteSchema.parse(request.body)
    const newEnrollment = await dependencies.service.promoteEnrollment(request.auth!, id, input)
    response.status(201).json(successResponse(newEnrollment))
  })

  router.post('/enrollments/:id/transfer', authenticated, permitted('enrollments.transfer'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const input = transferSchema.parse(request.body)
    const newEnrollment = await dependencies.service.transferEnrollment(request.auth!, id, input)
    response.status(201).json(successResponse(newEnrollment))
  })

  router.post('/enrollments/:id/withdraw', authenticated, permitted('enrollments.withdraw'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const input = withdrawSchema.parse(request.body)
    const updated = await dependencies.service.withdrawEnrollment(request.auth!, id, input)
    response.json(successResponse(updated))
  })

  return router
}
