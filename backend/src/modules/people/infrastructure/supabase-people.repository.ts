import type { SupabaseClient } from '@supabase/supabase-js'
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

import type { PeopleRepository } from '../domain/people.js'
import { AppError } from '../../../shared/app-error.js'

function handleDbError(error: { code?: string; message: string }): never {
  if (error.code === '23505') {
    throw new AppError(
      409,
      'DUPLICATE_RESOURCE',
      'A resource with these unique parameters already exists',
    )
  }
  if (error.code === '23514') {
    throw new AppError(422, 'VALIDATION_ERROR', error.message)
  }
  throw new Error(error.message)
}

function mapStudent(row: Record<string, any>): Student {
  return {
    id: row.id,
    schoolId: row.school_id,
    studentNumber: row.student_number,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    admissionDate: row.admission_date,
    profileImageUrl: row.profile_image_url ?? null,
    address: row.address ?? null,
    emergencyNotes: row.emergency_notes ?? null,
    status: row.status,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapParent(row: Record<string, any>): Parent {
  return {
    id: row.id,
    profileId: row.profile_id,
    fullName: row.full_name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    occupation: row.occupation ?? null,
    address: row.address ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapStudentParent(row: Record<string, any>): StudentParentLink {
  return {
    studentId: row.student_id,
    parentId: row.parent_id,
    relationship: row.relationship,
    isPrimary: row.is_primary,
    receivesNotifications: row.receives_notifications,
    portalAccessEnabled: row.portal_access_enabled,
    createdAt: row.created_at,
  }
}

function mapStudentSibling(row: Record<string, any>): StudentSiblingLink {
  return {
    studentIdA: row.student_id_a,
    studentIdB: row.student_id_b,
    createdAt: row.created_at,
  }
}

function mapTeacher(row: Record<string, any>): Teacher {
  return {
    id: row.id,
    profileId: row.profile_id,
    employeeNumber: row.employee_number,
    qualification: row.qualification ?? null,
    joiningDate: row.joining_date,
    employmentStatus: row.employment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAttachment(row: Record<string, any>): Attachment {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    uploadedBy: row.uploaded_by ?? null,
    createdAt: row.created_at,
  }
}

export class SupabasePeopleRepository implements PeopleRepository {
  constructor(private readonly client: SupabaseClient) {}

  // ── Students ─────────────────────────────────────────────────────────────

  async listStudents(filter?: {
    schoolId?: string
    status?: string
    gender?: Gender
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: Student[]; total: number }> {
    let query = this.client.from('students').select('*', { count: 'exact' })
    if (filter?.schoolId) query = query.eq('school_id', filter.schoolId)
    if (filter?.status) query = query.eq('status', filter.status)
    if (filter?.gender) query = query.eq('gender', filter.gender)
    if (filter?.search) {
      const q = `%${filter.search}%`
      query = query.or(`full_name.ilike.${q},student_number.ilike.${q}`)
    }

    const page = filter?.page ?? 1
    const limit = filter?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    const res = await query.order('full_name').range(from, to)
    if (res.error) handleDbError(res.error)
    return {
      items: (res.data ?? []).map(mapStudent),
      total: res.count ?? 0,
    }
  }

  async findStudentById(id: string): Promise<Student | null> {
    const res = await this.client.from('students').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapStudent(res.data) : null
  }

  async findStudentByNumber(studentNumber: string): Promise<Student | null> {
    const res = await this.client.from('students').select('*').eq('student_number', studentNumber).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapStudent(res.data) : null
  }

  async createStudent(input: {
    schoolId: string
    studentNumber?: string
    fullName: string
    dateOfBirth: string
    gender: Gender
    admissionDate?: string
    profileImageUrl?: string | null
    address?: string | null
    emergencyNotes?: string | null
    createdBy?: string | null
  }): Promise<Student> {
    const studentNumber =
      input.studentNumber ??
      `STD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const res = await this.client
      .from('students')
      .insert({
        school_id: input.schoolId,
        student_number: studentNumber,
        full_name: input.fullName,
        date_of_birth: input.dateOfBirth,
        gender: input.gender,
        admission_date: input.admissionDate ?? new Date().toISOString().split('T')[0],
        profile_image_url: input.profileImageUrl ?? null,
        address: input.address ?? null,
        emergency_notes: input.emergencyNotes ?? null,
        created_by: input.createdBy ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapStudent(res.data)
  }

  async updateStudent(
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
    const update: Record<string, any> = {}
    if (patch.studentNumber !== undefined) update.student_number = patch.studentNumber
    if (patch.fullName !== undefined) update.full_name = patch.fullName
    if (patch.dateOfBirth !== undefined) update.date_of_birth = patch.dateOfBirth
    if (patch.gender !== undefined) update.gender = patch.gender
    if (patch.admissionDate !== undefined) update.admission_date = patch.admissionDate
    if (patch.profileImageUrl !== undefined) update.profile_image_url = patch.profileImageUrl
    if (patch.address !== undefined) update.address = patch.address
    if (patch.emergencyNotes !== undefined) update.emergency_notes = patch.emergencyNotes
    if (patch.status !== undefined) update.status = patch.status

    const res = await this.client.from('students').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapStudent(res.data)
  }

  async archiveStudent(id: string): Promise<Student> {
    return this.updateStudent(id, { status: 'archived' })
  }

  // ── Parents ──────────────────────────────────────────────────────────────

  async listParents(filter?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: Parent[]; total: number }> {
    let query = this.client.from('parents').select('*', { count: 'exact' })
    if (filter?.search) {
      const q = `%${filter.search}%`
      query = query.or(`full_name.ilike.${q},phone.ilike.${q},email.ilike.${q}`)
    }
    const page = filter?.page ?? 1
    const limit = filter?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    const res = await query.order('full_name').range(from, to)
    if (res.error) handleDbError(res.error)
    return {
      items: (res.data ?? []).map(mapParent),
      total: res.count ?? 0,
    }
  }

  async findParentById(id: string): Promise<Parent | null> {
    const res = await this.client.from('parents').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapParent(res.data) : null
  }

  async findParentByProfileId(profileId: string): Promise<Parent | null> {
    const res = await this.client.from('parents').select('*').eq('profile_id', profileId).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapParent(res.data) : null
  }

  async createParent(input: {
    profileId: string
    fullName: string
    phone?: string | null
    email?: string | null
    occupation?: string | null
    address?: string | null
  }): Promise<Parent> {
    const res = await this.client
      .from('parents')
      .insert({
        profile_id: input.profileId,
        full_name: input.fullName,
        phone: input.phone ?? null,
        email: input.email ?? null,
        occupation: input.occupation ?? null,
        address: input.address ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapParent(res.data)
  }

  async updateParent(
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
    const update: Record<string, any> = {}
    if (patch.fullName !== undefined) update.full_name = patch.fullName
    if (patch.phone !== undefined) update.phone = patch.phone
    if (patch.email !== undefined) update.email = patch.email
    if (patch.occupation !== undefined) update.occupation = patch.occupation
    if (patch.address !== undefined) update.address = patch.address
    if (patch.status !== undefined) update.status = patch.status

    const res = await this.client.from('parents').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapParent(res.data)
  }

  // ── Student-Parent Links ─────────────────────────────────────────────────

  async listStudentParents(studentId: string): Promise<StudentParentLink[]> {
    const res = await this.client.from('student_parents').select('*').eq('student_id', studentId)
    if (res.error) handleDbError(res.error)
    return (res.data ?? []).map(mapStudentParent)
  }

  async listParentChildren(parentId: string): Promise<StudentParentLink[]> {
    const res = await this.client.from('student_parents').select('*').eq('parent_id', parentId)
    if (res.error) handleDbError(res.error)
    return (res.data ?? []).map(mapStudentParent)
  }

  async linkStudentParent(input: {
    studentId: string
    parentId: string
    relationship: ParentRelationship
    isPrimary?: boolean
    receivesNotifications?: boolean
    portalAccessEnabled?: boolean
  }): Promise<StudentParentLink> {
    const res = await this.client
      .from('student_parents')
      .insert({
        student_id: input.studentId,
        parent_id: input.parentId,
        relationship: input.relationship,
        is_primary: input.isPrimary ?? false,
        receives_notifications: input.receivesNotifications ?? true,
        portal_access_enabled: input.portalAccessEnabled ?? true,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapStudentParent(res.data)
  }

  async updateStudentParentLink(
    studentId: string,
    parentId: string,
    patch: Partial<{
      relationship: ParentRelationship
      isPrimary: boolean
      receivesNotifications: boolean
      portalAccessEnabled: boolean
    }>,
  ): Promise<StudentParentLink> {
    const update: Record<string, any> = {}
    if (patch.relationship !== undefined) update.relationship = patch.relationship
    if (patch.isPrimary !== undefined) update.is_primary = patch.isPrimary
    if (patch.receivesNotifications !== undefined) update.receives_notifications = patch.receivesNotifications
    if (patch.portalAccessEnabled !== undefined) update.portal_access_enabled = patch.portalAccessEnabled

    const res = await this.client
      .from('student_parents')
      .update(update)
      .match({ student_id: studentId, parent_id: parentId })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapStudentParent(res.data)
  }

  // ── Student Siblings ──────────────────────────────────────────────────────

  async listStudentSiblings(studentId: string): Promise<StudentSiblingLink[]> {
    const res = await this.client
      .from('student_siblings')
      .select('*')
      .or(`student_id_a.eq.${studentId},student_id_b.eq.${studentId}`)
    if (res.error) handleDbError(res.error)
    return (res.data ?? []).map(mapStudentSibling)
  }

  async linkStudentSiblings(studentIdA: string, studentIdB: string): Promise<StudentSiblingLink> {
    const res = await this.client
      .from('student_siblings')
      .insert({ student_id_a: studentIdA, student_id_b: studentIdB })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapStudentSibling(res.data)
  }

  // ── Teachers ─────────────────────────────────────────────────────────────

  async listTeachers(filter?: {
    employmentStatus?: EmploymentStatus
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: Teacher[]; total: number }> {
    let query = this.client.from('teachers').select('*', { count: 'exact' })
    if (filter?.employmentStatus) query = query.eq('employment_status', filter.employmentStatus)
    if (filter?.search) {
      const q = `%${filter.search}%`
      query = query.or(`employee_number.ilike.${q}`)
    }
    const page = filter?.page ?? 1
    const limit = filter?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    const res = await query.order('employee_number').range(from, to)
    if (res.error) handleDbError(res.error)
    return {
      items: (res.data ?? []).map(mapTeacher),
      total: res.count ?? 0,
    }
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const res = await this.client.from('teachers').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapTeacher(res.data) : null
  }

  async findTeacherByProfileId(profileId: string): Promise<Teacher | null> {
    const res = await this.client.from('teachers').select('*').eq('profile_id', profileId).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapTeacher(res.data) : null
  }

  async createTeacher(input: {
    profileId: string
    employeeNumber?: string
    qualification?: string | null
    joiningDate?: string
    employmentStatus?: EmploymentStatus
  }): Promise<Teacher> {
    const empNum =
      input.employeeNumber ??
      `EMP-${input.profileId.substring(0, 8).toUpperCase()}`

    const res = await this.client
      .from('teachers')
      .insert({
        profile_id: input.profileId,
        employee_number: empNum,
        qualification: input.qualification ?? null,
        joining_date: input.joiningDate ?? new Date().toISOString().split('T')[0],
        employment_status: input.employmentStatus ?? 'active',
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTeacher(res.data)
  }

  async updateTeacher(
    id: string,
    patch: Partial<{
      employeeNumber: string
      qualification: string | null
      joiningDate: string
      employmentStatus: EmploymentStatus
    }>,
  ): Promise<Teacher> {
    const update: Record<string, any> = {}
    if (patch.employeeNumber !== undefined) update.employee_number = patch.employeeNumber
    if (patch.qualification !== undefined) update.qualification = patch.qualification
    if (patch.joiningDate !== undefined) update.joining_date = patch.joiningDate
    if (patch.employmentStatus !== undefined) update.employment_status = patch.employmentStatus

    const res = await this.client.from('teachers').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapTeacher(res.data)
  }

  // ── Attachments ──────────────────────────────────────────────────────────

  async listAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    const res = await this.client
      .from('attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    if (res.error) handleDbError(res.error)
    return (res.data ?? []).map(mapAttachment)
  }

  async findAttachmentById(id: string): Promise<Attachment | null> {
    const res = await this.client.from('attachments').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    return res.data ? mapAttachment(res.data) : null
  }

  async createAttachment(input: {
    entityType: string
    entityId: string
    fileName: string
    storagePath: string
    mimeType: string
    sizeBytes: number
    uploadedBy?: string | null
  }): Promise<Attachment> {
    const res = await this.client
      .from('attachments')
      .insert({
        entity_type: input.entityType,
        entity_id: input.entityId,
        file_name: input.fileName,
        storage_path: input.storagePath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        uploaded_by: input.uploadedBy ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapAttachment(res.data)
  }

  async deleteAttachment(id: string): Promise<void> {
    const res = await this.client.from('attachments').delete().eq('id', id)
    if (res.error) handleDbError(res.error)
  }
}
