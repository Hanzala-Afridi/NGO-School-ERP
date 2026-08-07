import { AcademicYearArchive, ArchiveAcademicYearDto } from '@ngo-school-erp/contracts'
import { SupabaseArchivalRepository } from '../infrastructure/supabase-archival.repository.js'

export class ArchivalService {
  constructor(private readonly repository: SupabaseArchivalRepository) {}

  async archiveAcademicYear(actorProfileId: string, dto: ArchiveAcademicYearDto): Promise<{ archiveId: string; academicYearId: string }> {
    if (!dto.academicYearId) {
      throw new Error('Academic year ID is required')
    }
    return this.repository.archiveAcademicYear(actorProfileId, dto)
  }

  listAcademicYearArchives(): Promise<AcademicYearArchive[]> {
    return this.repository.listAcademicYearArchives()
  }
}
