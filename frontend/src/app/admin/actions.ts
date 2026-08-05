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
