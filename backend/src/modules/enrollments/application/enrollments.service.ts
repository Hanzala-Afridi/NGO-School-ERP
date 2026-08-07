import type { Enrollment, EnrollmentStatus } from '@ngo-school-erp/contracts'

import { AppError } from '../../../shared/app-error.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { PeopleRepository } from '../../people/domain/people.js'
import type { EnrollmentsRepository } from '../domain/enrollments.js'

export class EnrollmentsService {
  constructor(
    private readonly repository: EnrollmentsRepository,
    private readonly peopleRepo: PeopleRepository,
    private readonly audit: AuditService,
  ) {}

  listEnrollments(filter?: {
    studentId?: string
    academicYearId?: string
    classId?: string
    sectionId?: string
    status?: EnrollmentStatus
    page?: number
    limit?: number
  }): Promise<{ items: Enrollment[]; total: number }> {
    return this.repository.listEnrollments(filter)
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    const enrollment = await this.repository.findEnrollmentById(id)
    if (!enrollment) throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment record was not found')
    return enrollment
  }

  async createEnrollment(
    actor: AuthContext,
    input: {
      studentId: string
      academicYearId: string
      classId: string
      sectionId?: string | null
      rollNumber?: number | null
      startDate?: string
    },
  ): Promise<Enrollment> {
    const active = await this.repository.findActiveEnrollment(input.studentId, input.academicYearId)
    if (active) {
      throw new AppError(409, 'ACTIVE_ENROLLMENT_EXISTS', 'Student already has an active enrollment for this academic year')
    }
    const enrollment = await this.repository.createEnrollment(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'enrollment.created',
      outcome: 'success',
      entityType: 'enrollment',
      entityId: enrollment.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return enrollment
  }

  async updateEnrollment(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      classId: string
      sectionId: string | null
      rollNumber: number | null
      status: EnrollmentStatus
      endDate: string | null
    }>,
  ): Promise<Enrollment> {
    const previous = await this.getEnrollment(id)
    const updated = await this.repository.updateEnrollment(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'enrollment.updated',
      outcome: 'success',
      entityType: 'enrollment',
      entityId: id,
      oldValues: { status: previous.status, rollNumber: previous.rollNumber },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  async promoteEnrollment(
    actor: AuthContext,
    id: string,
    input: {
      targetAcademicYearId: string
      targetClassId: string
      targetSectionId?: string | null
      newRollNumber?: number | null
    },
  ): Promise<Enrollment> {
    const current = await this.getEnrollment(id)
    if (current.status !== 'active') {
      throw new AppError(400, 'INVALID_ENROLLMENT_STATUS', 'Only active enrollments can be promoted')
    }
    const today = new Date().toISOString().split('T')[0]
    // Step 1: Close current enrollment
    await this.repository.updateEnrollment(id, {
      status: 'promoted',
      endDate: today,
    })
    // Step 2: Create new promoted enrollment
    const newEnrollment = await this.repository.createEnrollment({
      studentId: current.studentId,
      academicYearId: input.targetAcademicYearId,
      classId: input.targetClassId,
      sectionId: input.targetSectionId ?? null,
      rollNumber: input.newRollNumber ?? null,
      startDate: today,
    })
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'enrollment.promoted',
      outcome: 'success',
      entityType: 'enrollment',
      entityId: id,
      oldValues: { classId: current.classId, academicYearId: current.academicYearId },
      newValues: { newEnrollmentId: newEnrollment.id, targetClassId: input.targetClassId },
      sessionId: actor.sessionId,
    })
    return newEnrollment
  }

  async transferEnrollment(
    actor: AuthContext,
    id: string,
    input: {
      targetClassId?: string
      targetSectionId: string
      newRollNumber?: number | null
    },
  ): Promise<Enrollment> {
    const current = await this.getEnrollment(id)
    if (current.status !== 'active') {
      throw new AppError(400, 'INVALID_ENROLLMENT_STATUS', 'Only active enrollments can be transferred')
    }
    const today = new Date().toISOString().split('T')[0]
    const targetClassId = input.targetClassId ?? current.classId
    // Close current enrollment
    await this.repository.updateEnrollment(id, {
      status: 'transferred',
      endDate: today,
    })
    // Create new transfer enrollment in target class/section
    const newEnrollment = await this.repository.createEnrollment({
      studentId: current.studentId,
      academicYearId: current.academicYearId,
      classId: targetClassId,
      sectionId: input.targetSectionId,
      rollNumber: input.newRollNumber ?? null,
      startDate: today,
    })
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'enrollment.transferred',
      outcome: 'success',
      entityType: 'enrollment',
      entityId: id,
      oldValues: { classId: current.classId, sectionId: current.sectionId },
      newValues: { targetClassId, targetSectionId: input.targetSectionId },
      sessionId: actor.sessionId,
    })
    return newEnrollment
  }

  async withdrawEnrollment(
    actor: AuthContext,
    id: string,
    input?: { reason?: string },
  ): Promise<Enrollment> {
    const current = await this.getEnrollment(id)
    const today = new Date().toISOString().split('T')[0]
    const updated = await this.repository.updateEnrollment(id, {
      status: 'withdrawn',
      endDate: today,
    })
    await this.peopleRepo.updateStudent(current.studentId, { status: 'withdrawn' })
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'enrollment.withdrawn',
      outcome: 'success',
      entityType: 'enrollment',
      entityId: id,
      oldValues: { status: current.status },
      newValues: { status: 'withdrawn', reason: input?.reason ?? null },
      sessionId: actor.sessionId,
    })
    return updated
  }
}
