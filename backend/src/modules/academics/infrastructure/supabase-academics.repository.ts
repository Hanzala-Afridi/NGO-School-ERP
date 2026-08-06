import type {
  AcademicYear,
  Campus,
  Class,
  EntityStatus,
  School,
  Section,
  Subject,
  TeacherAssignment,
  Term,
  TimetableEntry,
} from '@ngo-school-erp/contracts'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { AcademicsRepository } from '../domain/academics.js'
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

// ── Row types ─────────────────────────────────────────────────────────────────

type SchoolRow = {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  status: EntityStatus
  created_at: string
  updated_at: string
}

type CampusRow = {
  id: string
  school_id: string
  name: string
  code: string
  address: string | null
  status: EntityStatus
  created_at: string
  updated_at: string
}

type AcademicYearRow = {
  id: string
  school_id: string
  name: string
  start_date: string
  end_date: string
  status: EntityStatus
  created_at: string
  updated_at: string
}

type TermRow = {
  id: string
  academic_year_id: string
  name: string
  start_date: string
  end_date: string
  status: EntityStatus
  created_at: string
  updated_at: string
}

type ClassRow = {
  id: string
  school_id: string
  name: string
  code: string
  grade_order: number
  status: EntityStatus
  created_at: string
  updated_at: string
}

type SectionRow = {
  id: string
  class_id: string
  name: string
  capacity: number | null
  status: EntityStatus
  created_at: string
  updated_at: string
}

type SubjectRow = {
  id: string
  school_id: string
  name: string
  code: string
  status: EntityStatus
  created_at: string
  updated_at: string
}

type TeacherAssignmentRow = {
  id: string
  teacher_id: string
  academic_year_id: string
  class_id: string
  section_id: string | null
  subject_id: string | null
  is_class_teacher: boolean
  status: EntityStatus
  created_at: string
  updated_at: string
}

type TimetableEntryRow = {
  id: string
  academic_year_id: string
  class_id: string
  section_id: string | null
  subject_id: string
  teacher_id: string | null
  weekday: number
  start_time: string
  end_time: string
  room: string | null
  status: EntityStatus
  created_at: string
  updated_at: string
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapSchool(row: SchoolRow): School {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logo_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapCampus(row: CampusRow): Campus {
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    code: row.code,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAcademicYear(row: AcademicYearRow): AcademicYear {
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTerm(row: TermRow): Term {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapClass(row: ClassRow): Class {
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    code: row.code,
    gradeOrder: row.grade_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSection(row: SectionRow): Section {
  return {
    id: row.id,
    classId: row.class_id,
    name: row.name,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    code: row.code,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTeacherAssignment(row: TeacherAssignmentRow): TeacherAssignment {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    academicYearId: row.academic_year_id,
    classId: row.class_id,
    sectionId: row.section_id,
    subjectId: row.subject_id,
    isClassTeacher: row.is_class_teacher,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTimetableEntry(row: TimetableEntryRow): TimetableEntry {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    classId: row.class_id,
    sectionId: row.section_id,
    subjectId: row.subject_id,
    teacherId: row.teacher_id,
    weekday: row.weekday,
    startTime: row.start_time,
    endTime: row.end_time,
    room: row.room,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ── Repository ────────────────────────────────────────────────────────────────

export class SupabaseAcademicsRepository implements AcademicsRepository {
  constructor(private readonly client: SupabaseClient) {}

  // ── Schools ──────────────────────────────────────────────────────────────

  async listSchools(): Promise<School[]> {
    const res = await this.client.from('schools').select('*').order('name')
    if (res.error) handleDbError(res.error)
    const rows = res.data as SchoolRow[]
    return rows.map(mapSchool)
  }

  async findSchoolById(id: string): Promise<School | null> {
    const res = await this.client.from('schools').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapSchool(res.data as SchoolRow)
  }

  async createSchool(input: {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
  }): Promise<School> {
    const res = await this.client
      .from('schools')
      .insert({
        name: input.name,
        code: input.code,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        logo_url: input.logoUrl ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapSchool(res.data as SchoolRow)
  }

  async updateSchool(
    id: string,
    patch: Partial<{
      name: string
      code: string
      address: string | null
      phone: string | null
      email: string | null
      logoUrl: string | null
      status: EntityStatus
    }>,
  ): Promise<School> {
    const update: Record<string, string | null> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.code !== undefined) update.code = patch.code
    if (patch.address !== undefined) update.address = patch.address
    if (patch.phone !== undefined) update.phone = patch.phone
    if (patch.email !== undefined) update.email = patch.email
    if (patch.logoUrl !== undefined) update.logo_url = patch.logoUrl
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('schools').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapSchool(res.data as SchoolRow)
  }

  // ── Campuses ─────────────────────────────────────────────────────────────

  async listCampuses(filter?: { schoolId?: string }): Promise<Campus[]> {
    let query = this.client.from('campuses').select('*').order('name')
    if (filter?.schoolId) query = query.eq('school_id', filter.schoolId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as CampusRow[]
    return rows.map(mapCampus)
  }

  async findCampusById(id: string): Promise<Campus | null> {
    const res = await this.client.from('campuses').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapCampus(res.data as CampusRow)
  }

  async createCampus(input: {
    schoolId: string
    name: string
    code: string
    address?: string | null
  }): Promise<Campus> {
    const res = await this.client
      .from('campuses')
      .insert({
        school_id: input.schoolId,
        name: input.name,
        code: input.code,
        address: input.address ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapCampus(res.data as CampusRow)
  }

  async updateCampus(
    id: string,
    patch: Partial<{ name: string; code: string; address: string | null; status: EntityStatus }>,
  ): Promise<Campus> {
    const update: Record<string, string | null> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.code !== undefined) update.code = patch.code
    if (patch.address !== undefined) update.address = patch.address
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('campuses').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapCampus(res.data as CampusRow)
  }

  // ── Academic Years ────────────────────────────────────────────────────────

  async listAcademicYears(filter?: { schoolId?: string }): Promise<AcademicYear[]> {
    let query = this.client
      .from('academic_years')
      .select('*')
      .order('start_date', { ascending: false })
    if (filter?.schoolId) query = query.eq('school_id', filter.schoolId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as AcademicYearRow[]
    return rows.map(mapAcademicYear)
  }

  async findAcademicYearById(id: string): Promise<AcademicYear | null> {
    const res = await this.client.from('academic_years').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapAcademicYear(res.data as AcademicYearRow)
  }

  async createAcademicYear(input: {
    schoolId: string
    name: string
    startDate: string
    endDate: string
  }): Promise<AcademicYear> {
    const res = await this.client
      .from('academic_years')
      .insert({
        school_id: input.schoolId,
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapAcademicYear(res.data as AcademicYearRow)
  }

  async updateAcademicYear(
    id: string,
    patch: Partial<{ name: string; startDate: string; endDate: string; status: EntityStatus }>,
  ): Promise<AcademicYear> {
    const update: Record<string, string> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.startDate !== undefined) update.start_date = patch.startDate
    if (patch.endDate !== undefined) update.end_date = patch.endDate
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client
      .from('academic_years')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapAcademicYear(res.data as AcademicYearRow)
  }

  // ── Terms ─────────────────────────────────────────────────────────────────

  async listTerms(filter?: { academicYearId?: string }): Promise<Term[]> {
    let query = this.client.from('terms').select('*').order('start_date')
    if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as TermRow[]
    return rows.map(mapTerm)
  }

  async findTermById(id: string): Promise<Term | null> {
    const res = await this.client.from('terms').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapTerm(res.data as TermRow)
  }

  async createTerm(input: {
    academicYearId: string
    name: string
    startDate: string
    endDate: string
  }): Promise<Term> {
    const res = await this.client
      .from('terms')
      .insert({
        academic_year_id: input.academicYearId,
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTerm(res.data as TermRow)
  }

  async updateTerm(
    id: string,
    patch: Partial<{ name: string; startDate: string; endDate: string; status: EntityStatus }>,
  ): Promise<Term> {
    const update: Record<string, string> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.startDate !== undefined) update.start_date = patch.startDate
    if (patch.endDate !== undefined) update.end_date = patch.endDate
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('terms').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapTerm(res.data as TermRow)
  }

  // ── Classes ───────────────────────────────────────────────────────────────

  async listClasses(filter?: { schoolId?: string }): Promise<Class[]> {
    let query = this.client.from('classes').select('*').order('grade_order')
    if (filter?.schoolId) query = query.eq('school_id', filter.schoolId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as ClassRow[]
    return rows.map(mapClass)
  }

  async findClassById(id: string): Promise<Class | null> {
    const res = await this.client.from('classes').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapClass(res.data as ClassRow)
  }

  async createClass(input: {
    schoolId: string
    name: string
    code: string
    gradeOrder: number
  }): Promise<Class> {
    const res = await this.client
      .from('classes')
      .insert({
        school_id: input.schoolId,
        name: input.name,
        code: input.code,
        grade_order: input.gradeOrder,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapClass(res.data as ClassRow)
  }

  async updateClass(
    id: string,
    patch: Partial<{ name: string; code: string; gradeOrder: number; status: EntityStatus }>,
  ): Promise<Class> {
    const update: Record<string, string | number> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.code !== undefined) update.code = patch.code
    if (patch.gradeOrder !== undefined) update.grade_order = patch.gradeOrder
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('classes').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapClass(res.data as ClassRow)
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  async listSections(filter?: { classId?: string }): Promise<Section[]> {
    let query = this.client.from('sections').select('*').order('name')
    if (filter?.classId) query = query.eq('class_id', filter.classId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as SectionRow[]
    return rows.map(mapSection)
  }

  async findSectionById(id: string): Promise<Section | null> {
    const res = await this.client.from('sections').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapSection(res.data as SectionRow)
  }

  async createSection(input: {
    classId: string
    name: string
    capacity?: number | null
  }): Promise<Section> {
    const res = await this.client
      .from('sections')
      .insert({ class_id: input.classId, name: input.name, capacity: input.capacity ?? null })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapSection(res.data as SectionRow)
  }

  async updateSection(
    id: string,
    patch: Partial<{ name: string; capacity: number | null; status: EntityStatus }>,
  ): Promise<Section> {
    const update: Record<string, string | number | null> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.capacity !== undefined) update.capacity = patch.capacity
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('sections').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapSection(res.data as SectionRow)
  }

  // ── Subjects ──────────────────────────────────────────────────────────────

  async listSubjects(filter?: { schoolId?: string }): Promise<Subject[]> {
    let query = this.client.from('subjects').select('*').order('name')
    if (filter?.schoolId) query = query.eq('school_id', filter.schoolId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as SubjectRow[]
    return rows.map(mapSubject)
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    const res = await this.client.from('subjects').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapSubject(res.data as SubjectRow)
  }

  async createSubject(input: { schoolId: string; name: string; code: string }): Promise<Subject> {
    const res = await this.client
      .from('subjects')
      .insert({ school_id: input.schoolId, name: input.name, code: input.code })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapSubject(res.data as SubjectRow)
  }

  async updateSubject(
    id: string,
    patch: Partial<{ name: string; code: string; status: EntityStatus }>,
  ): Promise<Subject> {
    const update: Record<string, string> = {}
    if (patch.name !== undefined) update.name = patch.name
    if (patch.code !== undefined) update.code = patch.code
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client.from('subjects').update(update).eq('id', id).select('*').single()
    if (res.error) handleDbError(res.error)
    return mapSubject(res.data as SubjectRow)
  }

  // ── Teacher Assignments ────────────────────────────────────────────────────

  async listTeacherAssignments(filter?: {
    teacherId?: string
    academicYearId?: string
    classId?: string
    sectionId?: string
    subjectId?: string
  }): Promise<TeacherAssignment[]> {
    let query = this.client.from('teacher_assignments').select('*').order('created_at', { ascending: false })
    if (filter?.teacherId) query = query.eq('teacher_id', filter.teacherId)
    if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId)
    if (filter?.classId) query = query.eq('class_id', filter.classId)
    if (filter?.sectionId) query = query.eq('section_id', filter.sectionId)
    if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as TeacherAssignmentRow[]
    return rows.map(mapTeacherAssignment)
  }

  async findTeacherAssignmentById(id: string): Promise<TeacherAssignment | null> {
    const res = await this.client.from('teacher_assignments').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapTeacherAssignment(res.data as TeacherAssignmentRow)
  }

  async createTeacherAssignment(input: {
    teacherId: string
    academicYearId: string
    classId: string
    sectionId?: string | null
    subjectId?: string | null
    isClassTeacher?: boolean
  }): Promise<TeacherAssignment> {
    const res = await this.client
      .from('teacher_assignments')
      .insert({
        teacher_id: input.teacherId,
        academic_year_id: input.academicYearId,
        class_id: input.classId,
        section_id: input.sectionId ?? null,
        subject_id: input.subjectId ?? null,
        is_class_teacher: input.isClassTeacher ?? false,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTeacherAssignment(res.data as TeacherAssignmentRow)
  }

  async updateTeacherAssignment(
    id: string,
    patch: Partial<{
      teacherId: string
      academicYearId: string
      classId: string
      sectionId: string | null
      subjectId: string | null
      isClassTeacher: boolean
      status: EntityStatus
    }>,
  ): Promise<TeacherAssignment> {
    const update: Record<string, unknown> = {}
    if (patch.teacherId !== undefined) update.teacher_id = patch.teacherId
    if (patch.academicYearId !== undefined) update.academic_year_id = patch.academicYearId
    if (patch.classId !== undefined) update.class_id = patch.classId
    if (patch.sectionId !== undefined) update.section_id = patch.sectionId
    if (patch.subjectId !== undefined) update.subject_id = patch.subjectId
    if (patch.isClassTeacher !== undefined) update.is_class_teacher = patch.isClassTeacher
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client
      .from('teacher_assignments')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTeacherAssignment(res.data as TeacherAssignmentRow)
  }

  // ── Timetable ─────────────────────────────────────────────────────────────

  async listTimetableEntries(filter?: {
    academicYearId?: string
    classId?: string
    sectionId?: string
    subjectId?: string
    teacherId?: string
    weekday?: number
  }): Promise<TimetableEntry[]> {
    let query = this.client.from('timetable_entries').select('*').order('weekday').order('start_time')
    if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId)
    if (filter?.classId) query = query.eq('class_id', filter.classId)
    if (filter?.sectionId) query = query.eq('section_id', filter.sectionId)
    if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId)
    if (filter?.teacherId) query = query.eq('teacher_id', filter.teacherId)
    if (filter?.weekday !== undefined) query = query.eq('weekday', filter.weekday)
    const res = await query
    if (res.error) handleDbError(res.error)
    const rows = res.data as TimetableEntryRow[]
    return rows.map(mapTimetableEntry)
  }

  async findTimetableEntryById(id: string): Promise<TimetableEntry | null> {
    const res = await this.client.from('timetable_entries').select('*').eq('id', id).maybeSingle()
    if (res.error) handleDbError(res.error)
    if (!res.data) return null
    return mapTimetableEntry(res.data as TimetableEntryRow)
  }

  async createTimetableEntry(input: {
    academicYearId: string
    classId: string
    sectionId?: string | null
    subjectId: string
    teacherId?: string | null
    weekday: number
    startTime: string
    endTime: string
    room?: string | null
  }): Promise<TimetableEntry> {
    const res = await this.client
      .from('timetable_entries')
      .insert({
        academic_year_id: input.academicYearId,
        class_id: input.classId,
        section_id: input.sectionId ?? null,
        subject_id: input.subjectId,
        teacher_id: input.teacherId ?? null,
        weekday: input.weekday,
        start_time: input.startTime,
        end_time: input.endTime,
        room: input.room ?? null,
      })
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTimetableEntry(res.data as TimetableEntryRow)
  }

  async updateTimetableEntry(
    id: string,
    patch: Partial<{
      academicYearId: string
      classId: string
      sectionId: string | null
      subjectId: string
      teacherId: string | null
      weekday: number
      startTime: string
      endTime: string
      room: string | null
      status: EntityStatus
    }>,
  ): Promise<TimetableEntry> {
    const update: Record<string, unknown> = {}
    if (patch.academicYearId !== undefined) update.academic_year_id = patch.academicYearId
    if (patch.classId !== undefined) update.class_id = patch.classId
    if (patch.sectionId !== undefined) update.section_id = patch.sectionId
    if (patch.subjectId !== undefined) update.subject_id = patch.subjectId
    if (patch.teacherId !== undefined) update.teacher_id = patch.teacherId
    if (patch.weekday !== undefined) update.weekday = patch.weekday
    if (patch.startTime !== undefined) update.start_time = patch.startTime
    if (patch.endTime !== undefined) update.end_time = patch.endTime
    if (patch.room !== undefined) update.room = patch.room
    if (patch.status !== undefined) update.status = patch.status
    const res = await this.client
      .from('timetable_entries')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()
    if (res.error) handleDbError(res.error)
    return mapTimetableEntry(res.data as TimetableEntryRow)
  }

  async deleteTimetableEntry(id: string): Promise<void> {
    const res = await this.client.from('timetable_entries').delete().eq('id', id)
    if (res.error) handleDbError(res.error)
  }
}
