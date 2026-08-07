'use server'

import { revalidatePath } from 'next/cache'

import * as api from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export interface ActionState {
  error?: string
  message?: string
}

async function getToken(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Not authenticated')
  return data.session.access_token
}

// ── School ────────────────────────────────────────────────────────────────

export async function updateSchoolAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string | null> = {}
    const name = formData.get('name')
    const address = formData.get('address')
    const phone = formData.get('phone')
    const email = formData.get('email')
    if (name) patch.name = String(name)
    if (address !== null) patch.address = String(address) || null
    if (phone !== null) patch.phone = String(phone) || null
    if (email !== null) patch.email = String(email) || null
    await api.updateSchool(token, id, patch)
    revalidatePath('/school')
    return { message: 'School profile updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update school.' }
  }
}

// ── Academic Years ────────────────────────────────────────────────────────

export async function createAcademicYearAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const schoolId = String(formData.get('schoolId') ?? '')
    const name = String(formData.get('name') ?? '')
    const startDate = String(formData.get('startDate') ?? '')
    const endDate = String(formData.get('endDate') ?? '')
    if (!name || !startDate || !endDate) return { error: 'All fields are required.' }
    await api.createAcademicYear(token, { schoolId, name, startDate, endDate })
    revalidatePath('/academic-years')
    return { message: 'Academic year created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create academic year.' }
  }
}

export async function updateAcademicYearAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string> = {}
    const name = formData.get('name')
    const startDate = formData.get('startDate')
    const endDate = formData.get('endDate')
    const status = formData.get('status')
    if (name) patch.name = String(name)
    if (startDate) patch.startDate = String(startDate)
    if (endDate) patch.endDate = String(endDate)
    if (status) patch.status = String(status)
    await api.updateAcademicYear(token, id, patch)
    revalidatePath('/academic-years')
    return { message: 'Academic year updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update academic year.' }
  }
}

// ── Terms ─────────────────────────────────────────────────────────────────

export async function createTermAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const name = String(formData.get('name') ?? '')
    const startDate = String(formData.get('startDate') ?? '')
    const endDate = String(formData.get('endDate') ?? '')
    if (!name || !startDate || !endDate || !academicYearId)
      return { error: 'All fields are required.' }
    await api.createTerm(token, { academicYearId, name, startDate, endDate })
    revalidatePath('/terms')
    return { message: 'Term created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create term.' }
  }
}

export async function updateTermAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string> = {}
    const name = formData.get('name')
    const startDate = formData.get('startDate')
    const endDate = formData.get('endDate')
    const status = formData.get('status')
    if (name) patch.name = String(name)
    if (startDate) patch.startDate = String(startDate)
    if (endDate) patch.endDate = String(endDate)
    if (status) patch.status = String(status)
    await api.updateTerm(token, id, patch)
    revalidatePath('/terms')
    return { message: 'Term updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update term.' }
  }
}

// ── Classes ───────────────────────────────────────────────────────────────

export async function createClassAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const schoolId = String(formData.get('schoolId') ?? '')
    const name = String(formData.get('name') ?? '')
    const code = String(formData.get('code') ?? '')
    const gradeOrder = parseInt(String(formData.get('gradeOrder') ?? ''), 10)
    if (!name || !code || isNaN(gradeOrder)) return { error: 'All fields are required.' }
    await api.createClass(token, { schoolId, name, code, gradeOrder })
    revalidatePath('/classes')
    return { message: 'Class created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create class.' }
  }
}

export async function updateClassAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string | number> = {}
    const name = formData.get('name')
    const code = formData.get('code')
    const gradeOrder = formData.get('gradeOrder')
    const status = formData.get('status')
    if (name) patch.name = String(name)
    if (code) patch.code = String(code)
    if (gradeOrder) patch.gradeOrder = parseInt(String(gradeOrder), 10)
    if (status) patch.status = String(status)
    await api.updateClass(token, id, patch)
    revalidatePath('/classes')
    return { message: 'Class updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update class.' }
  }
}

// ── Sections ──────────────────────────────────────────────────────────────

export async function createSectionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const classId = String(formData.get('classId') ?? '')
    const name = String(formData.get('name') ?? '')
    const capacityRaw = formData.get('capacity')
    const capacity = capacityRaw ? parseInt(String(capacityRaw), 10) : null
    if (!name || !classId) return { error: 'Class and name are required.' }
    await api.createSection(token, { classId, name, capacity })
    revalidatePath('/sections')
    return { message: 'Section created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create section.' }
  }
}

export async function updateSectionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string | number | null> = {}
    const name = formData.get('name')
    const capacityRaw = formData.get('capacity')
    const status = formData.get('status')
    if (name) patch.name = String(name)
    if (capacityRaw !== null)
      patch.capacity = capacityRaw ? parseInt(String(capacityRaw), 10) : null
    if (status) patch.status = String(status)
    await api.updateSection(token, id, patch)
    revalidatePath('/sections')
    return { message: 'Section updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update section.' }
  }
}

// ── Subjects ──────────────────────────────────────────────────────────────

export async function createSubjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const schoolId = String(formData.get('schoolId') ?? '')
    const name = String(formData.get('name') ?? '')
    const code = String(formData.get('code') ?? '')
    if (!name || !code) return { error: 'Name and code are required.' }
    await api.createSubject(token, { schoolId, name, code })
    revalidatePath('/subjects')
    return { message: 'Subject created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create subject.' }
  }
}

export async function updateSubjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, string> = {}
    const name = formData.get('name')
    const code = formData.get('code')
    const status = formData.get('status')
    if (name) patch.name = String(name)
    if (code) patch.code = String(code)
    if (status) patch.status = String(status)
    await api.updateSubject(token, id, patch)
    revalidatePath('/subjects')
    return { message: 'Subject updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update subject.' }
  }
}

// ── Teacher Assignments ───────────────────────────────────────────────────

export async function createTeacherAssignmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const teacherId = String(formData.get('teacherId') ?? '')
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const classId = String(formData.get('classId') ?? '')
    const sectionIdRaw = formData.get('sectionId')
    const subjectIdRaw = formData.get('subjectId')
    const isClassTeacherRaw = formData.get('isClassTeacher')
    const sectionId = sectionIdRaw ? String(sectionIdRaw) : null
    const subjectId = subjectIdRaw ? String(subjectIdRaw) : null
    const isClassTeacher = isClassTeacherRaw === 'true' || isClassTeacherRaw === 'on'

    if (!teacherId || !academicYearId || !classId) {
      return { error: 'Teacher, Academic Year, and Class are required.' }
    }
    await api.createTeacherAssignment(token, {
      teacherId,
      academicYearId,
      classId,
      sectionId,
      subjectId,
      isClassTeacher,
    })
    revalidatePath('/teacher-assignments')
    return { message: 'Teacher assignment created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create teacher assignment.' }
  }
}

export async function updateTeacherAssignmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, unknown> = {}
    const teacherId = formData.get('teacherId')
    const academicYearId = formData.get('academicYearId')
    const classId = formData.get('classId')
    const sectionId = formData.get('sectionId')
    const subjectId = formData.get('subjectId')
    const isClassTeacher = formData.get('isClassTeacher')
    const status = formData.get('status')

    if (teacherId) patch.teacherId = String(teacherId)
    if (academicYearId) patch.academicYearId = String(academicYearId)
    if (classId) patch.classId = String(classId)
    if (sectionId !== null) patch.sectionId = sectionId ? String(sectionId) : null
    if (subjectId !== null) patch.subjectId = subjectId ? String(subjectId) : null
    if (isClassTeacher !== null)
      patch.isClassTeacher = isClassTeacher === 'true' || isClassTeacher === 'on'
    if (status) patch.status = String(status)

    await api.updateTeacherAssignment(token, id, patch)
    revalidatePath('/teacher-assignments')
    return { message: 'Teacher assignment updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update teacher assignment.' }
  }
}

// ── Timetable ─────────────────────────────────────────────────────────────

export async function createTimetableEntryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const classId = String(formData.get('classId') ?? '')
    const sectionIdRaw = formData.get('sectionId')
    const subjectId = String(formData.get('subjectId') ?? '')
    const teacherIdRaw = formData.get('teacherId')
    const weekday = parseInt(String(formData.get('weekday') ?? ''), 10)
    const startTime = String(formData.get('startTime') ?? '')
    const endTime = String(formData.get('endTime') ?? '')
    const roomRaw = formData.get('room')

    const sectionId = sectionIdRaw ? String(sectionIdRaw) : null
    const teacherId = teacherIdRaw ? String(teacherIdRaw) : null
    const room = roomRaw ? String(roomRaw) : null

    if (!academicYearId || !classId || !subjectId || isNaN(weekday) || !startTime || !endTime) {
      return { error: 'Academic Year, Class, Subject, Weekday, Start Time, and End Time are required.' }
    }

    await api.createTimetableEntry(token, {
      academicYearId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      weekday,
      startTime,
      endTime,
      room,
    })
    revalidatePath('/timetable')
    return { message: 'Timetable entry created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create timetable entry.' }
  }
}

export async function updateTimetableEntryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, unknown> = {}
    const academicYearId = formData.get('academicYearId')
    const classId = formData.get('classId')
    const sectionId = formData.get('sectionId')
    const subjectId = formData.get('subjectId')
    const teacherId = formData.get('teacherId')
    const weekday = formData.get('weekday')
    const startTime = formData.get('startTime')
    const endTime = formData.get('endTime')
    const room = formData.get('room')
    const status = formData.get('status')

    if (academicYearId) patch.academicYearId = String(academicYearId)
    if (classId) patch.classId = String(classId)
    if (sectionId !== null) patch.sectionId = sectionId ? String(sectionId) : null
    if (subjectId) patch.subjectId = String(subjectId)
    if (teacherId !== null) patch.teacherId = teacherId ? String(teacherId) : null
    if (weekday) patch.weekday = parseInt(String(weekday), 10)
    if (startTime) patch.startTime = String(startTime)
    if (endTime) patch.endTime = String(endTime)
    if (room !== null) patch.room = room ? String(room) : null
    if (status) patch.status = String(status)

    await api.updateTimetableEntry(token, id, patch)
    revalidatePath('/timetable')
    return { message: 'Timetable entry updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update timetable entry.' }
  }
}

export async function deleteTimetableEntryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'ID is required.' }
    await api.deleteTimetableEntry(token, id)
    revalidatePath('/timetable')
    return { message: 'Timetable entry deleted.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete timetable entry.' }
  }
}

// ── Phase 3: Students ──────────────────────────────────────────────────────

export async function createStudentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const schoolId = String(formData.get('schoolId') ?? '')
    const fullName = String(formData.get('fullName') ?? '')
    const dateOfBirth = String(formData.get('dateOfBirth') ?? '')
    const gender = String(formData.get('gender') ?? '') as 'male' | 'female' | 'other'
    const studentNumber = formData.get('studentNumber') ? String(formData.get('studentNumber')) : undefined
    const admissionDate = formData.get('admissionDate') ? String(formData.get('admissionDate')) : undefined
    const address = formData.get('address') ? String(formData.get('address')) : null
    const emergencyNotes = formData.get('emergencyNotes') ? String(formData.get('emergencyNotes')) : null

    if (!schoolId || !fullName || !dateOfBirth || !gender) {
      return { error: 'School, Full Name, Date of Birth, and Gender are required.' }
    }
    await api.createStudent(token, {
      schoolId,
      fullName,
      dateOfBirth,
      gender,
      studentNumber,
      admissionDate,
      address,
      emergencyNotes,
    })
    revalidatePath('/students')
    return { message: 'Student registered successfully.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to register student.' }
  }
}

export async function updateStudentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, unknown> = {}
    const fullName = formData.get('fullName')
    const gender = formData.get('gender')
    const address = formData.get('address')
    const emergencyNotes = formData.get('emergencyNotes')
    const status = formData.get('status')
    if (fullName) patch.fullName = String(fullName)
    if (gender) patch.gender = String(gender)
    if (address !== null) patch.address = address ? String(address) : null
    if (emergencyNotes !== null) patch.emergencyNotes = emergencyNotes ? String(emergencyNotes) : null
    if (status) patch.status = String(status)

    await api.updateStudent(token, id, patch)
    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    return { message: 'Student updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update student.' }
  }
}

export async function archiveStudentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Student ID is required.' }
    await api.archiveStudent(token, id)
    revalidatePath('/students')
    revalidatePath(`/students/${id}`)
    return { message: 'Student archived.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to archive student.' }
  }
}

// ── Phase 3: Student Documents ─────────────────────────────────────────────

export async function createStudentDocumentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const studentId = String(formData.get('studentId') ?? '')
    const fileName = String(formData.get('fileName') ?? '')
    const storagePath = String(formData.get('storagePath') ?? '')
    const mimeType = String(formData.get('mimeType') ?? 'application/pdf')
    const sizeBytes = parseInt(String(formData.get('sizeBytes') ?? '1024'), 10)

    if (!studentId || !fileName || !storagePath) {
      return { error: 'Student, File Name, and Storage Path are required.' }
    }
    await api.createStudentDocument(token, studentId, { fileName, storagePath, mimeType, sizeBytes })
    revalidatePath(`/students/${studentId}`)
    return { message: 'Document uploaded.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to upload document.' }
  }
}

export async function deleteStudentDocumentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const studentId = String(formData.get('studentId') ?? '')
    const documentId = String(formData.get('documentId') ?? '')
    if (!studentId || !documentId) return { error: 'Student and Document IDs are required.' }
    await api.deleteStudentDocument(token, studentId, documentId)
    revalidatePath(`/students/${studentId}`)
    return { message: 'Document deleted.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete document.' }
  }
}

// ── Phase 3: Parents ───────────────────────────────────────────────────────

export async function createParentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const profileId = String(formData.get('profileId') ?? '')
    const fullName = String(formData.get('fullName') ?? '')
    const phone = formData.get('phone') ? String(formData.get('phone')) : null
    const email = formData.get('email') ? String(formData.get('email')) : null
    const occupation = formData.get('occupation') ? String(formData.get('occupation')) : null
    const address = formData.get('address') ? String(formData.get('address')) : null

    if (!profileId || !fullName) return { error: 'Profile and Full Name are required.' }
    await api.createParent(token, { profileId, fullName, phone, email, occupation, address })
    revalidatePath('/parents')
    return { message: 'Parent profile created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create parent profile.' }
  }
}

export async function updateParentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, unknown> = {}
    const fullName = formData.get('fullName')
    const phone = formData.get('phone')
    const email = formData.get('email')
    const occupation = formData.get('occupation')
    const address = formData.get('address')
    const status = formData.get('status')

    if (fullName) patch.fullName = String(fullName)
    if (phone !== null) patch.phone = phone ? String(phone) : null
    if (email !== null) patch.email = email ? String(email) : null
    if (occupation !== null) patch.occupation = occupation ? String(occupation) : null
    if (address !== null) patch.address = address ? String(address) : null
    if (status) patch.status = String(status)

    await api.updateParent(token, id, patch)
    revalidatePath('/parents')
    return { message: 'Parent updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update parent.' }
  }
}

export async function linkStudentParentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const studentId = String(formData.get('studentId') ?? '')
    const parentId = String(formData.get('parentId') ?? '')
    const relationship = String(formData.get('relationship') ?? 'guardian') as 'father' | 'mother' | 'guardian' | 'other'
    const isPrimary = formData.get('isPrimary') === 'true' || formData.get('isPrimary') === 'on'
    const receivesNotifications = formData.get('receivesNotifications') !== 'false'

    if (!studentId || !parentId) return { error: 'Student and Parent are required.' }
    await api.linkStudentParent(token, studentId, { parentId, relationship, isPrimary, receivesNotifications })
    revalidatePath(`/students/${studentId}`)
    revalidatePath('/parents')
    return { message: 'Parent linked to student.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to link parent.' }
  }
}

// ── Phase 3: Teachers ──────────────────────────────────────────────────────

export async function createTeacherAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const profileId = String(formData.get('profileId') ?? '')
    const employeeNumber = formData.get('employeeNumber') ? String(formData.get('employeeNumber')) : undefined
    const qualification = formData.get('qualification') ? String(formData.get('qualification')) : null
    const joiningDate = formData.get('joiningDate') ? String(formData.get('joiningDate')) : undefined
    const employmentStatus = formData.get('employmentStatus') ? (String(formData.get('employmentStatus')) as 'active' | 'inactive' | 'on_leave' | 'resigned' | 'terminated') : undefined

    if (!profileId) return { error: 'Profile is required.' }
    await api.createTeacher(token, { profileId, employeeNumber, qualification, joiningDate, employmentStatus })
    revalidatePath('/teachers')
    return { message: 'Teacher record created.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create teacher record.' }
  }
}

export async function updateTeacherAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const patch: Record<string, unknown> = {}
    const employeeNumber = formData.get('employeeNumber')
    const qualification = formData.get('qualification')
    const joiningDate = formData.get('joiningDate')
    const employmentStatus = formData.get('employmentStatus')

    if (employeeNumber) patch.employeeNumber = String(employeeNumber)
    if (qualification !== null) patch.qualification = qualification ? String(qualification) : null
    if (joiningDate) patch.joiningDate = String(joiningDate)
    if (employmentStatus) patch.employmentStatus = String(employmentStatus)

    await api.updateTeacher(token, id, patch)
    revalidatePath('/teachers')
    return { message: 'Teacher updated.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update teacher.' }
  }
}

// ── Phase 3: Enrollments ───────────────────────────────────────────────────

export async function createEnrollmentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const studentId = String(formData.get('studentId') ?? '')
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const classId = String(formData.get('classId') ?? '')
    const sectionIdRaw = formData.get('sectionId')
    const rollNumberRaw = formData.get('rollNumber')
    const sectionId = sectionIdRaw ? String(sectionIdRaw) : null
    const rollNumber = rollNumberRaw ? parseInt(String(rollNumberRaw), 10) : null

    if (!studentId || !academicYearId || !classId) {
      return { error: 'Student, Academic Year, and Class are required.' }
    }
    await api.createEnrollment(token, { studentId, academicYearId, classId, sectionId, rollNumber })
    revalidatePath('/enrollments')
    revalidatePath(`/students/${studentId}`)
    return { message: 'Student enrolled successfully.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to enroll student.' }
  }
}

export async function promoteEnrollmentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const targetAcademicYearId = String(formData.get('targetAcademicYearId') ?? '')
    const targetClassId = String(formData.get('targetClassId') ?? '')
    const targetSectionIdRaw = formData.get('targetSectionId')
    const newRollNumberRaw = formData.get('newRollNumber')
    const targetSectionId = targetSectionIdRaw ? String(targetSectionIdRaw) : null
    const newRollNumber = newRollNumberRaw ? parseInt(String(newRollNumberRaw), 10) : null

    if (!id || !targetAcademicYearId || !targetClassId) {
      return { error: 'Enrollment ID, Target Academic Year, and Target Class are required.' }
    }
    await api.promoteEnrollment(token, id, { targetAcademicYearId, targetClassId, targetSectionId, newRollNumber })
    revalidatePath('/enrollments')
    return { message: 'Student promoted successfully.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to promote student.' }
  }
}

export async function transferEnrollmentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const targetClassIdRaw = formData.get('targetClassId')
    const targetSectionId = String(formData.get('targetSectionId') ?? '')
    const newRollNumberRaw = formData.get('newRollNumber')
    const targetClassId = targetClassIdRaw ? String(targetClassIdRaw) : undefined
    const newRollNumber = newRollNumberRaw ? parseInt(String(newRollNumberRaw), 10) : null

    if (!id || !targetSectionId) return { error: 'Enrollment ID and Target Section are required.' }
    await api.transferEnrollment(token, id, { targetClassId, targetSectionId, newRollNumber })
    revalidatePath('/enrollments')
    return { message: 'Student transferred successfully.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to transfer student.' }
  }
}

export async function withdrawEnrollmentAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const reason = formData.get('reason') ? String(formData.get('reason')) : undefined
    if (!id) return { error: 'Enrollment ID is required.' }
    await api.withdrawEnrollment(token, id, reason)
    revalidatePath('/enrollments')
    return { message: 'Student enrollment withdrawn.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to withdraw enrollment.' }
  }
}

// ── Phase 4: Attendance Actions ──────────────────────────────────────────

export async function bulkMarkAttendanceAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const classId = String(formData.get('classId') ?? '')
    const sectionId = formData.get('sectionId') ? String(formData.get('sectionId')) : null
    const attendanceDate = String(formData.get('attendanceDate') ?? '')
    const recordsJson = String(formData.get('recordsJson') ?? '[]')

    const records = JSON.parse(recordsJson)
    if (!academicYearId || !classId || !attendanceDate || records.length === 0) {
      return { error: 'Academic Year, Class, Date, and at least one student selection are required.' }
    }

    await api.bulkMarkAttendance(token, {
      academicYearId,
      classId,
      sectionId,
      attendanceDate,
      records,
    })

    revalidatePath('/attendance')
    revalidatePath('/teacher/attendance')
    return { message: `Attendance marked successfully for ${records.length} students.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to mark attendance.' }
  }
}

export async function lockAttendanceSessionAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Session ID is required.' }
    await api.lockAttendanceSession(token, id)
    revalidatePath('/attendance')
    return { message: 'Attendance session locked.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to lock attendance session.' }
  }
}

export async function requestAttendanceCorrectionAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const attendanceRecordId = String(formData.get('attendanceRecordId') ?? '')
    const requestedStatus = String(formData.get('requestedStatus') ?? '')
    const reason = String(formData.get('reason') ?? '')

    if (!attendanceRecordId || !requestedStatus || !reason) {
      return { error: 'Record ID, requested status, and justification reason are required.' }
    }

    await api.requestAttendanceCorrection(token, { attendanceRecordId, requestedStatus, reason })
    revalidatePath('/attendance/corrections')
    revalidatePath('/teacher/attendance')
    return { message: 'Correction request submitted to Admin.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to request correction.' }
  }
}

export async function reviewAttendanceCorrectionAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? '') as 'approved' | 'rejected'

    if (!id || !status) return { error: 'Correction ID and status are required.' }
    await api.reviewAttendanceCorrection(token, id, status)
    revalidatePath('/attendance/corrections')
    return { message: `Correction request ${status}.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to review correction.' }
  }
}

// ── Phase 5: Homework, Progress, Announcements Actions ────────────────────

export async function createHomeworkAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const teacherAssignmentId = String(formData.get('teacherAssignmentId') ?? '')
    const title = String(formData.get('title') ?? '')
    const instructions = String(formData.get('instructions') ?? '')
    const assignedDate = String(formData.get('assignedDate') ?? '')
    const dueDate = String(formData.get('dueDate') ?? '')
    const attachmentPath = formData.get('attachmentPath') ? String(formData.get('attachmentPath')) : null

    if (!teacherAssignmentId || !title || !instructions || !assignedDate || !dueDate) {
      return { error: 'Assignment, Title, Instructions, Assigned Date, and Due Date are required.' }
    }

    await api.createHomework(token, { teacherAssignmentId, title, instructions, assignedDate, dueDate, attachmentPath })
    revalidatePath('/homework')
    revalidatePath('/teacher/homework')
    revalidatePath('/parent/homework')
    return { message: 'Homework assignment published.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create homework.' }
  }
}

export async function deleteHomeworkAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Homework ID is required.' }
    await api.deleteHomework(token, id)
    revalidatePath('/homework')
    revalidatePath('/teacher/homework')
    return { message: 'Homework assignment deleted.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete homework.' }
  }
}

export async function recordStudentProgressAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const studentId = String(formData.get('studentId') ?? '')
    const academicYearId = String(formData.get('academicYearId') ?? '')
    const termId = String(formData.get('termId') ?? '')
    const subjectId = formData.get('subjectId') ? String(formData.get('subjectId')) : null
    const categoryId = String(formData.get('categoryId') ?? '')
    const rating = String(formData.get('rating') ?? '')
    const note = formData.get('note') ? String(formData.get('note')) : null
    const visibilityStatus = String(formData.get('visibilityStatus') ?? 'draft')

    if (!studentId || !academicYearId || !termId || !categoryId || !rating) {
      return { error: 'Student, Academic Year, Term, Category, and Rating are required.' }
    }

    await api.recordStudentProgress(token, {
      studentId,
      academicYearId,
      termId,
      subjectId,
      categoryId,
      rating,
      note,
      visibilityStatus,
    })

    revalidatePath('/progress')
    revalidatePath('/teacher/progress')
    revalidatePath('/parent/progress')
    return { message: 'Student progress recorded.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to record progress.' }
  }
}

export async function publishStudentProgressAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Progress record ID is required.' }
    await api.publishStudentProgress(token, id)
    revalidatePath('/progress')
    revalidatePath('/parent/progress')
    return { message: 'Progress published for Parent visibility.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to publish progress.' }
  }
}

export async function createAnnouncementAction(
  _state: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  try {
    const token = await getToken()
    const schoolId = String(formData.get('schoolId') ?? '')
    const title = String(formData.get('title') ?? '')
    const body = String(formData.get('body') ?? '')
    const priority = String(formData.get('priority') ?? 'normal')

    if (!schoolId || !title || !body) {
      return { error: 'School, Title, and Body are required.' }
    }

    await api.createAnnouncement(token, { schoolId, title, body, priority: priority as 'low' | 'normal' | 'high' | 'urgent' })
    revalidatePath('/announcements')
    revalidatePath('/parent/announcements')
    return { message: 'Announcement created and published.' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create announcement.' }
  }
}


