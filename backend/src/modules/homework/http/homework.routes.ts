import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { HomeworkService } from '../application/homework.service.js'

const idSchema = z.string().uuid()

const createHomeworkSchema = z.object({
  teacherAssignmentId: z.string().uuid(),
  title: z.string().trim().min(2),
  instructions: z.string().trim().min(5),
  assignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attachmentPath: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

const updateHomeworkSchema = createHomeworkSchema.partial()

export function createHomeworkRouter(dependencies: {
  service: HomeworkService
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

  router.get('/homework', authenticated, globalScope, async (req, res, next) => {
    try {
      const { teacherAssignmentId, status } = req.query
      const list = await dependencies.service.listHomework({
        teacherAssignmentId: teacherAssignmentId ? String(teacherAssignmentId) : undefined,
        status: status ? String(status) : undefined,
      })
      res.json(successResponse(list))
    } catch (err) {
      next(err)
    }
  })

  router.post('/homework', authenticated, permitted('homework.create'), globalScope, async (req, res, next) => {
    try {
      const input = createHomeworkSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const homework = await dependencies.service.createHomework(actorProfileId, input)
      res.status(201).json(successResponse(homework))
    } catch (err) {
      next(err)
    }
  })

  router.get('/homework/:id', authenticated, globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      const item = await dependencies.service.getHomeworkById(id)
      if (!item) return res.status(404).json({ error: 'Homework not found' })
      res.json(successResponse(item))
    } catch (err) {
      next(err)
    }
  })

  router.patch('/homework/:id', authenticated, permitted('homework.create'), globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      const patch = updateHomeworkSchema.parse(req.body)
      const updated = await dependencies.service.updateHomework(id, patch)
      res.json(successResponse(updated))
    } catch (err) {
      next(err)
    }
  })

  router.delete('/homework/:id', authenticated, permitted('homework.create'), globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      await dependencies.service.deleteHomework(id)
      res.json(successResponse({ deleted: true }))
    } catch (err) {
      next(err)
    }
  })

  return router
}
