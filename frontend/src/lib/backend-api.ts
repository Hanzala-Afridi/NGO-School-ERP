import type {
  AcademicYear,
  ApiResponse,
  Attachment,
  AuthSession,
  Campus,
  Class,
  CurrentIdentity,
  EmploymentStatus,
  Enrollment,
  EnrollmentStatus,
  Gender,
  Parent,
  ParentRelationship,
  School,
  Section,
  Student,
  StudentParentLink,
  StudentSiblingLink,
  Subject,
  Teacher,
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

// ── Students ─────────────────────────────────────────────────────────────

export function getStudents(
  token: string,
  filter?: { schoolId?: string; status?: string; gender?: Gender; search?: string; page?: number; limit?: number },
): Promise<Student[]> {
  const params = new URLSearchParams()
  if (filter?.schoolId) params.set('schoolId', filter.schoolId)
  if (filter?.status) params.set('status', filter.status)
  if (filter?.gender) params.set('gender', filter.gender)
  if (filter?.search) params.set('search', filter.search)
  if (filter?.page) params.set('page', String(filter.page))
  if (filter?.limit) params.set('limit', String(filter.limit))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/students${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getStudent(token: string, id: string): Promise<Student> {
  return request(`/students/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function createStudent(
  token: string,
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
  return request('/students', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateStudent(
  token: string,
  id: string,
  patch: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
): Promise<Student> {
  return request(`/students/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

export function archiveStudent(token: string, id: string): Promise<Student> {
  return request(`/students/${id}/archive`, {
    method: 'POST',
    headers: authHeader(token),
  })
}

export function getStudentHistory(token: string, id: string): Promise<Array<{ event: string; timestamp: string; details: string }>> {
  return request(`/students/${id}/history`, { method: 'GET', headers: authHeader(token) })
}

// ── Student Documents ────────────────────────────────────────────────────

export function getStudentDocuments(token: string, studentId: string): Promise<Attachment[]> {
  return request(`/students/${studentId}/documents`, { method: 'GET', headers: authHeader(token) })
}

export function createStudentDocument(
  token: string,
  studentId: string,
  input: { fileName: string; storagePath: string; mimeType: string; sizeBytes: number },
): Promise<Attachment> {
  return request(`/students/${studentId}/documents`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function deleteStudentDocument(token: string, studentId: string, documentId: string): Promise<void> {
  return request(`/students/${studentId}/documents/${documentId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  }).then(() => undefined)
}

// ── Parents ──────────────────────────────────────────────────────────────

export function getParents(
  token: string,
  filter?: { search?: string; page?: number; limit?: number },
): Promise<Parent[]> {
  const params = new URLSearchParams()
  if (filter?.search) params.set('search', filter.search)
  if (filter?.page) params.set('page', String(filter.page))
  if (filter?.limit) params.set('limit', String(filter.limit))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/parents${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getParent(token: string, id: string): Promise<Parent> {
  return request(`/parents/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function createParent(
  token: string,
  input: { profileId: string; fullName: string; phone?: string | null; email?: string | null; occupation?: string | null; address?: string | null },
): Promise<Parent> {
  return request('/parents', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateParent(
  token: string,
  id: string,
  patch: Partial<Omit<Parent, 'id' | 'createdAt' | 'updatedAt' | 'profileId'>>,
): Promise<Parent> {
  return request(`/parents/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

export function getStudentParents(token: string, studentId: string): Promise<StudentParentLink[]> {
  return request(`/students/${studentId}/parents`, { method: 'GET', headers: authHeader(token) })
}

export function linkStudentParent(
  token: string,
  studentId: string,
  input: { parentId: string; relationship: ParentRelationship; isPrimary?: boolean; receivesNotifications?: boolean; portalAccessEnabled?: boolean },
): Promise<StudentParentLink> {
  return request(`/students/${studentId}/parents`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function getStudentSiblings(token: string, studentId: string): Promise<StudentSiblingLink[]> {
  return request(`/students/${studentId}/siblings`, { method: 'GET', headers: authHeader(token) })
}

export function linkStudentSiblings(token: string, studentId: string, siblingStudentId: string): Promise<StudentSiblingLink> {
  return request(`/students/${studentId}/siblings`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ siblingStudentId }),
  })
}

// ── Teachers ─────────────────────────────────────────────────────────────

export function getTeachers(
  token: string,
  filter?: { employmentStatus?: EmploymentStatus; search?: string; page?: number; limit?: number },
): Promise<Teacher[]> {
  const params = new URLSearchParams()
  if (filter?.employmentStatus) params.set('employmentStatus', filter.employmentStatus)
  if (filter?.search) params.set('search', filter.search)
  if (filter?.page) params.set('page', String(filter.page))
  if (filter?.limit) params.set('limit', String(filter.limit))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/teachers${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getTeacher(token: string, id: string): Promise<Teacher> {
  return request(`/teachers/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function createTeacher(
  token: string,
  input: { profileId: string; employeeNumber?: string; qualification?: string | null; joiningDate?: string; employmentStatus?: EmploymentStatus },
): Promise<Teacher> {
  return request('/teachers', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateTeacher(
  token: string,
  id: string,
  patch: Partial<Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'profileId'>>,
): Promise<Teacher> {
  return request(`/teachers/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

// ── Enrollments ──────────────────────────────────────────────────────────

export function getEnrollments(
  token: string,
  filter?: { studentId?: string; academicYearId?: string; classId?: string; sectionId?: string; status?: EnrollmentStatus; page?: number; limit?: number },
): Promise<Enrollment[]> {
  const params = new URLSearchParams()
  if (filter?.studentId) params.set('studentId', filter.studentId)
  if (filter?.academicYearId) params.set('academicYearId', filter.academicYearId)
  if (filter?.classId) params.set('classId', filter.classId)
  if (filter?.sectionId) params.set('sectionId', filter.sectionId)
  if (filter?.status) params.set('status', filter.status)
  if (filter?.page) params.set('page', String(filter.page))
  if (filter?.limit) params.set('limit', String(filter.limit))
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/enrollments${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getEnrollment(token: string, id: string): Promise<Enrollment> {
  return request(`/enrollments/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function createEnrollment(
  token: string,
  input: { studentId: string; academicYearId: string; classId: string; sectionId?: string | null; rollNumber?: number | null; startDate?: string },
): Promise<Enrollment> {
  return request('/enrollments', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function updateEnrollment(
  token: string,
  id: string,
  patch: Partial<Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt' | 'studentId' | 'academicYearId'>>,
): Promise<Enrollment> {
  return request(`/enrollments/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(patch),
  })
}

export function promoteEnrollment(
  token: string,
  id: string,
  input: { targetAcademicYearId: string; targetClassId: string; targetSectionId?: string | null; newRollNumber?: number | null },
): Promise<Enrollment> {
  return request(`/enrollments/${id}/promote`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function transferEnrollment(
  token: string,
  id: string,
  input: { targetClassId?: string; targetSectionId: string; newRollNumber?: number | null },
): Promise<Enrollment> {
  return request(`/enrollments/${id}/transfer`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(input),
  })
}

export function withdrawEnrollment(token: string, id: string, reason?: string): Promise<Enrollment> {
  return request(`/enrollments/${id}/withdraw`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ reason }),
  })
}

// ── Phase 4: Attendance ───────────────────────────────────────────────────

export function getAttendanceSessions(token: string, params?: { academicYearId?: string; classId?: string; sectionId?: string; date?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/attendance/sessions${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function bulkMarkAttendance(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/attendance/sessions/records', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function lockAttendanceSession(token: string, sessionId: string): Promise<Record<string, unknown>> {
  return request(`/attendance/sessions/${sessionId}/lock`, {
    method: 'POST',
    headers: authHeader(token),
  })
}

export function requestAttendanceCorrection(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/attendance/corrections/request', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getPendingCorrections(token: string): Promise<Record<string, unknown>[]> {
  return request('/attendance/corrections/pending', { method: 'GET', headers: authHeader(token) })
}

export function reviewAttendanceCorrection(token: string, id: string, status: 'approved' | 'rejected'): Promise<Record<string, unknown>> {
  return request(`/attendance/corrections/${id}/review`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  })
}

export function getStudentAttendanceHistory(token: string, studentId: string): Promise<Record<string, unknown>[]> {
  return request(`/attendance/students/${studentId}/history`, { method: 'GET', headers: authHeader(token) })
}

// ── Phase 5: Homework, Progress, Announcements ────────────────────────────

export function getHomework(token: string, params?: { teacherAssignmentId?: string; status?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/homework${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createHomework(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/homework', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function deleteHomework(token: string, id: string): Promise<Record<string, unknown>> {
  return request(`/homework/${id}`, { method: 'DELETE', headers: authHeader(token) })
}

export function getProgressCategories(token: string, schoolId?: string): Promise<Record<string, unknown>[]> {
  const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return request(`/progress/categories${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getStudentProgress(token: string, studentId: string): Promise<Record<string, unknown>[]> {
  return request(`/progress/students/${studentId}`, { method: 'GET', headers: authHeader(token) })
}

export function recordStudentProgress(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/progress/students/record', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function publishStudentProgress(token: string, id: string): Promise<Record<string, unknown>> {
  return request(`/progress/${id}/publish`, { method: 'POST', headers: authHeader(token) })
}

export function getClassProgressSummary(token: string, classId: string): Promise<Record<string, unknown>[]> {
  return request(`/classes/${classId}/progress-summary`, { method: 'GET', headers: authHeader(token) })
}

export function getAnnouncements(token: string, params?: { schoolId?: string; status?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/announcements${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createAnnouncement(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/announcements', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function publishAnnouncement(token: string, id: string): Promise<Record<string, unknown>> {
  return request(`/announcements/${id}/publish`, { method: 'POST', headers: authHeader(token) })
}

// Phase 6: Exams & Results

export function getExams(token: string, params?: { academicYearId?: string; termId?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/exams${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createExam(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/exams', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function updateExamStatus(token: string, id: string, status: string): Promise<Record<string, unknown>> {
  return request(`/exams/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  })
}

export function getExamComponents(token: string, examId: string, params?: { classId?: string; sectionId?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/exams/${examId}/components${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createExamComponent(token: string, examId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request(`/exams/${examId}/components`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getComponentResults(token: string, componentId: string): Promise<Record<string, unknown>[]> {
  return request(`/exam-components/${componentId}/results`, { method: 'GET', headers: authHeader(token) })
}

export function bulkEnterMarks(token: string, componentId: string, results: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  return request(`/exam-components/${componentId}/results`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ results }),
  })
}

export function approveExamResults(token: string, examId: string): Promise<Record<string, unknown>> {
  return request(`/exams/${examId}/approve`, { method: 'POST', headers: authHeader(token) })
}

export function publishExamResults(token: string, examId: string): Promise<Record<string, unknown>> {
  return request(`/exams/${examId}/publish`, { method: 'POST', headers: authHeader(token) })
}

export function getStudentReportCard(token: string, studentId: string, examId: string): Promise<Record<string, unknown>> {
  return request(`/students/${studentId}/report-card?examId=${encodeURIComponent(examId)}`, { method: 'GET', headers: authHeader(token) })
}

export function getParentChildResults(token: string, studentId: string): Promise<Record<string, unknown>[]> {
  return request(`/parents/me/children/${studentId}/results`, { method: 'GET', headers: authHeader(token) })
}

// Phase 7: Messaging & Complaints

export function getConversations(token: string): Promise<Record<string, unknown>[]> {
  return request('/conversations', { method: 'GET', headers: authHeader(token) })
}

export function createConversation(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/conversations', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getMessages(token: string, conversationId: string): Promise<Record<string, unknown>[]> {
  return request(`/conversations/${conversationId}/messages`, { method: 'GET', headers: authHeader(token) })
}

export function sendMessage(token: string, conversationId: string, payload: { body: string; attachmentPath?: string | null }): Promise<Record<string, unknown>> {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getComplaints(token: string, params?: { parentId?: string; teacherId?: string }): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const qs = query ? `?${query}` : ''
  return request(`/complaints${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function createComplaint(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/complaints', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getComplaintById(token: string, id: string): Promise<Record<string, unknown>> {
  return request(`/complaints/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function assignComplaint(token: string, id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request(`/complaints/${id}/assign`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function updateComplaintStatus(token: string, id: string, status: string, note?: string): Promise<Record<string, unknown>> {
  return request(`/complaints/${id}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status, note }),
  })
}

export function resolveComplaint(token: string, id: string, resolution: string): Promise<Record<string, unknown>> {
  return request(`/complaints/${id}/resolve`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ resolution }),
  })
}

// ── Phase 8: Welfare ─────────────────────────────────────────────────────────

export function getHouseholds(token: string): Promise<Record<string, unknown>[]> {
  return request('/households', { method: 'GET', headers: authHeader(token) })
}

export function createHousehold(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/households', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getHouseholdById(token: string, id: string): Promise<Record<string, unknown>> {
  return request(`/households/${id}`, { method: 'GET', headers: authHeader(token) })
}

export function addHouseholdMember(token: string, householdId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request(`/households/${householdId}/members`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function createWelfareAssessment(token: string, householdId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request(`/households/${householdId}/assessments`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function approveWelfareAssessment(token: string, assessmentId: string): Promise<Record<string, unknown>> {
  return request(`/welfare-assessments/${assessmentId}/approve`, {
    method: 'POST',
    headers: authHeader(token),
  })
}

export function getParentWelfare(token: string): Promise<Record<string, unknown>> {
  return request('/parent/welfare', { method: 'GET', headers: authHeader(token) })
}

// ── Phase 9: Inventory & Expenses ───────────────────────────────────────────

export function getInventoryItems(token: string): Promise<Record<string, unknown>[]> {
  return request('/inventory/items', { method: 'GET', headers: authHeader(token) })
}

export function createInventoryItem(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/inventory/items', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function recordStockTransaction(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/inventory/transactions', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function getStockLedger(token: string, itemId?: string): Promise<Record<string, unknown>[]> {
  const qs = itemId ? `?itemId=${encodeURIComponent(itemId)}` : ''
  return request(`/inventory/ledger${qs}`, { method: 'GET', headers: authHeader(token) })
}

export function getExpenses(token: string): Promise<Record<string, unknown>[]> {
  return request('/expenses', { method: 'GET', headers: authHeader(token) })
}

export function createExpense(token: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request('/expenses', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  })
}

export function voidExpense(token: string, id: string, voidReason: string): Promise<Record<string, unknown>> {
  return request(`/expenses/${id}/void`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ voidReason }),
  })
}