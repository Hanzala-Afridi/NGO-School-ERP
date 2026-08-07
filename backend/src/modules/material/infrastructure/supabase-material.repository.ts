import { SupabaseClient } from '@supabase/supabase-js'
import { IssueStudentMaterialDto, StudentDistribution } from '@ngo-school-erp/contracts'

export class SupabaseMaterialRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listStudentDistributions(studentId?: string): Promise<StudentDistribution[]> {
    let query = this.supabase.from('student_distributions').select('*').order('created_at', { ascending: false })
    if (studentId) query = query.eq('student_id', studentId)
    const { data, error } = await query
    if (error || !data) return []
    return data.map((d) => this.mapDistribution(d))
  }

  async issueStudentMaterial(actorProfileId: string, dto: IssueStudentMaterialDto): Promise<{ distributionId: string; studentId: string }> {
    const { data, error } = await this.supabase.rpc('rpc_issue_student_material', {
      p_student_id: dto.studentId,
      p_item_id: dto.inventoryItemId,
      p_location_id: dto.storageLocationId,
      p_type: dto.distributionType,
      p_quantity: dto.quantity,
      p_size_variant: dto.sizeOrVariant || null,
      p_reason: dto.reason || null,
      p_received_name: dto.receivedByName || null,
      p_ack_path: null,
      p_actor_id: actorProfileId,
    })

    if (error) throw new Error(`Issue student material failed: ${error.message}`)
    return { distributionId: data.distributionId, studentId: data.studentId }
  }

  async approveReplacement(actorProfileId: string, distributionId: string): Promise<StudentDistribution> {
    const { data, error } = await this.supabase
      .from('student_distributions')
      .update({
        approval_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', distributionId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Approve replacement failed: ${error?.message}`)
    return this.mapDistribution(data)
  }

  private mapDistribution(d: any): StudentDistribution {
    return {
      id: d.id,
      studentId: d.student_id,
      inventoryItemId: d.inventory_item_id,
      distributionType: d.distribution_type,
      quantity: d.quantity,
      sizeOrVariant: d.size_or_variant,
      issueDate: d.issue_date,
      reason: d.reason,
      replacementOfDistributionId: d.replacement_of_distribution_id,
      approvalStatus: d.approval_status,
      issuedBy: d.issued_by,
      receivedByName: d.received_by_name,
      acknowledgmentPath: d.acknowledgment_path,
      reversedAt: d.reversed_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
