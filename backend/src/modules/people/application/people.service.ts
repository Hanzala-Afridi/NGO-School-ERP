import type {
  Attachment,
  EmploymentStatus,
  Gender,
  Parent,
  ParentRelationship,
  Student,
  StudentParentLink,
  StudentSiblingLink,
  Teacher,
} from '@ngo-school-erp/contracts'

import { AppError } from '../../../shared/app-error.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { PeopleRepository } from '../domain/people.js'

export class PeopleService {
  constructor(
    private readonly repository: PeopleRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Students ─────────────────────────────────────────────────────────────

  listStudents(filter?: {
    schoolId?: string
    status?: string
    gender?: Gender
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: Student[]; total: number }> {
    return this.repository.listStudents(filter)
  }

  async getStudent(id: string): Promise<Student> {
    const student = await this.repository.findStudentById(id)
    if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile was not found')
    return student
  }

  async createStudent(
    actor: AuthContext,
    input: {
      schoolId: string
      studentNumber?: string
      fullName: string
      dateOfBirth: string
      gender: Gender
      admissionDate?: string
      profileImageUrl?: string | null
      address?: string | null
      emergencyNotes?: string | null
    },
  ): Promise<Student> {
    const student = await this.repository.createStudent({
      ...input,
      createdBy: actor.profile.id,
    })
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student.created',
      outcome: 'success',
      entityType: 'student',
      entityId: student.id,
      newValues: { studentNumber: student.studentNumber, fullName: student.fullName },
      sessionId: actor.sessionId,
    })
    return student
  }

  async updateStudent(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      studentNumber: string
      fullName: string
      dateOfBirth: string
      gender: Gender
      admissionDate: string
      profileImageUrl: string | null
      address: string | null
      emergencyNotes: string | null
      status: Student['status']
    }>,
  ): Promise<Student> {
    const previous = await this.getStudent(id)
    const updated = await this.repository.updateStudent(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student.updated',
      outcome: 'success',
      entityType: 'student',
      entityId: id,
      oldValues: { fullName: previous.fullName, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  async archiveStudent(actor: AuthContext, id: string): Promise<Student> {
    const previous = await this.getStudent(id)
    const archived = await this.repository.archiveStudent(id)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student.archived',
      outcome: 'success',
      entityType: 'student',
      entityId: id,
      oldValues: { status: previous.status },
      newValues: { status: 'archived' },
      sessionId: actor.sessionId,
    })
    return archived
  }

  // ── Parents ──────────────────────────────────────────────────────────────

  listParents(filter?: { search?: string; page?: number; limit?: number }): Promise<{ items: Parent[]; total: number }> {
    return this.repository.listParents(filter)
  }

  async getParent(id: string): Promise<Parent> {
    const parent = await this.repository.findParentById(id)
    if (!parent) throw new AppError(404, 'PARENT_NOT_FOUND', 'Parent profile was not found')
    return parent
  }

  async createParent(
    actor: AuthContext,
    input: {
      profileId: string
      fullName: string
      phone?: string | null
      email?: string | null
      occupation?: string | null
      address?: string | null
    },
  ): Promise<Parent> {
    const existing = await this.repository.findParentByProfileId(input.profileId)
    if (existing) throw new AppError(409, 'DUPLICATE_PARENT', 'Parent record already exists for this profile')
    const parent = await this.repository.createParent(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.parent.created',
      outcome: 'success',
      entityType: 'parent',
      entityId: parent.id,
      newValues: { fullName: parent.fullName },
      sessionId: actor.sessionId,
    })
    return parent
  }

  async updateParent(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      fullName: string
      phone: string | null
      email: string | null
      occupation: string | null
      address: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<Parent> {
    const previous = await this.getParent(id)
    const updated = await this.repository.updateParent(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.parent.updated',
      outcome: 'success',
      entityType: 'parent',
      entityId: id,
      oldValues: { fullName: previous.fullName, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Student-Parent Links ─────────────────────────────────────────────────

  listStudentParents(studentId: string): Promise<StudentParentLink[]> {
    return this.repository.listStudentParents(studentId)
  }

  listParentChildren(parentId: string): Promise<StudentParentLink[]> {
    return this.repository.listParentChildren(parentId)
  }

  async linkStudentParent(
    actor: AuthContext,
    input: {
      studentId: string
      parentId: string
      relationship: ParentRelationship
      isPrimary?: boolean
      receivesNotifications?: boolean
      portalAccessEnabled?: boolean
    },
  ): Promise<StudentParentLink> {
    const link = await this.repository.linkStudentParent(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student_parent.linked',
      outcome: 'success',
      entityType: 'student_parent',
      entityId: `${input.studentId}:${input.parentId}`,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return link
  }

  // ── Student Siblings ──────────────────────────────────────────────────────

  listStudentSiblings(studentId: string): Promise<StudentSiblingLink[]> {
    return this.repository.listStudentSiblings(studentId)
  }

  async linkStudentSiblings(actor: AuthContext, studentIdA: string, studentIdB: string): Promise<StudentSiblingLink> {
    const link = await this.repository.linkStudentSiblings(studentIdA, studentIdB)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student_sibling.linked',
      outcome: 'success',
      entityType: 'student_sibling',
      entityId: `${studentIdA}:${studentIdB}`,
      sessionId: actor.sessionId,
    })
    return link
  }

  // ── Teachers ─────────────────────────────────────────────────────────────

  listTeachers(filter?: { employmentStatus?: EmploymentStatus; search?: string; page?: number; limit?: number }): Promise<{ items: Teacher[]; total: number }> {
    return this.repository.listTeachers(filter)
  }

  async getTeacher(id: string): Promise<Teacher> {
    const teacher = await this.repository.findTeacherById(id)
    if (!teacher) throw new AppError(404, 'TEACHER_NOT_FOUND', 'Teacher profile was not found')
    return teacher
  }

  async createTeacher(
    actor: AuthContext,
    input: {
      profileId: string
      employeeNumber?: string
      qualification?: string | null
      joiningDate?: string
      employmentStatus?: EmploymentStatus
    },
  ): Promise<Teacher> {
    const existing = await this.repository.findTeacherByProfileId(input.profileId)
    if (existing) throw new AppError(409, 'DUPLICATE_TEACHER', 'Teacher record already exists for this profile')
    const teacher = await this.repository.createTeacher(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.teacher.created',
      outcome: 'success',
      entityType: 'teacher',
      entityId: teacher.id,
      newValues: { employeeNumber: teacher.employeeNumber },
      sessionId: actor.sessionId,
    })
    return teacher
  }

  async updateTeacher(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      employeeNumber: string
      qualification: string | null
      joiningDate: string
      employmentStatus: EmploymentStatus
    }>,
  ): Promise<Teacher> {
    const previous = await this.getTeacher(id)
    const updated = await this.repository.updateTeacher(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.teacher.updated',
      outcome: 'success',
      entityType: 'teacher',
      entityId: id,
      oldValues: { employeeNumber: previous.employeeNumber, status: previous.employmentStatus },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Student Documents / Attachments ──────────────────────────────────────

  listStudentDocuments(studentId: string): Promise<Attachment[]> {
    return this.repository.listAttachments('student', studentId)
  }

  async createStudentDocument(
    actor: AuthContext,
    input: {
      studentId: string
      fileName: string
      storagePath: string
      mimeType: string
      sizeBytes: number
    },
  ): Promise<Attachment> {
    const attachment = await this.repository.createAttachment({
      entityType: 'student',
      entityId: input.studentId,
      fileName: input.fileName,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedBy: actor.profile.id,
    })
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student_document.uploaded',
      outcome: 'success',
      entityType: 'attachment',
      entityId: attachment.id,
      newValues: { fileName: attachment.fileName, studentId: input.studentId },
      sessionId: actor.sessionId,
    })
    return attachment
  }

  async deleteStudentDocument(actor: AuthContext, documentId: string): Promise<void> {
    const attachment = await this.repository.findAttachmentById(documentId)
    if (!attachment) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document was not found')
    await this.repository.deleteAttachment(documentId)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'people.student_document.deleted',
      outcome: 'success',
      entityType: 'attachment',
      entityId: documentId,
      oldValues: { fileName: attachment.fileName },
      sessionId: actor.sessionId,
    })
  }
}
