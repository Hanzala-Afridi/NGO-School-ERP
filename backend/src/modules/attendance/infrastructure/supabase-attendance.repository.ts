import type { SupabaseClient } from '@supabase/supabase-js'
import type { AttendanceCorrection, AttendanceRecord, AttendanceSession, BulkMarkAttendanceDto } from '../domain/attendance.js'

export interface AttendanceRepository {
  findSession(yearId: string, classId: string, sectionId: string | null, date: string): Promise<AttendanceSession | null>
  findSessionById(id: string): Promise<AttendanceSession | null>
  listSessions(filters: { academicYearId?: string; classId?: string; sectionId?: string; date?: string }): Promise<AttendanceSession[]>
  bulkMarkAttendance(actorProfileId: string, dto: BulkMarkAttendanceDto): Promise<{ session: AttendanceSession; recordsCount: number }>
  getSessionRecords(sessionId: string): Promise<Array<AttendanceRecord & { studentName?: string; rollNumber?: number | null }>>
  lockSession(sessionId: string): Promise<AttendanceSession>
  createCorrectionRequest(actorProfileId: string, recordId: string, requestedStatus: string, reason: string): Promise<AttendanceCorrection>
  getCorrectionById(id: string): Promise<AttendanceCorrection | null>
  listPendingCorrections(): Promise<AttendanceCorrection[]>
  reviewCorrection(correctionId: string, reviewerProfileId: string, status: 'approved' | 'rejected'): Promise<AttendanceCorrection>
  getStudentAttendanceHistory(studentId: string): Promise<Array<AttendanceRecord & { attendanceDate: string; classId: string; sectionId: string | null }>>
}

export class SupabaseAttendanceRepository implements AttendanceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findSession(yearId: string, classId: string, sectionId: string | null, date: string): Promise<AttendanceSession | null> {
    let q = this.supabase
      .from('attendance_sessions')
      .select('*')
      .eq('academic_year_id', yearId)
      .eq('class_id', classId)
      .eq('attendance_date', date)

    if (sectionId) {
      q = q.eq('section_id', sectionId)
    } else {
      q = q.is('section_id', null)
    }

    const { data, error } = await q.maybeSingle()
    if (error || !data) return null
    return this.mapSession(data)
  }

  async findSessionById(id: string): Promise<AttendanceSession | null> {
    const { data, error } = await this.supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return this.mapSession(data)
  }

  async listSessions(filters: { academicYearId?: string; classId?: string; sectionId?: string; date?: string }): Promise<AttendanceSession[]> {
    let q = this.supabase.from('attendance_sessions').select('*').order('attendance_date', { ascending: false })
    if (filters.academicYearId) q = q.eq('academic_year_id', filters.academicYearId)
    if (filters.classId) q = q.eq('class_id', filters.classId)
    if (filters.sectionId) q = q.eq('section_id', filters.sectionId)
    if (filters.date) q = q.eq('attendance_date', filters.date)

    const { data, error } = await q
    if (error || !data) return []
    return data.map((d) => this.mapSession(d))
  }

  async bulkMarkAttendance(actorProfileId: string, dto: BulkMarkAttendanceDto): Promise<{ session: AttendanceSession; recordsCount: number }> {
    const existing = await this.findSession(dto.academicYearId, dto.classId, dto.sectionId ?? null, dto.attendanceDate)
    let sessionId: string

    if (existing) {
      if (existing.status === 'locked') {
        throw new Error('Attendance session is locked. Correction request required.')
      }
      sessionId = existing.id
      await this.supabase
        .from('attendance_sessions')
        .update({ status: 'submitted', marked_by: actorProfileId, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
    } else {
      const { data: created, error: createErr } = await this.supabase
        .from('attendance_sessions')
        .insert({
          academic_year_id: dto.academicYearId,
          class_id: dto.classId,
          section_id: dto.sectionId || null,
          attendance_date: dto.attendanceDate,
          status: 'submitted',
          marked_by: actorProfileId,
        })
        .select('*')
        .single()

      if (createErr || !created) throw new Error(`Failed to create session: ${createErr?.message}`)
      sessionId = created.id
    }

    const payload = dto.records.map((r) => ({
      attendance_session_id: sessionId,
      student_id: r.studentId,
      attendance_status: r.attendanceStatus,
      remarks: r.remarks || null,
      marked_at: new Date().toISOString(),
      updated_by: actorProfileId,
    }))

    const { error: upsertErr } = await this.supabase
      .from('attendance_records')
      .upsert(payload, { onConflict: 'attendance_session_id,student_id' })

    if (upsertErr) throw new Error(`Failed to save records: ${upsertErr.message}`)

    const updatedSession = await this.findSessionById(sessionId)
    if (!updatedSession) throw new Error('Session not found after update')
    return { session: updatedSession, recordsCount: payload.length }
  }

  async getSessionRecords(sessionId: string): Promise<Array<AttendanceRecord & { studentName?: string; rollNumber?: number | null }>> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*, students(full_name)')
      .eq('attendance_session_id', sessionId)

    if (error || !data) return []
    return data.map((d: any) => ({
      ...this.mapRecord(d),
      studentName: d.students?.full_name ?? 'Unknown Student',
    }))
  }

  async lockSession(sessionId: string): Promise<AttendanceSession> {
    const { data, error } = await this.supabase
      .from('attendance_sessions')
      .update({ status: 'locked', locked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Failed to lock session: ${error?.message}`)
    return this.mapSession(data)
  }

  async createCorrectionRequest(actorProfileId: string, recordId: string, requestedStatus: string, reason: string): Promise<AttendanceCorrection> {
    const { data: rec, error: recErr } = await this.supabase
      .from('attendance_records')
      .select('*')
      .eq('id', recordId)
      .single()

    if (recErr || !rec) throw new Error('Attendance record not found')

    const { data, error } = await this.supabase
      .from('attendance_corrections')
      .insert({
        attendance_record_id: recordId,
        old_status: rec.attendance_status,
        requested_status: requestedStatus,
        reason,
        requested_by: actorProfileId,
        approval_status: 'pending',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Correction request failed: ${error?.message}`)
    return this.mapCorrection(data)
  }

  async getCorrectionById(id: string): Promise<AttendanceCorrection | null> {
    const { data, error } = await this.supabase
      .from('attendance_corrections')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return this.mapCorrection(data)
  }

  async listPendingCorrections(): Promise<AttendanceCorrection[]> {
    const { data, error } = await this.supabase
      .from('attendance_corrections')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapCorrection(d))
  }

  async reviewCorrection(correctionId: string, reviewerProfileId: string, status: 'approved' | 'rejected'): Promise<AttendanceCorrection> {
    const correction = await this.getCorrectionById(correctionId)
    if (!correction) throw new Error('Correction request not found')
    if (correction.approvalStatus !== 'pending') throw new Error('Correction request already reviewed')

    if (status === 'approved') {
      await this.supabase
        .from('attendance_records')
        .update({ attendance_status: correction.requestedStatus, updated_by: reviewerProfileId })
        .eq('id', correction.attendanceRecordId)
    }

    const { data, error } = await this.supabase
      .from('attendance_corrections')
      .update({
        approval_status: status,
        reviewed_by: reviewerProfileId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', correctionId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Review update failed: ${error?.message}`)
    return this.mapCorrection(data)
  }

  async getStudentAttendanceHistory(studentId: string): Promise<Array<AttendanceRecord & { attendanceDate: string; classId: string; sectionId: string | null }>> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select('*, attendance_sessions(attendance_date, class_id, section_id)')
      .eq('student_id', studentId)
      .order('marked_at', { ascending: false })

    if (error || !data) return []
    return data.map((d: any) => ({
      ...this.mapRecord(d),
      attendanceDate: d.attendance_sessions?.attendance_date ?? '',
      classId: d.attendance_sessions?.class_id ?? '',
      sectionId: d.attendance_sessions?.section_id ?? null,
    }))
  }

  private mapSession(d: any): AttendanceSession {
    return {
      id: d.id,
      academicYearId: d.academic_year_id,
      classId: d.class_id,
      sectionId: d.section_id,
      attendanceDate: d.attendance_date,
      status: d.status,
      markedBy: d.marked_by,
      lockedAt: d.locked_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapRecord(d: any): AttendanceRecord {
    return {
      id: d.id,
      attendanceSessionId: d.attendance_session_id,
      studentId: d.student_id,
      attendanceStatus: d.attendance_status,
      remarks: d.remarks,
      markedAt: d.marked_at,
      updatedBy: d.updated_by,
    }
  }

  private mapCorrection(d: any): AttendanceCorrection {
    return {
      id: d.id,
      attendanceRecordId: d.attendance_record_id,
      oldStatus: d.old_status,
      requestedStatus: d.requested_status,
      reason: d.reason,
      requestedBy: d.requested_by,
      approvalStatus: d.approval_status,
      reviewedBy: d.reviewed_by,
      reviewedAt: d.reviewed_at,
      createdAt: d.created_at,
    }
  }
}
