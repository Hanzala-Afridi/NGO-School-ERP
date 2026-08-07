import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../../middleware/authenticate.js'
import { RationService } from '../application/ration.service.js'

const createPackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  items: z.array(
    z.object({
      inventoryItemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
})

const createCycleSchema = z.object({
  name: z.string().min(1),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2026),
  distributionStart: z.string().min(1),
  distributionEnd: z.string().min(1),
})

const issueRationSchema = z.object({
  allocationId: z.string().uuid(),
  distributionMethod: z.enum(['collection', 'home_delivery']),
  receivedByName: z.string().optional().nullable(),
  acknowledgmentPath: z.string().optional().nullable(),
})

const reverseRationSchema = z.object({
  reversalReason: z.string().min(1),
})

export function createRationRouter(dependencies: {
  service: RationService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/ration/packages', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const pkgs = await service.listPackages()
      return res.json({ success: true, data: pkgs })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/packages', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const dto = createPackageSchema.parse(req.body)
      const pkg = await service.createPackage(dto)
      return res.status(201).json({ success: true, data: pkg })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/ration/cycles', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const cycles = await service.listCycles()
      return res.json({ success: true, data: cycles })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/cycles', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const dto = createCycleSchema.parse(req.body)
      const cycle = await service.createCycle(dto)
      return res.status(201).json({ success: true, data: cycle })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/cycles/:id/generate-allocations', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const cycleId = String(req.params.id)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.generateAllocations(cycleId, actorId)
      return res.json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/ration/cycles/:id/allocations', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.manage')
      const cycleId = String(req.params.id)
      const allocations = await service.listAllocations(cycleId)
      return res.json({ success: true, data: allocations })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/allocations/:id/approve', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.approve')
      const id = String(req.params.id)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const allocation = await service.approveAllocation(actorId, id)
      return res.json({ success: true, data: allocation })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/allocations/:id/issue', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.issue')
      const dto = issueRationSchema.parse({ ...req.body, allocationId: String(req.params.id) })
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.issueRation(actorId, dto)
      return res.status(201).json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/ration/distributions/:id/reverse', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'ration.reverse')
      const id = String(req.params.id)
      const dto = reverseRationSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.reverseRation(actorId, id, dto)
      return res.json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
