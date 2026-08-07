import { SupabaseClient } from '@supabase/supabase-js'
import {
  CreateRationCycleDto,
  CreateRationPackageDto,
  IssueRationDto,
  RationAllocation,
  RationCycle,
  RationDistribution,
  RationPackage,
  ReverseRationDto,
} from '@ngo-school-erp/contracts'

export class SupabaseRationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPackages(): Promise<RationPackage[]> {
    const { data, error } = await this.supabase
      .from('ration_packages')
      .select('*, items:ration_package_items(*)')
      .order('name')

    if (error || !data) return []
    return data.map((d) => this.mapPackage(d))
  }

  async createPackage(dto: CreateRationPackageDto): Promise<RationPackage> {
    const { data: pkg, error: pkgErr } = await this.supabase
      .from('ration_packages')
      .insert({ name: dto.name, description: dto.description || null, active: true })
      .select('*')
      .single()

    if (pkgErr || !pkg) throw new Error(`Create ration package failed: ${pkgErr?.message}`)

    if (dto.items.length > 0) {
      const itemsPayload = dto.items.map((i) => ({
        ration_package_id: pkg.id,
        inventory_item_id: i.inventoryItemId,
        quantity: i.quantity,
      }))
      await this.supabase.from('ration_package_items').insert(itemsPayload)
    }

    const created = await this.supabase
      .from('ration_packages')
      .select('*, items:ration_package_items(*)')
      .eq('id', pkg.id)
      .single()

    return this.mapPackage(created.data)
  }

  async listCycles(): Promise<RationCycle[]> {
    const { data, error } = await this.supabase
      .from('ration_cycles')
      .select('*')
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapCycle(d))
  }

  async createCycle(dto: CreateRationCycleDto): Promise<RationCycle> {
    const { data, error } = await this.supabase
      .from('ration_cycles')
      .insert({
        name: dto.name,
        period_month: dto.periodMonth,
        period_year: dto.periodYear,
        distribution_start: dto.distributionStart,
        distribution_end: dto.distributionEnd,
        status: 'draft',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create ration cycle failed: ${error?.message}`)
    return this.mapCycle(data)
  }

  async generateAllocations(cycleId: string, actorProfileId: string): Promise<{ count: number }> {
    const { data: cycle, error: cycleErr } = await this.supabase
      .from('ration_cycles')
      .select('*')
      .eq('id', cycleId)
      .single()

    if (cycleErr || !cycle) throw new Error('Ration cycle not found')
    if (cycle.status === 'closed' || cycle.status === 'completed') {
      throw new Error('Cannot generate allocations for completed or closed cycle')
    }

    const { data: defaultPkg } = await this.supabase
      .from('ration_packages')
      .select('id')
      .eq('active', true)
      .limit(1)
      .single()

    if (!defaultPkg) throw new Error('No active default ration package found')

    const { data: eligibleHouseholds } = await this.supabase
      .from('households')
      .select('*')
      .eq('eligibility_status', 'eligible')

    if (!eligibleHouseholds || eligibleHouseholds.length === 0) {
      return { count: 0 }
    }

    const payload = eligibleHouseholds.map((h) => ({
      ration_cycle_id: cycleId,
      household_id: h.id,
      ration_package_id: defaultPkg.id,
      approval_status: 'pending',
      eligibility_snapshot: {
        eligibilityStatus: h.eligibility_status,
        householdSize: h.household_size,
        incomeCategory: h.income_category,
        verificationStatus: h.verification_status,
      },
    }))

    const { data: inserted, error: insErr } = await this.supabase
      .from('ration_allocations')
      .upsert(payload, { onConflict: 'ration_cycle_id,household_id' })
      .select('id')

    if (insErr) throw new Error(`Generate allocations failed: ${insErr.message}`)

    await this.supabase
      .from('ration_cycles')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', cycleId)

    return { count: inserted?.length || 0 }
  }

  async listAllocations(cycleId: string): Promise<RationAllocation[]> {
    const { data, error } = await this.supabase
      .from('ration_allocations')
      .select('*')
      .eq('ration_cycle_id', cycleId)

    if (error || !data) return []
    return data.map((d) => this.mapAllocation(d))
  }

  async approveAllocation(actorProfileId: string, allocationId: string): Promise<RationAllocation> {
    const { data, error } = await this.supabase
      .from('ration_allocations')
      .update({
        approval_status: 'approved',
        approved_by: actorProfileId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', allocationId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Approve allocation failed: ${error?.message}`)
    return this.mapAllocation(data)
  }

  async issueRation(actorProfileId: string, dto: IssueRationDto): Promise<{ distributionId: string; allocationId: string }> {
    const { data, error } = await this.supabase.rpc('rpc_issue_ration_allocation', {
      p_allocation_id: dto.allocationId,
      p_method: dto.distributionMethod,
      p_received_name: dto.receivedByName || null,
      p_ack_path: dto.acknowledgmentPath || null,
      p_actor_id: actorProfileId,
    })

    if (error) throw new Error(`Issue ration failed: ${error.message}`)
    return { distributionId: data.distributionId, allocationId: data.allocationId }
  }

  async reverseRation(actorProfileId: string, distributionId: string, dto: ReverseRationDto): Promise<RationDistribution> {
    const { error } = await this.supabase.rpc('rpc_reverse_ration_distribution', {
      p_distribution_id: distributionId,
      p_reason: dto.reversalReason,
      p_actor_id: actorProfileId,
    })

    if (error) throw new Error(`Reverse ration failed: ${error.message}`)

    const { data } = await this.supabase
      .from('ration_distributions')
      .select('*')
      .eq('id', distributionId)
      .single()

    return this.mapDistribution(data)
  }

  async getParentRationStatus(householdId: string): Promise<RationAllocation[]> {
    const { data, error } = await this.supabase
      .from('ration_allocations')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapAllocation(d))
  }

  private mapPackage(d: any): RationPackage {
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      active: d.active,
      items: d.items
        ? d.items.map((i: any) => ({
            id: i.id,
            rationPackageId: i.ration_package_id,
            inventoryItemId: i.inventory_item_id,
            quantity: i.quantity,
            createdAt: i.created_at,
          }))
        : [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapCycle(d: any): RationCycle {
    return {
      id: d.id,
      name: d.name,
      periodMonth: d.period_month,
      periodYear: d.period_year,
      distributionStart: d.distribution_start,
      distributionEnd: d.distribution_end,
      status: d.status,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapAllocation(d: any): RationAllocation {
    return {
      id: d.id,
      rationCycleId: d.ration_cycle_id,
      householdId: d.household_id,
      rationPackageId: d.ration_package_id,
      approvalStatus: d.approval_status,
      approvedBy: d.approved_by,
      eligibilitySnapshot: d.eligibility_snapshot,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapDistribution(d: any): RationDistribution {
    return {
      id: d.id,
      rationAllocationId: d.ration_allocation_id,
      distributionMethod: d.distribution_method,
      distributionDate: d.distribution_date,
      status: d.status,
      issuedBy: d.issued_by,
      receivedByName: d.received_by_name,
      acknowledgmentPath: d.acknowledgment_path,
      nonIssueReason: d.non_issue_reason,
      reversalReason: d.reversal_reason,
      reversedBy: d.reversed_by,
      reversedAt: d.reversed_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
