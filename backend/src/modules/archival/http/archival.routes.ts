import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../../middleware/authenticate.js'
import { ArchivalService } from '../application/archival.service.js'

const archiveYearSchema = z.object({
  notes: z.string().optional().nullable(),
})

export function createArchivalRouter(dependencies: {
  service: ArchivalService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/archival/academic-years', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'archival.manage')
      const archives = await service.listAcademicYearArchives()
      return res.json({ success: true, data: archives })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/archival/academic-years/:id', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'archival.manage')
      const academicYearId = String(req.params.id)
      const dto = archiveYearSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.archiveAcademicYear(actorId, { academicYearId, notes: dto.notes })
      return res.status(201).json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
