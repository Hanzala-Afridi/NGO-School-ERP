import type { AttendanceCorrection, AttendanceRecord, AttendanceSession, AttendanceStatus } from '@ngo-school-erp/contracts'

export type { AttendanceCorrection, AttendanceRecord, AttendanceSession, AttendanceStatus }

export interface BulkMarkAttendanceDto {
  academicYearId: string
  classId: string
  sectionId?: string | null
  attendanceDate: string
  records: Array<{
    studentId: string
    attendanceStatus: AttendanceStatus
    remarks?: string | null
  }>
}

export interface CreateCorrectionRequestDto {
  attendanceRecordId: string
  requestedStatus: AttendanceStatus
  reason: string
}
