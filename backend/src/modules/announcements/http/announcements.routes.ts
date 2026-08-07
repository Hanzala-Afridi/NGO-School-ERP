import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { AnnouncementsService } from '../application/announcements.service.js'

const idSchema = z.string().uuid()

const createAnnouncementSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().trim().min(2),
  body: z.string().trim().min(5),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  publishAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  targets: z.array(
    z.object({
      targetType: z.enum(['role', 'class', 'all']),
      targetId: z.string().uuid().optional().nullable(),
    }),
  ).optional(),
})

export function createAnnouncementsRouter(dependencies: {
  service: AnnouncementsService
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

  router.get('/announcements', authenticated, globalScope, async (req, res, next) => {
    try {
      const { schoolId, status } = req.query
      const list = await dependencies.service.listAnnouncements(
        schoolId ? String(schoolId) : undefined,
        status ? String(status) : undefined,
      )
      res.json(successResponse(list))
    } catch (err) {
      next(err)
    }
  })

  router.post('/announcements', authenticated, permitted('announcements.create'), globalScope, async (req, res, next) => {
    try {
      const input = createAnnouncementSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const announcement = await dependencies.service.createAnnouncement(actorProfileId, input)
      res.status(201).json(successResponse(announcement))
    } catch (err) {
      next(err)
    }
  })

  router.get('/announcements/:id', authenticated, globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      const announcement = await dependencies.service.getAnnouncementById(id)
      if (!announcement) return res.status(404).json({ error: 'Announcement not found' })
      res.json(successResponse(announcement))
    } catch (err) {
      next(err)
    }
  })

  router.post('/announcements/:id/publish', authenticated, permitted('announcements.publish'), globalScope, async (req, res, next) => {
    try {
      const id = idSchema.parse(req.params.id)
      const updated = await dependencies.service.publishAnnouncement(id)
      res.json(successResponse(updated))
    } catch (err) {
      next(err)
    }
  })

  return router
}
