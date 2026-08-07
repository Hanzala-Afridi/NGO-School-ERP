import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { CommunicationService } from '../application/communication.service.js'

const createConversationSchema = z.object({
  conversationType: z.enum(['parent_teacher', 'parent_admin']).optional(),
  studentId: z.string().uuid(),
  targetProfileId: z.string().uuid().optional(),
})

const sendMessageSchema = z.object({
  body: z.string().min(1),
  attachmentPath: z.string().nullable().optional(),
})

const createComplaintSchema = z.object({
  studentId: z.string().uuid().nullable().optional(),
  category: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
})

const assignComplaintSchema = z.object({
  assignedTeacherId: z.string().uuid().nullable().optional(),
  assignedAdminId: z.string().uuid().nullable().optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  note: z.string().optional(),
})

const resolveComplaintSchema = z.object({
  resolution: z.string().min(1),
})

export function createCommunicationRouter(dependencies: {
  service: CommunicationService
  authentication: AuthenticationService
  authorization: AuthorizationService
  audit: AuditService
}): Router {
  const router = Router()
  const authenticated = authenticate(dependencies.authentication)
  const globalScope = enforceRecordScope(dependencies.authorization, dependencies.audit, () => ({ kind: 'all' }))
  const permitted = (permission: string) => requirePermission(dependencies.authorization, dependencies.audit, permission)

  router.get('/conversations', authenticated, globalScope, async (req, res, next) => {
    try {
      const actorProfileId = req.auth?.profile?.id ?? ''
      const conversations = await dependencies.service.listConversations(actorProfileId)
      res.json(successResponse(conversations))
    } catch (err) {
      next(err)
    }
  })

  router.post('/conversations', authenticated, permitted('messages.send'), globalScope, async (req, res, next) => {
    try {
      const dto = createConversationSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const conv = await dependencies.service.createConversation(actorProfileId, dto)
      res.status(201).json(successResponse(conv))
    } catch (err) {
      next(err)
    }
  })

  router.get('/conversations/:id/messages', authenticated, globalScope, async (req, res, next) => {
    try {
      const convId = String(req.params.id)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const messages = await dependencies.service.getMessages(convId, actorProfileId)
      res.json(successResponse(messages))
    } catch (err) {
      next(err)
    }
  })

  router.post('/conversations/:id/messages', authenticated, permitted('messages.send'), globalScope, async (req, res, next) => {
    try {
      const convId = String(req.params.id)
      const dto = sendMessageSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const message = await dependencies.service.sendMessage(convId, actorProfileId, dto)
      res.status(201).json(successResponse(message))
    } catch (err) {
      next(err)
    }
  })

  router.get('/complaints', authenticated, globalScope, async (req, res, next) => {
    try {
      const parentId = req.query.parentId ? String(req.query.parentId) : undefined
      const teacherId = req.query.teacherId ? String(req.query.teacherId) : undefined
      const complaints = await dependencies.service.listComplaints(parentId, teacherId)
      res.json(successResponse(complaints))
    } catch (err) {
      next(err)
    }
  })

  router.post('/complaints', authenticated, permitted('complaints.submit'), globalScope, async (req, res, next) => {
    try {
      const dto = createComplaintSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const complaint = await dependencies.service.createComplaint(actorProfileId, dto)
      res.status(201).json(successResponse(complaint))
    } catch (err) {
      next(err)
    }
  })

  router.get('/complaints/:id', authenticated, globalScope, async (req, res, next) => {
    try {
      const complaintId = String(req.params.id)
      const complaint = await dependencies.service.getComplaintById(complaintId)
      if (!complaint) {
        res.status(404).json({ success: false, error: { message: 'Complaint not found' } })
        return
      }
      const timeline = await dependencies.service.getComplaintTimeline(complaintId)
      res.json(successResponse({ ...complaint, timeline }))
    } catch (err) {
      next(err)
    }
  })

  router.patch('/complaints/:id/assign', authenticated, permitted('complaints.resolve'), globalScope, async (req, res, next) => {
    try {
      const complaintId = String(req.params.id)
      const dto = assignComplaintSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const complaint = await dependencies.service.assignComplaint(actorProfileId, complaintId, dto)
      res.json(successResponse(complaint))
    } catch (err) {
      next(err)
    }
  })

  router.patch('/complaints/:id/status', authenticated, permitted('complaints.resolve'), globalScope, async (req, res, next) => {
    try {
      const complaintId = String(req.params.id)
      const dto = updateStatusSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const complaint = await dependencies.service.updateComplaintStatus(actorProfileId, complaintId, dto)
      res.json(successResponse(complaint))
    } catch (err) {
      next(err)
    }
  })

  router.post('/complaints/:id/resolve', authenticated, permitted('complaints.resolve'), globalScope, async (req, res, next) => {
    try {
      const complaintId = String(req.params.id)
      const dto = resolveComplaintSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const complaint = await dependencies.service.resolveComplaint(actorProfileId, complaintId, dto)
      res.json(successResponse(complaint))
    } catch (err) {
      next(err)
    }
  })

  return router
}
