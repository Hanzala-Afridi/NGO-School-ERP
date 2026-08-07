import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { ProgressService } from '../application/progress.service.js'

const idSchema = z.string().uuid()

const recordProgressSchema = z.object({
  studentId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  termId: z.string().uuid(),
  subjectId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid(),
  rating: z.string().trim().min(1),
  note: z.string().trim().optional().nullable(),
  visibilityStatus: z.enum(['draft', 'published']).optional(),
})

const createCategorySchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
})

export function createProgressRouter(dependencies: {
  service: ProgressService
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

  router.get('/progress/categories', authenticated, globalScope, async (req, res, next) => {
    try {
      const { schoolId } = req.query
      const list = await dependencies.service.listCategories(schoolId ? String(schoolId) : undefined)
      res.json(successResponse(list))
    } catch (err) {
      next(err)
    }
  })

  router.post('/progress/categories', authenticated, permitted('progress.create'), globalScope, async (req, res, next) => {
    try {
      const input = createCategorySchema.parse(req.body)
      const category = await dependencies.service.createCategory(input)
      res.status(201).json(successResponse(category))
    } catch (err) {
      next(err)
    }
  })

  router.get('/progress/students/:studentId', authenticated, globalScope, async (req, res, next) => {
    try {
      const studentId = idSchema.parse(req.params.studentId)
      const roles = req.auth?.roles ?? []
      const isParent = roles.some((r: { id: string; name: string }) => r.name === 'Parent')
      const visibilityFilter = isParent ? 'published' : (req.query.status ? String(req.query.status) : undefined)
      const list = await dependencies.service.getStudentProgress(studentId, visibilityFilter)
      res.json(successResponse(list))
    } catch (err) {
      next(err)
    }
  })

  router.post('/progress/students/record', authenticated, permitted('progress.create'), globalScope, async (req, res, next) => {
    try {
      const input = recordProgressSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const record = await dependencies.service.recordProgress(actorProfileId, input)
      res.status(201).json(successResponse(record))
    } catch (err) {
      next(err)
    }
  })

  router.post('/progress/:id/publish', authenticated, permitted('progress.create'), globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      const updated = await dependencies.service.publishProgress(id)
      res.json(successResponse(updated))
    } catch (err) {
      next(err)
    }
  })

  router.get('/classes/:id/progress-summary', authenticated, globalScope, async (req, res, next) => {
    try {
      const classId = idSchema.parse(req.params.id)
      const summary = await dependencies.service.getClassProgressSummary(classId)
      res.json(successResponse(summary))
    } catch (err) {
      next(err)
    }
  })

  return router
}
