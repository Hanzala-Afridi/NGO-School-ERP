import type {
  AcademicYear,
  ApiResponse,
  AuthSession,
  Campus,
  Class,
  CurrentIdentity,
  School,
  Section,
  Subject,
  TeacherAssignment,
  Term,
  TimetableEntry,
} from '@ngo-school-erp/contracts'

import { serverEnvironment } from '@/lib/env'

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${serverEnvironment.BACKEND_URL}/api/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  })
  const payload = (await response.json()) as ApiResponse<T>
  if (!payload.success) throw new Error(payload.error.message)
  return payload.data
}

export function login(email: string, password: string): Promise<AuthSession> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function requestPasswordRecovery(email: string): Promise<{ message: string }> {
  return request('/auth/password-recovery', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function updatePassword(accessToken: string, newPassword: string): Promise<void> {
  return request('/auth/password', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ newPassword }),
  }).then(() => undefined)
}

export function logout(accessToken: string): Promise<void> {
  return request('/auth/logout', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
  }).then(() => undefined)
}

export function getCurrentIdentity(accessToken: string): Promise<CurrentIdentity> {
  return request('/auth/me', {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  })
}

// ── Academics helpers ──────────────────────────────────────────────────────

function authHeader(token: string): { authorization: string } {
  return { authorization: `Bearer ${token}` }
}

// Schools

export function getSchools(token: string): Promise<School[]> {
  return request('/schools', { method: 'GET', headers: authHeader(token) })
}

export function getSchool(token: string, id: string): Promise<School> {
  return request(`/schools/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function updateSchool(
  token: string,
  id: string,
  patch: Partial<Omit<School, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<School> {
  return request(`/schools/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Campuses

export function getCampuses(token: string, schoolId?: string): Promise<Campus[]> {
  const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return request(`/campuses${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function updateCampus(
  token: string,
  id: string,
  patch: Partial<Omit<Campus, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): Promise<Campus> {
  return request(`/campuses/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Academic Years

export function getAcademicYears(token: string, schoolId?: string): Promise<AcademicYear[]> {
  const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return request(`/academic-years${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createAcademicYear(
  token: string,
  input: { schoolId: string; name: string; startDate: string; endDate: string },
): Promise<AcademicYear> {
  return request('/academic-years', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateAcademicYear(
  token: string,
  id: string,
  patch: Partial<Omit<AcademicYear, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): Promise<AcademicYear> {
  return request(`/academic-years/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Terms

export function getTerms(token: string, academicYearId?: string): Promise<Term[]> {
  const qs = academicYearId ? `?academicYearId=${encodeURIComponent(academicYearId)}` : ''
  return request(`/terms${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createTerm(
  token: string,
  input: { academicYearId: string; name: string; startDate: string; endDate: string },
): Promise<Term> {
  return request('/terms', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateTerm(
  token: string,
  id: string,
  patch: Partial<Omit<Term, 'id' | 'academicYearId' | 'createdAt' | 'updatedAt'>>,
): Promise<Term> {
  return request(`/terms/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Classes

export function getClasses(token: string, schoolId?: string): Promise<Class[]> {
  const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return request(`/classes${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createClass(
  token: string,
  input: { schoolId: string; name: string; code: string; gradeOrder: number },
): Promise<Class> {
  return request('/classes', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateClass(
  token: string,
  id: string,
  patch: Partial<Omit<Class, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): Promise<Class> {
  return request(`/classes/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Sections

export function getSections(token: string, classId?: string): Promise<Section[]> {
  const qs = classId ? `?classId=${encodeURIComponent(classId)}` : ''
  return request(`/sections${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createSection(
  token: string,
  input: { classId: string; name: string; capacity?: number | null },
): Promise<Section> {
  return request('/sections', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateSection(
  token: string,
  id: string,
  patch: Partial<Omit<Section, 'id' | 'classId' | 'createdAt' | 'updatedAt'>>,
): Promise<Section> {
  return request(`/sections/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Subjects

export function getSubjects(token: string, schoolId?: string): Promise<Subject[]> {
  const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return request(`/subjects${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createSubject(
  token: string,
  input: { schoolId: string; name: string; code: string },
): Promise<Subject> {
  return request('/subjects', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateSubject(
  token: string,
  id: string,
  patch: Partial<Omit<Subject, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>,
): Promise<Subject> {
  return request(`/subjects/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Teacher Assignments

export function getTeacherAssignments(
  token: string,
  filter?: { teacherId?: string; academicYearId?: string; classId?: string; sectionId?: string; subjectId?: string },
): Promise<TeacherAssignment[]> {
  const params = new URLSearchParams()
  if (filter?.teacherId) params.set('teacherId', filter.teacherId)
  if (filter?.academicYearId) params.set('academicYearId', filter.academicYearId)
  if (filter?.classId) params.set('classId', filter.classId)
  if (filter?.sectionId) params.set('sectionId', filter.sectionId)
  if (filter?.subjectId) params.set('subjectId', filter.subjectId)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/teacher-assignments${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createTeacherAssignment(
  token: string,
  input: {
    teacherId: string
    academicYearId: string
    classId: string
    sectionId?: string | null
    subjectId?: string | null
    isClassTeacher?: boolean
  },
): Promise<TeacherAssignment> {
  return request('/teacher-assignments', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateTeacherAssignment(
  token: string,
  id: string,
  patch: Partial<Omit<TeacherAssignment, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<TeacherAssignment> {
  return request(`/teacher-assignments/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// Timetable

export function getTimetableEntries(
  token: string,
  filter?: { academicYearId?: string; classId?: string; sectionId?: string; subjectId?: string; teacherId?: string; weekday?: number },
): Promise<TimetableEntry[]> {
  const params = new URLSearchParams()
  if (filter?.academicYearId) params.set('academicYearId', filter.academicYearId)
  if (filter?.classId) params.set('classId', filter.classId)
  if (filter?.sectionId) params.set('sectionId', filter.sectionId)
  if (filter?.subjectId) params.set('subjectId', filter.subjectId)
  if (filter?.teacherId) params.set('teacherId', filter.teacherId)
  if (filter?.weekday !== undefined) params.set('weekday', String(filter.weekday))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/timetable${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createTimetableEntry(
  token: string,
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
  return request('/timetable', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateTimetableEntry(
  token: string,
  id: string,
  patch: Partial<Omit<TimetableEntry, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<TimetableEntry> {
  return request(`/timetable/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

export function deleteTimetableEntry(token: string, id: string): Promise<void> {
  return request(`/timetable/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  }).then(() => undefined)
}
