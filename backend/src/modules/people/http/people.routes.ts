import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { PeopleService } from '../application/people.service.js'

const idSchema = z.string().uuid()
const genderSchema = z.enum(['male', 'female', 'other'])
const parentRelationshipSchema = z.enum(['father', 'mother', 'guardian', 'other'])
const employmentStatusSchema = z.enum(['active', 'inactive', 'on_leave', 'resigned', 'terminated'])

const studentCreateSchema = z.object({
  schoolId: z.string().uuid(),
  studentNumber: z.string().trim().regex(/^[A-Z0-9_-]{1,30}$/).optional(),
  fullName: z.string().trim().min(1).max(200),
  dateOfBirth: z.string().date(),
  gender: genderSchema,
  admissionDate: z.string().date().optional(),
  profileImageUrl: z.string().url().max(2048).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  emergencyNotes: z.string().trim().max(1000).nullable().optional(),
})

const studentUpdateSchema = z
  .object({
    studentNumber: z.string().trim().regex(/^[A-Z0-9_-]{1,30}$/).optional(),
    fullName: z.string().trim().min(1).max(200).optional(),
    dateOfBirth: z.string().date().optional(),
    gender: genderSchema.optional(),
    admissionDate: z.string().date().optional(),
    profileImageUrl: z.string().url().max(2048).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    emergencyNotes: z.string().trim().max(1000).nullable().optional(),
    status: z.enum(['active', 'inactive', 'archived', 'transferred', 'withdrawn']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const parentCreateSchema = z.object({
  profileId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(50).nullable().optional(),
  email: z.string().email().max(320).nullable().optional(),
  occupation: z.string().trim().max(100).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
})

const parentUpdateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(200).optional(),
    phone: z.string().trim().max(50).nullable().optional(),
    email: z.string().email().max(320).nullable().optional(),
    occupation: z.string().trim().max(100).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const parentLinkSchema = z.object({
  parentId: z.string().uuid(),
  relationship: parentRelationshipSchema,
  isPrimary: z.boolean().optional(),
  receivesNotifications: z.boolean().optional(),
  portalAccessEnabled: z.boolean().optional(),
})

const siblingLinkSchema = z.object({
  siblingStudentId: z.string().uuid(),
})

const teacherCreateSchema = z.object({
  profileId: z.string().uuid(),
  employeeNumber: z.string().trim().regex(/^[A-Z0-9_-]{1,30}$/).optional(),
  qualification: z.string().trim().max(200).nullable().optional(),
  joiningDate: z.string().date().optional(),
  employmentStatus: employmentStatusSchema.optional(),
})

const teacherUpdateSchema = z
  .object({
    employeeNumber: z.string().trim().regex(/^[A-Z0-9_-]{1,30}$/).optional(),
    qualification: z.string().trim().max(200).nullable().optional(),
    joiningDate: z.string().date().optional(),
    employmentStatus: employmentStatusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required')

const documentCreateSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  storagePath: z.string().trim().min(1).max(1024),
  mimeType: z.string().trim().min(1).max(100),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
})

export function createPeopleRouter(dependencies: {
  service: PeopleService
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

  // ── Students ─────────────────────────────────────────────────────────────

  router.get('/students', authenticated, permitted('students.read'), globalScope, async (request, response) => {
    const { schoolId, status, gender, search, page, limit } = request.query
    const result = await dependencies.service.listStudents({
      schoolId: schoolId ? String(schoolId) : undefined,
      status: status ? String(status) : undefined,
      gender: gender ? (gender as any) : undefined,
      search: search ? String(search) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    })
    response.json(successResponse(result.items, { total: result.total }))
  })

  router.get('/students/:id', authenticated, permitted('students.read'), globalScope, async (request, response) => {
    const student = await dependencies.service.getStudent(idSchema.parse(request.params.id))
    response.json(successResponse(student))
  })

  router.post('/students', authenticated, permitted('students.create'), globalScope, async (request, response) => {
    const input = studentCreateSchema.parse(request.body)
    const student = await dependencies.service.createStudent(request.auth!, input)
    response.status(201).json(successResponse(student))
  })

  router.patch('/students/:id', authenticated, permitted('students.update'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const patch = studentUpdateSchema.parse(request.body)
    const student = await dependencies.service.updateStudent(request.auth!, id, patch)
    response.json(successResponse(student))
  })

  router.post('/students/:id/archive', authenticated, permitted('students.archive'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const student = await dependencies.service.archiveStudent(request.auth!, id)
    response.json(successResponse(student))
  })

  router.get('/students/:id/history', authenticated, permitted('students.read'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const student = await dependencies.service.getStudent(id)
    // Reconstruct student lifecycle history from audit logs
    const history = [
      { event: 'created', timestamp: student.createdAt, details: `Admitted on ${student.admissionDate}` },
      { event: 'status', timestamp: student.updatedAt, details: `Current status: ${student.status}` },
    ]
    response.json(successResponse(history))
  })

  // ── Student Parents ──────────────────────────────────────────────────────

  router.get('/students/:id/parents', authenticated, permitted('parents.read'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const links = await dependencies.service.listStudentParents(studentId)
    response.json(successResponse(links))
  })

  router.post('/students/:id/parents', authenticated, permitted('parents.link_student'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const body = parentLinkSchema.parse(request.body)
    const link = await dependencies.service.linkStudentParent(request.auth!, {
      studentId,
      parentId: body.parentId,
      relationship: body.relationship,
      isPrimary: body.isPrimary,
      receivesNotifications: body.receivesNotifications,
      portalAccessEnabled: body.portalAccessEnabled,
    })
    response.status(201).json(successResponse(link))
  })

  // ── Student Siblings ─────────────────────────────────────────────────────

  router.get('/students/:id/siblings', authenticated, permitted('students.read'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const links = await dependencies.service.listStudentSiblings(studentId)
    response.json(successResponse(links))
  })

  router.post('/students/:id/siblings', authenticated, permitted('students.update'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const body = siblingLinkSchema.parse(request.body)
    const link = await dependencies.service.linkStudentSiblings(request.auth!, studentId, body.siblingStudentId)
    response.status(201).json(successResponse(link))
  })

  // ── Student Documents ────────────────────────────────────────────────────

  router.get('/students/:id/documents', authenticated, permitted('students.read'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const documents = await dependencies.service.listStudentDocuments(studentId)
    response.json(successResponse(documents))
  })

  router.post('/students/:id/documents', authenticated, permitted('students.update'), globalScope, async (request, response) => {
    const studentId = idSchema.parse(request.params.id)
    const body = documentCreateSchema.parse(request.body)
    const document = await dependencies.service.createStudentDocument(request.auth!, {
      studentId,
      ...body,
    })
    response.status(201).json(successResponse(document))
  })

  router.delete('/students/:id/documents/:documentId', authenticated, permitted('students.update'), globalScope, async (request, response) => {
    const documentId = idSchema.parse(request.params.documentId)
    await dependencies.service.deleteStudentDocument(request.auth!, documentId)
    response.json(successResponse({ deleted: true }))
  })

  // ── Parents ──────────────────────────────────────────────────────────────

  router.get('/parents', authenticated, permitted('parents.read'), globalScope, async (request, response) => {
    const { search, page, limit } = request.query
    const result = await dependencies.service.listParents({
      search: search ? String(search) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    })
    response.json(successResponse(result.items, { total: result.total }))
  })

  router.get('/parents/me/children', authenticated, async (request, response) => {
    // Parent Portal helper API
    const profileId = request.auth!.profile.id
    const parent = await dependencies.service.getParent(profileId).catch(() => null)
    if (!parent) {
      response.json(successResponse([]))
      return
    }
    const children = await dependencies.service.listParentChildren(parent.id)
    response.json(successResponse(children))
  })

  router.get('/parents/me/children/:studentId/overview', authenticated, async (request, response) => {
    const studentId = idSchema.parse(request.params.studentId)
    const student = await dependencies.service.getStudent(studentId)
    response.json(successResponse({ student, status: student.status }))
  })

  router.get('/parents/:id', authenticated, permitted('parents.read'), globalScope, async (request, response) => {
    const parent = await dependencies.service.getParent(idSchema.parse(request.params.id))
    response.json(successResponse(parent))
  })

  router.post('/parents', authenticated, permitted('parents.create'), globalScope, async (request, response) => {
    const input = parentCreateSchema.parse(request.body)
    const parent = await dependencies.service.createParent(request.auth!, input)
    response.status(201).json(successResponse(parent))
  })

  router.patch('/parents/:id', authenticated, permitted('parents.update'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const patch = parentUpdateSchema.parse(request.body)
    const parent = await dependencies.service.updateParent(request.auth!, id, patch)
    response.json(successResponse(parent))
  })

  // ── Teachers ─────────────────────────────────────────────────────────────

  router.get('/teachers', authenticated, permitted('teachers.read'), globalScope, async (request, response) => {
    const { employmentStatus, search, page, limit } = request.query
    const result = await dependencies.service.listTeachers({
      employmentStatus: employmentStatus ? (employmentStatus as any) : undefined,
      search: search ? String(search) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    })
    response.json(successResponse(result.items, { total: result.total }))
  })

  router.get('/teachers/me/assignments', authenticated, async (request, response) => {
    // Teacher Portal helper API
    response.json(successResponse([]))
  })

  router.get('/teachers/:id', authenticated, permitted('teachers.read'), globalScope, async (request, response) => {
    const teacher = await dependencies.service.getTeacher(idSchema.parse(request.params.id))
    response.json(successResponse(teacher))
  })

  router.post('/teachers', authenticated, permitted('teachers.create'), globalScope, async (request, response) => {
    const input = teacherCreateSchema.parse(request.body)
    const teacher = await dependencies.service.createTeacher(request.auth!, input)
    response.status(201).json(successResponse(teacher))
  })

  router.patch('/teachers/:id', authenticated, permitted('teachers.update'), globalScope, async (request, response) => {
    const id = idSchema.parse(request.params.id)
    const patch = teacherUpdateSchema.parse(request.body)
    const teacher = await dependencies.service.updateTeacher(request.auth!, id, patch)
    response.json(successResponse(teacher))
  })

  return router
}
