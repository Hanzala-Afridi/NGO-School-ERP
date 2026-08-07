import type { AttendanceRepository } from '../infrastructure/supabase-attendance.repository.js'
import type { AttendanceCorrection, AttendanceRecord, AttendanceSession, BulkMarkAttendanceDto } from '../domain/attendance.js'

export class AttendanceService {
  constructor(private readonly repo: AttendanceRepository) {}

  async bulkMarkAttendance(actorProfileId: string, dto: BulkMarkAttendanceDto): Promise<{ session: AttendanceSession; recordsCount: number }> {
    return this.repo.bulkMarkAttendance(actorProfileId, dto)
  }

  async getSession(yearId: string, classId: string, sectionId: string | null, date: string): Promise<AttendanceSession | null> {
    return this.repo.findSession(yearId, classId, sectionId, date)
  }

  async getSessionById(id: string): Promise<AttendanceSession | null> {
    return this.repo.findSessionById(id)
  }

  async listSessions(filters: { academicYearId?: string; classId?: string; sectionId?: string; date?: string }): Promise<AttendanceSession[]> {
    return this.repo.listSessions(filters)
  }

  async getSessionRecords(sessionId: string): Promise<Array<AttendanceRecord & { studentName?: string; rollNumber?: number | null }>> {
    return this.repo.getSessionRecords(sessionId)
  }

  async lockSession(sessionId: string): Promise<AttendanceSession> {
    return this.repo.lockSession(sessionId)
  }

  async createCorrectionRequest(actorProfileId: string, recordId: string, requestedStatus: string, reason: string): Promise<AttendanceCorrection> {
    return this.repo.createCorrectionRequest(actorProfileId, recordId, requestedStatus, reason)
  }

  async listPendingCorrections(): Promise<AttendanceCorrection[]> {
    return this.repo.listPendingCorrections()
  }

  async reviewCorrection(correctionId: string, reviewerProfileId: string, status: 'approved' | 'rejected'): Promise<AttendanceCorrection> {
    return this.repo.reviewCorrection(correctionId, reviewerProfileId, status)
  }

  async getStudentAttendanceHistory(studentId: string): Promise<Array<AttendanceRecord & { attendanceDate: string; classId: string; sectionId: string | null }>> {
    return this.repo.getStudentAttendanceHistory(studentId)
  }
}
