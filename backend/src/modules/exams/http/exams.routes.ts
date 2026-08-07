import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { ExamsService } from '../application/exams.service.js'

const createExamSchema = z.object({
  academicYearId: z.string().uuid(),
  termId: z.string().uuid(),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

const createComponentSchema = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid(),
  examDate: z.string().min(1),
  maximumMarks: z.number().positive(),
  passingMarks: z.number().nonnegative(),
  assessmentType: z.enum(['written', 'oral', 'practical', 'assignment']).optional(),
})

const bulkMarksSchema = z.object({
  results: z.array(
    z.object({
      studentId: z.string().uuid(),
      marksObtained: z.number().nullable().default(null),
      isAbsent: z.boolean().optional(),
      remarks: z.string().nullable().optional(),
    })
  ),
})

export function createExamsRouter(dependencies: {
  service: ExamsService
  authentication: AuthenticationService
  authorization: AuthorizationService
  audit: AuditService
}): Router {
  const router = Router()
  const authenticated = authenticate(dependencies.authentication)
  const globalScope = enforceRecordScope(dependencies.authorization, dependencies.audit, () => ({ kind: 'all' }))
  const permitted = (permission: string) => requirePermission(dependencies.authorization, dependencies.audit, permission)

  router.get('/exams', authenticated, globalScope, async (req, res, next) => {
    try {
      const yearId = req.query.academicYearId ? String(req.query.academicYearId) : undefined
      const termId = req.query.termId ? String(req.query.termId) : undefined
      const exams = await dependencies.service.listExams(yearId, termId)
      res.json(successResponse(exams))
    } catch (err) {
      next(err)
    }
  })

  router.post('/exams', authenticated, permitted('exams.create'), globalScope, async (req, res, next) => {
    try {
      const dto = createExamSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const exam = await dependencies.service.createExam(actorProfileId, dto)
      res.status(201).json(successResponse(exam))
    } catch (err) {
      next(err)
    }
  })

  router.get('/exams/:id', authenticated, globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const exam = await dependencies.service.getExamById(examId)
      if (!exam) {
        res.status(404).json({ success: false, error: { message: 'Exam not found' } })
        return
      }
      res.json(successResponse(exam))
    } catch (err) {
      next(err)
    }
  })

  router.patch('/exams/:id', authenticated, permitted('exams.manage'), globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const statusSchema = z.object({ status: z.enum(['draft', 'scheduled', 'ongoing', 'grading', 'approved', 'published', 'archived']) })
      const { status } = statusSchema.parse(req.body)
      const exam = await dependencies.service.updateExamStatus(examId, status)
      res.json(successResponse(exam))
    } catch (err) {
      next(err)
    }
  })

  router.get('/exams/:id/components', authenticated, globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const classId = req.query.classId ? String(req.query.classId) : undefined
      const sectionId = req.query.sectionId ? String(req.query.sectionId) : undefined
      const components = await dependencies.service.listExamComponents(examId, classId, sectionId)
      res.json(successResponse(components))
    } catch (err) {
      next(err)
    }
  })

  router.post('/exams/:id/components', authenticated, permitted('exams.manage'), globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const dto = createComponentSchema.parse(req.body)
      const component = await dependencies.service.createExamComponent({ ...dto, examId })
      res.status(201).json(successResponse(component))
    } catch (err) {
      next(err)
    }
  })

  router.get('/exam-components/:id/results', authenticated, globalScope, async (req, res, next) => {
    try {
      const componentId = String(req.params.id)
      const results = await dependencies.service.getComponentResults(componentId)
      res.json(successResponse(results))
    } catch (err) {
      next(err)
    }
  })

  router.put('/exam-components/:id/results', authenticated, permitted('marks.enter'), globalScope, async (req, res, next) => {
    try {
      const componentId = String(req.params.id)
      const dto = bulkMarksSchema.parse(req.body)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const results = await dependencies.service.bulkEnterMarks(actorProfileId, {
        componentId,
        results: dto.results.map((r) => ({ ...r, marksObtained: r.marksObtained ?? null })),
      })
      res.json(successResponse(results))
    } catch (err) {
      next(err)
    }
  })

  router.post('/exams/:id/approve', authenticated, permitted('results.approve'), globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const exam = await dependencies.service.approveExamResults(actorProfileId, examId)
      res.json(successResponse(exam))
    } catch (err) {
      next(err)
    }
  })

  router.post('/exams/:id/publish', authenticated, permitted('results.publish'), globalScope, async (req, res, next) => {
    try {
      const examId = String(req.params.id)
      const actorProfileId = req.auth?.profile?.id ?? ''
      const exam = await dependencies.service.publishExamResults(actorProfileId, examId)
      res.json(successResponse(exam))
    } catch (err) {
      next(err)
    }
  })

  router.get('/students/:id/report-card', authenticated, globalScope, async (req, res, next) => {
    try {
      const studentId = String(req.params.id)
      const examId = req.query.examId ? String(req.query.examId) : ''
      if (!examId) {
        res.status(400).json({ success: false, error: { message: 'examId query parameter is required' } })
        return
      }
      const reportCard = await dependencies.service.getStudentReportCard(studentId, examId)
      if (!reportCard) {
        res.status(404).json({ success: false, error: { message: 'Report card not found or not published' } })
        return
      }
      res.json(successResponse(reportCard))
    } catch (err) {
      next(err)
    }
  })

  router.get('/parents/me/children/:studentId/results', authenticated, globalScope, async (req, res, next) => {
    try {
      const studentId = String(req.params.studentId)
      const results = await dependencies.service.getParentChildResults(studentId)
      res.json(successResponse(results))
    } catch (err) {
      next(err)
    }
  })

  return router
}
