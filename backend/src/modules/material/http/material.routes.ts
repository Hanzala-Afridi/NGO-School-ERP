import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../../middleware/authenticate.js'
import { MaterialService } from '../application/material.service.js'

const issueMaterialSchema = z.object({
  studentId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
  storageLocationId: z.string().uuid(),
  distributionType: z.enum(['uniform', 'shoes', 'textbooks', 'stationery', 'bag']),
  quantity: z.number().int().positive(),
  sizeOrVariant: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  receivedByName: z.string().optional().nullable(),
  replacementOfDistributionId: z.string().uuid().optional().nullable(),
})

export function createMaterialRouter(dependencies: {
  service: MaterialService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/student-distributions', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'material.distribute')
      const studentId = req.query.studentId ? String(req.query.studentId) : undefined
      const distributions = await service.listStudentDistributions(studentId)
      return res.json({ success: true, data: distributions })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/student-distributions', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'material.distribute')
      const dto = issueMaterialSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.issueStudentMaterial(actorId, dto)
      return res.status(201).json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/students/:id/distributions', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      const studentId = String(req.params.id)
      const distributions = await service.listStudentDistributions(studentId)
      return res.json({ success: true, data: distributions })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/student-distributions/:id/approve-replacement', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'material.approve_replacement')
      const id = String(req.params.id)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const distribution = await service.approveReplacement(actorId, id)
      return res.json({ success: true, data: distribution })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
