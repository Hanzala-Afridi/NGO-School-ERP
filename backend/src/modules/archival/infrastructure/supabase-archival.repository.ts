import { SupabaseClient } from '@supabase/supabase-js'
import { AcademicYearArchive, ArchiveAcademicYearDto } from '@ngo-school-erp/contracts'

export class SupabaseArchivalRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async archiveAcademicYear(actorProfileId: string, dto: ArchiveAcademicYearDto): Promise<{ archiveId: string; academicYearId: string }> {
    const { data, error } = await this.supabase.rpc('rpc_archive_academic_year', {
      p_academic_year_id: dto.academicYearId,
      p_notes: dto.notes || null,
      p_actor_id: actorProfileId,
    })

    if (error) throw new Error(`Archive academic year failed: ${error.message}`)
    return { archiveId: data.archiveId, academicYearId: data.academicYearId }
  }

  async listAcademicYearArchives(): Promise<AcademicYearArchive[]> {
    const { data, error } = await this.supabase
      .from('academic_year_archives')
      .select('*')
      .order('archived_at', { ascending: false })

    if (error || !data) return []

    return data.map((d) => ({
      id: d.id,
      academicYearId: d.academic_year_id,
      archiveName: d.archive_name,
      notes: d.notes,
      archivedAt: d.archived_at,
      archivedBy: d.archived_by,
      summaryJson: d.summary_json,
      createdAt: d.created_at,
    }))
  }
}
