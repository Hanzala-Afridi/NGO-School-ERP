export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'excused'

export interface AttendanceSession {
  id: string
  academicYearId: string
  classId: string
  sectionId: string | null
  attendanceDate: string
  status: 'draft' | 'submitted' | 'locked'
  markedBy: string | null
  lockedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecord {
  id: string
  attendanceSessionId: string
  studentId: string
  attendanceStatus: AttendanceStatus
  remarks: string | null
  markedAt: string
  updatedBy: string | null
}

export interface AttendanceCorrection {
  id: string
  attendanceRecordId: string
  oldStatus: AttendanceStatus
  requestedStatus: AttendanceStatus
  reason: string
  requestedBy: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface BulkMarkAttendanceInput {
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

export interface CreateCorrectionRequestInput {
  attendanceRecordId: string
  requestedStatus: AttendanceStatus
  reason: string
}
