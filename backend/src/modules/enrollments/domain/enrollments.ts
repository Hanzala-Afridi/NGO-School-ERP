import type { Enrollment, EnrollmentStatus } from '@ngo-school-erp/contracts'

export interface EnrollmentsRepository {
  listEnrollments(filter?: {
    studentId?: string
    academicYearId?: string
    classId?: string
    sectionId?: string
    status?: EnrollmentStatus
    page?: number
    limit?: number
  }): Promise<{ items: Enrollment[]; total: number }>
  findEnrollmentById(id: string): Promise<Enrollment | null>
  findActiveEnrollment(studentId: string, academicYearId: string): Promise<Enrollment | null>
  createEnrollment(input: {
    studentId: string
    academicYearId: string
    classId: string
    sectionId?: string | null
    rollNumber?: number | null
    startDate?: string
  }): Promise<Enrollment>
  updateEnrollment(
    id: string,
    patch: Partial<{
      classId: string
      sectionId: string | null
      rollNumber: number | null
      status: EnrollmentStatus
      endDate: string | null
    }>,
  ): Promise<Enrollment>
}
