export type EnrollmentStatus = 'active' | 'promoted' | 'transferred' | 'withdrawn' | 'completed'

export interface Enrollment {
  id: string
  studentId: string
  academicYearId: string
  classId: string
  sectionId: string | null
  rollNumber: number | null
  status: EnrollmentStatus
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  entityType: string
  entityId: string
  fileName: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  uploadedBy: string | null
  createdAt: string
}
