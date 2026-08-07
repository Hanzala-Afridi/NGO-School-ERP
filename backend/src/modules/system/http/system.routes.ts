import { Request, Response, Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { SystemService } from '../application/system.service.js'

export function createSystemRouter(dependencies: {
  service: SystemService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/health/system-diagnostics', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'system.diagnostics')
      const diagnostics = await service.getDiagnostics()
      return res.json({ success: true, data: diagnostics })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/system/audit-logs', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'audit.read')
      const filter = {
        actorProfileId: req.query.actorProfileId ? String(req.query.actorProfileId) : undefined,
        action: req.query.action ? String(req.query.action) : undefined,
        entityType: req.query.entityType ? String(req.query.entityType) : undefined,
        startDate: req.query.startDate ? String(req.query.startDate) : undefined,
        endDate: req.query.endDate ? String(req.query.endDate) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
      }

      const logs = await service.listAuditLogs(filter)
      return res.json({ success: true, data: logs })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/system/audit-logs/export', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'audit.export')
      const filter = {
        actorProfileId: req.query.actorProfileId ? String(req.query.actorProfileId) : undefined,
        action: req.query.action ? String(req.query.action) : undefined,
        entityType: req.query.entityType ? String(req.query.entityType) : undefined,
      }

      const csv = await service.exportAuditLogsCsv(filter)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
      return res.status(200).send(csv)
    } catch (err) {
      return next(err)
    }
  })

  return router
}
