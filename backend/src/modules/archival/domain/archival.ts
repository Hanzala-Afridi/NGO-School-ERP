export interface AcademicYearArchiveEntity {
  id: string
  academicYearId: string
  archiveName: string
  notes?: string | null
  archivedAt: string
  archivedBy: string
  summaryJson?: Record<string, unknown> | null
  createdAt: string
}
