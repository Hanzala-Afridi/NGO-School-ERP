import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../../middleware/authenticate.js'
import { WelfareService } from '../application/welfare.service.js'

const createHouseholdSchema = z.object({
  primaryParentId: z.string().uuid().optional().nullable(),
  address: z.string().min(1),
  householdSize: z.number().int().positive(),
  incomeCategory: z.enum(['extremely_low', 'low', 'moderate', 'above_threshold']),
  housingStatus: z.enum(['owned', 'rented', 'temporary', 'homeless']),
  eligibilityStatus: z.enum(['eligible', 'under_review', 'ineligible', 'suspended']).optional(),
  restrictedNotes: z.string().optional().nullable(),
})

const addMemberSchema = z.object({
  fullName: z.string().min(1),
  relationship: z.string().min(1),
  dateOfBirth: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
})

const createAssessmentSchema = z.object({
  householdId: z.string().uuid(),
  assessmentDate: z.string(),
  vulnerabilityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  recommendation: z.string().min(1),
  nextReviewAt: z.string().optional().nullable(),
})

export function createWelfareRouter(dependencies: {
  service: WelfareService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/households', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      const userPermissions: Set<string> = req.auth?.permissions || new Set()
      const hasRead = userPermissions.has('welfare.read')
      if (!hasRead) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden: Missing welfare.read permission' } })
      }
      const hasRestricted = userPermissions.has('welfare.read_restricted')
      const households = await service.listHouseholds(hasRestricted)
      return res.json({ success: true, data: households })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/households', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'welfare.create')
      const dto = createHouseholdSchema.parse(req.body)
      const household = await service.createHousehold(dto)
      return res.status(201).json({ success: true, data: household })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/households/:id', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      const userPermissions: Set<string> = req.auth?.permissions || new Set()
      const hasRead = userPermissions.has('welfare.read')
      if (!hasRead) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden: Missing welfare.read permission' } })
      }
      const hasRestricted = userPermissions.has('welfare.read_restricted')
      const id = String(req.params.id)
      const household = await service.getHouseholdById(id, hasRestricted)
      if (!household) {
        return res.status(404).json({ success: false, error: { message: 'Household not found' } })
      }
      return res.json({ success: true, data: household })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/households/:id/members', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'welfare.update')
      const id = String(req.params.id)
      const dto = addMemberSchema.parse(req.body)
      const member = await service.addHouseholdMember(id, dto)
      return res.status(201).json({ success: true, data: member })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/households/:id/assessments', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'welfare.assess')
      const dto = createAssessmentSchema.parse({ ...req.body, householdId: String(req.params.id) })
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const assessment = await service.createWelfareAssessment(actorId, dto)
      return res.status(201).json({ success: true, data: assessment })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/welfare-assessments/:id/approve', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'welfare.approve')
      const id = String(req.params.id)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const assessment = await service.approveWelfareAssessment(actorId, id)
      return res.json({ success: true, data: assessment })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/parent/welfare', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      const parentId = req.auth?.profile?.id
      if (!parentId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const household = await service.getHouseholdByParentId(parentId)
      if (!household) {
        return res.status(404).json({ success: false, error: { message: 'No linked household profile found' } })
      }

      return res.json({ success: true, data: household })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
