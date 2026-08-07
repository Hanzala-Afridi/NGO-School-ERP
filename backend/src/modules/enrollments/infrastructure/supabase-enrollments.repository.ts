import type { SupabaseClient } from '@supabase/supabase-js'
import type { Enrollment, EnrollmentStatus } from '@ngo-school-erp/contracts'

import type { EnrollmentsRepository } from '../domain/enrollments.js'
import { AppError } from '../../../shared/app-error.js'

function handleDbError(error: { code?: string; message: string }): never {
  if (error.code === '23505') {
    throw new AppError(
      409,
      'DUPLICATE_RESOURCE',
      'Student already has an active enrollment for this academic year',
    )
  }
  if (error.code === '23514') {
    throw new AppError(422, 'VALIDATION_ERROR', error.message)
  }
  throw new Error(error.message)
}

function mapEnrollment(row: Record<string, any>): Enrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    academicYearId: row.academic_year_id,
    classId: row.class_id,
    sectionId: row.section_id ?? null,
    rollNumber: row.roll_number != null ? Number(row.roll_number) : null,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class SupabaseEnrollmentsRepository implements EnrollmentsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listEnrollments(filter?: {
    studentId?: string
    academicYearId?: string
    classId?: string
    sectionId?: string
    status?: EnrollmentStatus
    page?: number
    limit?: number
  }): Promise<{ items: Enrollment[]; total: number }> {
    let query = this.client.from('enrollments').select('*', { count: 'exact' })
    if (filter?.studentId) query = query.eq('student_id', filter.studentId)
    if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId)
    if (filter?.classId) query = query.eq('class_id', filter.classId)
    if (filter?.sectionId) query = query.eq('section_id', filter.sectionId)
    if (filter?.status) query = query.eq('status', filter.status)

    const page = filter?.page ?? 1
    const limit = filter?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    const res = await query.order('created_at', { ascending: false }).range(from, to)
    if (res.error) handleDbError(res.error)
    return {
      items: (res.data ?? []).map(mapEnrollment),
      total: res.count ?? 0,
    }
  }

  async findEnrollmentById(id: string): Promise<Enrollment | null> {
    const res = await this.client.from('enrollments').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapEnrollment(res.data) : null
  }

  async findActiveEnrollment(studentId: string, academicYearId: string): Promise<Enrollment | null> {
    const res = await this.client
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('academic_year_id', academicYearId)
      .eq('status', 'active')
      .maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapEnrollment(res.data) : null
  }

  async createEnrollment(input: {
    studentId: string
    academicYearId: string
    classId: string
    sectionId?: string | null
    rollNumber?: number | null
    startDate?: string
  }): Promise<Enrollment> {
    const res = await this.client
      .from('enrollments')
      .insert({
        student_id: input.studentId,
        academic_year_id: input.academicYearId,
        class_id: input.classId,
        section_id: input.sectionId ?? null,
        roll_number: input.rollNumber ?? null,
        start_date: input.startDate ?? new Date().toISOString().split('T')[0],
        status: 'active',
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapEnrollment(res.data)
  }

  async updateEnrollment(
    id: string,
    patch: Partial<{
      classId: string
      sectionId: string | null
      rollNumber: number | null
      status: EnrollmentStatus
      endDate: string | null
    }>,
  ): Promise<Enrollment> {
    const update: Record<string, any> = {}
    if (patch.classId !== undefined) update.class_id = patch.classId
    if (patch.sectionId !== undefined) update.section_id = patch.sectionId
    if (patch.rollNumber !== undefined) update.roll_number = patch.rollNumber
    if (patch.status !== undefined) update.status = patch.status
    if (patch.endDate !== undefined) update.end_date = patch.endDate

    const res = await this.client.from('enrollments').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapEnrollment(res.data)
  }
}
