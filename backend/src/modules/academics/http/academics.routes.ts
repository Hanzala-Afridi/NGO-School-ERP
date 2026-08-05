import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { AcademicsService } from '../application/academics.service.js'

// ── Validation schemas ─────────────────────────────────────────────────────

const idSchema = z.string().uuid()
const statusSchema = z.enum(['active', 'inactive'])

const schoolUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric')
      .optional(),
    address: z.string().trim().max(500).nullable().optional(),
    phone: z.string().trim().max(50).nullable().optional(),
    email: z.string().email().max(320).nullable().optional(),
    logoUrl: z.string().url().max(2048).nullable().optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const campusCreateSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric'),
  address: z.string().trim().max(500).nullable().optional(),
})

const campusUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric')
      .optional(),
    address: z.string().trim().max(500).nullable().optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const academicYearCreateSchema = z
  .object({
    schoolId: z.string().uuid(),
    name: z.string().trim().min(1).max(100),
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })

const academicYearUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')
  .refine(
    (v) => !v.startDate || !v.endDate || new Date(v.endDate) > new Date(v.startDate),
    {
      message: 'endDate must be after startDate',
      path: ['endDate'],
    },
  )

const termCreateSchema = z
  .object({
    academicYearId: z.string().uuid(),
    name: z.string().trim().min(1).max(100),
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })

const termUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')
  .refine(
    (v) => !v.startDate || !v.endDate || new Date(v.endDate) > new Date(v.startDate),
    {
      message: 'endDate must be after startDate',
      path: ['endDate'],
    },
  )

const classCreateSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric'),
  gradeOrder: z.number().int().min(1),
})

const classUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric')
      .optional(),
    gradeOrder: z.number().int().min(1).optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const sectionCreateSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  capacity: z.number().int().min(1).nullable().optional(),
})

const sectionUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    capacity: z.number().int().min(1).nullable().optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const subjectCreateSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric'),
})

const subjectUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    code: z
      .string()
      .trim()
      .regex(/^[A-Z0-9_-]{1,20}$/, 'Code must be uppercase alphanumeric')
      .optional(),
    status: statusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const schoolIdFilter = z.object({ schoolId: z.string().uuid().optional() })
const academicYearIdFilter = z.object({ academicYearId: z.string().uuid().optional() })
const classIdFilter = z.object({ classId: z.string().uuid().optional() })

// ── Router factory ─────────────────────────────────────────────────────────

export function createAcademicsRouter(dependencies: {
  service: AcademicsService
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

  // ── Schools ──────────────────────────────────────────────────────────────

  router.get(
    '/schools',
    authenticated,
    permitted('schools.read'),
    globalScope,
    async (request, response) => {
      response.json(successResponse(await dependencies.service.listSchools()))
    },
  )

  router.get(
    '/schools/:id',
    authenticated,
    permitted('schools.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getSchool(idSchema.parse(request.params.id))),
      )
    },
  )

  router.patch(
    '/schools/:id',
    authenticated,
    permitted('schools.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateSchool(
            request.auth!,
            idSchema.parse(request.params.id),
            schoolUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Campuses ─────────────────────────────────────────────────────────────

  router.get(
    '/campuses',
    authenticated,
    permitted('campuses.read'),
    globalScope,
    async (request, response) => {
      const { schoolId } = schoolIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listCampuses({ schoolId })))
    },
  )

  router.get(
    '/campuses/:id',
    authenticated,
    permitted('campuses.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getCampus(idSchema.parse(request.params.id))),
      )
    },
  )

  router.post(
    '/campuses',
    authenticated,
    permitted('campuses.update'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createCampus(
              request.auth!,
              campusCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/campuses/:id',
    authenticated,
    permitted('campuses.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateCampus(
            request.auth!,
            idSchema.parse(request.params.id),
            campusUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Academic Years ────────────────────────────────────────────────────────

  router.get(
    '/academic-years',
    authenticated,
    permitted('academic_years.read'),
    globalScope,
    async (request, response) => {
      const { schoolId } = schoolIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listAcademicYears({ schoolId })))
    },
  )

  router.get(
    '/academic-years/:id',
    authenticated,
    permitted('academic_years.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.getAcademicYear(idSchema.parse(request.params.id)),
        ),
      )
    },
  )

  router.post(
    '/academic-years',
    authenticated,
    permitted('academic_years.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createAcademicYear(
              request.auth!,
              academicYearCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/academic-years/:id',
    authenticated,
    permitted('academic_years.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateAcademicYear(
            request.auth!,
            idSchema.parse(request.params.id),
            academicYearUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Terms ─────────────────────────────────────────────────────────────────

  router.get(
    '/terms',
    authenticated,
    permitted('terms.read'),
    globalScope,
    async (request, response) => {
      const { academicYearId } = academicYearIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listTerms({ academicYearId })))
    },
  )

  router.get(
    '/terms/:id',
    authenticated,
    permitted('terms.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getTerm(idSchema.parse(request.params.id))),
      )
    },
  )

  router.post(
    '/terms',
    authenticated,
    permitted('terms.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createTerm(
              request.auth!,
              termCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/terms/:id',
    authenticated,
    permitted('terms.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateTerm(
            request.auth!,
            idSchema.parse(request.params.id),
            termUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Classes ───────────────────────────────────────────────────────────────

  router.get(
    '/classes',
    authenticated,
    permitted('classes.read'),
    globalScope,
    async (request, response) => {
      const { schoolId } = schoolIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listClasses({ schoolId })))
    },
  )

  router.get(
    '/classes/:id',
    authenticated,
    permitted('classes.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getClass(idSchema.parse(request.params.id))),
      )
    },
  )

  router.post(
    '/classes',
    authenticated,
    permitted('classes.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createClass(
              request.auth!,
              classCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/classes/:id',
    authenticated,
    permitted('classes.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateClass(
            request.auth!,
            idSchema.parse(request.params.id),
            classUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Sections ──────────────────────────────────────────────────────────────

  router.get(
    '/sections',
    authenticated,
    permitted('sections.read'),
    globalScope,
    async (request, response) => {
      const { classId } = classIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listSections({ classId })))
    },
  )

  router.get(
    '/sections/:id',
    authenticated,
    permitted('sections.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getSection(idSchema.parse(request.params.id))),
      )
    },
  )

  router.post(
    '/sections',
    authenticated,
    permitted('sections.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createSection(
              request.auth!,
              sectionCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/sections/:id',
    authenticated,
    permitted('sections.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateSection(
            request.auth!,
            idSchema.parse(request.params.id),
            sectionUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  // ── Subjects ──────────────────────────────────────────────────────────────

  router.get(
    '/subjects',
    authenticated,
    permitted('subjects.read'),
    globalScope,
    async (request, response) => {
      const { schoolId } = schoolIdFilter.parse(request.query)
      response.json(successResponse(await dependencies.service.listSubjects({ schoolId })))
    },
  )

  router.get(
    '/subjects/:id',
    authenticated,
    permitted('subjects.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.getSubject(idSchema.parse(request.params.id))),
      )
    },
  )

  router.post(
    '/subjects',
    authenticated,
    permitted('subjects.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createSubject(
              request.auth!,
              subjectCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )

  router.patch(
    '/subjects/:id',
    authenticated,
    permitted('subjects.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateSubject(
            request.auth!,
            idSchema.parse(request.params.id),
            subjectUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )

  return router
}
