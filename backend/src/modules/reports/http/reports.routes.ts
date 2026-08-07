import { Request, Response, Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { ReportsService } from '../application/reports.service.js'

export function createReportsRouter(dependencies: {
  service: ReportsService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/reports/dashboard', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      const metrics = await service.getDashboardMetrics()
      return res.json({ success: true, data: metrics })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/students', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.read')
      const report = await service.getStudentsReport()
      return res.json({ success: true, data: report })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/class-strength', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.read')
      const report = await service.getClassStrengthReport()
      return res.json({ success: true, data: report })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/attendance', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.read')
      const report = await service.getAttendanceReport()
      return res.json({ success: true, data: report })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/expenses', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.read')
      const report = await service.getExpensesReport()
      return res.json({ success: true, data: report })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/ration', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.read')
      const report = await service.getRationReport()
      return res.json({ success: true, data: report })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/reports/export', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'reports.export')
      const reportType = req.query.type ? String(req.query.type) : 'students'
      const csv = await service.exportReportCsv(reportType)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`)
      return res.status(200).send(csv)
    } catch (err) {
      return next(err)
    }
  })

  return router
}
