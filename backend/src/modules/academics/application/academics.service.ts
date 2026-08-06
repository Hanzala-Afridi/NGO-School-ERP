import type {
  AcademicYear,
  Campus,
  Class,
  School,
  Section,
  Subject,
  TeacherAssignment,
  Term,
  TimetableEntry,
} from '@ngo-school-erp/contracts'

import { AppError } from '../../../shared/app-error.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { AcademicsRepository } from '../domain/academics.js'

export class AcademicsService {
  constructor(
    private readonly repository: AcademicsRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Schools ──────────────────────────────────────────────────────────────

  listSchools(): Promise<School[]> {
    return this.repository.listSchools()
  }

  async getSchool(id: string): Promise<School> {
    const school = await this.repository.findSchoolById(id)
    if (!school) throw new AppError(404, 'SCHOOL_NOT_FOUND', 'School was not found')
    return school
  }

  async updateSchool(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      name: string
      code: string
      address: string | null
      phone: string | null
      email: string | null
      logoUrl: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<School> {
    const previous = await this.getSchool(id)
    const updated = await this.repository.updateSchool(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.school.updated',
      outcome: 'success',
      entityType: 'school',
      entityId: id,
      oldValues: { name: previous.name },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Campuses ─────────────────────────────────────────────────────────────

  listCampuses(filter?: { schoolId?: string }): Promise<Campus[]> {
    return this.repository.listCampuses(filter)
  }

  async getCampus(id: string): Promise<Campus> {
    const campus = await this.repository.findCampusById(id)
    if (!campus) throw new AppError(404, 'CAMPUS_NOT_FOUND', 'Campus was not found')
    return campus
  }

  async createCampus(
    actor: AuthContext,
    input: { schoolId: string; name: string; code: string; address?: string | null },
  ): Promise<Campus> {
    const campus = await this.repository.createCampus(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.campus.created',
      outcome: 'success',
      entityType: 'campus',
      entityId: campus.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return campus
  }

  async updateCampus(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      name: string
      code: string
      address: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<Campus> {
    const previous = await this.getCampus(id)
    const updated = await this.repository.updateCampus(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.campus.updated',
      outcome: 'success',
      entityType: 'campus',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Academic Years ────────────────────────────────────────────────────────

  listAcademicYears(filter?: { schoolId?: string }): Promise<AcademicYear[]> {
    return this.repository.listAcademicYears(filter)
  }

  async getAcademicYear(id: string): Promise<AcademicYear> {
    const year = await this.repository.findAcademicYearById(id)
    if (!year) throw new AppError(404, 'ACADEMIC_YEAR_NOT_FOUND', 'Academic year was not found')
    return year
  }

  async createAcademicYear(
    actor: AuthContext,
    input: { schoolId: string; name: string; startDate: string; endDate: string },
  ): Promise<AcademicYear> {
    const year = await this.repository.createAcademicYear(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.academic_year.created',
      outcome: 'success',
      entityType: 'academic_year',
      entityId: year.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return year
  }

  async updateAcademicYear(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      name: string
      startDate: string
      endDate: string
      status: 'active' | 'inactive'
    }>,
  ): Promise<AcademicYear> {
    const previous = await this.getAcademicYear(id)
    const updated = await this.repository.updateAcademicYear(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.academic_year.updated',
      outcome: 'success',
      entityType: 'academic_year',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Terms ─────────────────────────────────────────────────────────────────

  listTerms(filter?: { academicYearId?: string }): Promise<Term[]> {
    return this.repository.listTerms(filter)
  }

  async getTerm(id: string): Promise<Term> {
    const term = await this.repository.findTermById(id)
    if (!term) throw new AppError(404, 'TERM_NOT_FOUND', 'Term was not found')
    return term
  }

  async createTerm(
    actor: AuthContext,
    input: { academicYearId: string; name: string; startDate: string; endDate: string },
  ): Promise<Term> {
    const term = await this.repository.createTerm(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.term.created',
      outcome: 'success',
      entityType: 'term',
      entityId: term.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return term
  }

  async updateTerm(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      name: string
      startDate: string
      endDate: string
      status: 'active' | 'inactive'
    }>,
  ): Promise<Term> {
    const previous = await this.getTerm(id)
    const updated = await this.repository.updateTerm(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.term.updated',
      outcome: 'success',
      entityType: 'term',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Classes ───────────────────────────────────────────────────────────────

  listClasses(filter?: { schoolId?: string }): Promise<Class[]> {
    return this.repository.listClasses(filter)
  }

  async getClass(id: string): Promise<Class> {
    const cls = await this.repository.findClassById(id)
    if (!cls) throw new AppError(404, 'CLASS_NOT_FOUND', 'Class was not found')
    return cls
  }

  async createClass(
    actor: AuthContext,
    input: { schoolId: string; name: string; code: string; gradeOrder: number },
  ): Promise<Class> {
    const cls = await this.repository.createClass(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.class.created',
      outcome: 'success',
      entityType: 'class',
      entityId: cls.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return cls
  }

  async updateClass(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      name: string
      code: string
      gradeOrder: number
      status: 'active' | 'inactive'
    }>,
  ): Promise<Class> {
    const previous = await this.getClass(id)
    const updated = await this.repository.updateClass(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.class.updated',
      outcome: 'success',
      entityType: 'class',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  listSections(filter?: { classId?: string }): Promise<Section[]> {
    return this.repository.listSections(filter)
  }

  async getSection(id: string): Promise<Section> {
    const section = await this.repository.findSectionById(id)
    if (!section) throw new AppError(404, 'SECTION_NOT_FOUND', 'Section was not found')
    return section
  }

  async createSection(
    actor: AuthContext,
    input: { classId: string; name: string; capacity?: number | null },
  ): Promise<Section> {
    const section = await this.repository.createSection(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.section.created',
      outcome: 'success',
      entityType: 'section',
      entityId: section.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return section
  }

  async updateSection(
    actor: AuthContext,
    id: string,
    patch: Partial<{ name: string; capacity: number | null; status: 'active' | 'inactive' }>,
  ): Promise<Section> {
    const previous = await this.getSection(id)
    const updated = await this.repository.updateSection(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.section.updated',
      outcome: 'success',
      entityType: 'section',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Subjects ──────────────────────────────────────────────────────────────

  listSubjects(filter?: { schoolId?: string }): Promise<Subject[]> {
    return this.repository.listSubjects(filter)
  }

  async getSubject(id: string): Promise<Subject> {
    const subject = await this.repository.findSubjectById(id)
    if (!subject) throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Subject was not found')
    return subject
  }

  async createSubject(
    actor: AuthContext,
    input: { schoolId: string; name: string; code: string },
  ): Promise<Subject> {
    const subject = await this.repository.createSubject(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.subject.created',
      outcome: 'success',
      entityType: 'subject',
      entityId: subject.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return subject
  }

  async updateSubject(
    actor: AuthContext,
    id: string,
    patch: Partial<{ name: string; code: string; status: 'active' | 'inactive' }>,
  ): Promise<Subject> {
    const previous = await this.getSubject(id)
    const updated = await this.repository.updateSubject(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.subject.updated',
      outcome: 'success',
      entityType: 'subject',
      entityId: id,
      oldValues: { name: previous.name, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Teacher Assignments ────────────────────────────────────────────────────

  listTeacherAssignments(filter?: {
    teacherId?: string
    academicYearId?: string
    classId?: string
    sectionId?: string
    subjectId?: string
  }): Promise<TeacherAssignment[]> {
    return this.repository.listTeacherAssignments(filter)
  }

  async getTeacherAssignment(id: string): Promise<TeacherAssignment> {
    const assignment = await this.repository.findTeacherAssignmentById(id)
    if (!assignment) {
      throw new AppError(404, 'TEACHER_ASSIGNMENT_NOT_FOUND', 'Teacher assignment was not found')
    }
    return assignment
  }

  async createTeacherAssignment(
    actor: AuthContext,
    input: {
      teacherId: string
      academicYearId: string
      classId: string
      sectionId?: string | null
      subjectId?: string | null
      isClassTeacher?: boolean
    },
  ): Promise<TeacherAssignment> {
    const assignment = await this.repository.createTeacherAssignment(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.teacher_assignment.created',
      outcome: 'success',
      entityType: 'teacher_assignment',
      entityId: assignment.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return assignment
  }

  async updateTeacherAssignment(
    actor: AuthContext,
    id: string,
    patch: Partial<{
      teacherId: string
      academicYearId: string
      classId: string
      sectionId: string | null
      subjectId: string | null
      isClassTeacher: boolean
      status: 'active' | 'inactive'
    }>,
  ): Promise<TeacherAssignment> {
    const previous = await this.getTeacherAssignment(id)
    const updated = await this.repository.updateTeacherAssignment(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.teacher_assignment.updated',
      outcome: 'success',
      entityType: 'teacher_assignment',
      entityId: id,
      oldValues: { teacherId: previous.teacherId, status: previous.status },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  // ── Timetable ─────────────────────────────────────────────────────────────

  listTimetableEntries(filter?: {
    academicYearId?: string
    classId?: string
    sectionId?: string
    subjectId?: string
    teacherId?: string
    weekday?: number
  }): Promise<TimetableEntry[]> {
    return this.repository.listTimetableEntries(filter)
  }

  async getTimetableEntry(id: string): Promise<TimetableEntry> {
    const entry = await this.repository.findTimetableEntryById(id)
    if (!entry) throw new AppError(404, 'TIMETABLE_ENTRY_NOT_FOUND', 'Timetable entry was not found')
    return entry
  }

  async createTimetableEntry(
    actor: AuthContext,
    input: {
      academicYearId: string
      classId: string
      sectionId?: string | null
      subjectId: string
      teacherId?: string | null
      weekday: number
      startTime: string
      endTime: string
      room?: string | null
    },
  ): Promise<TimetableEntry> {
    const entry = await this.repository.createTimetableEntry(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.timetable_entry.created',
      outcome: 'success',
      entityType: 'timetable_entry',
      entityId: entry.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return entry
  }

  async updateTimetableEntry(
    actor: AuthContext,
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
      status: 'active' | 'inactive'
    }>,
  ): Promise<TimetableEntry> {
    const previous = await this.getTimetableEntry(id)
    const updated = await this.repository.updateTimetableEntry(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.timetable_entry.updated',
      outcome: 'success',
      entityType: 'timetable_entry',
      entityId: id,
      oldValues: { weekday: previous.weekday, startTime: previous.startTime, endTime: previous.endTime },
      newValues: patch,
      sessionId: actor.sessionId,
    })
    return updated
  }

  async deleteTimetableEntry(actor: AuthContext, id: string): Promise<void> {
    const previous = await this.getTimetableEntry(id)
    await this.repository.deleteTimetableEntry(id)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'academics.timetable_entry.deleted',
      outcome: 'success',
      entityType: 'timetable_entry',
      entityId: id,
      oldValues: { weekday: previous.weekday, startTime: previous.startTime, endTime: previous.endTime },
      sessionId: actor.sessionId,
    })
  }
}
