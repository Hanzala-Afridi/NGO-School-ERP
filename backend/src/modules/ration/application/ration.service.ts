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
import { SupabaseRationRepository } from '../infrastructure/supabase-ration.repository.js'

export class RationService {
  constructor(private readonly repository: SupabaseRationRepository) {}

  listPackages(): Promise<RationPackage[]> {
    return this.repository.listPackages()
  }

  async createPackage(dto: CreateRationPackageDto): Promise<RationPackage> {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Package name is required')
    }
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Ration package must contain at least one inventory item')
    }
    return this.repository.createPackage(dto)
  }

  listCycles(): Promise<RationCycle[]> {
    return this.repository.listCycles()
  }

  async createCycle(dto: CreateRationCycleDto): Promise<RationCycle> {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Cycle name is required')
    }
    if (dto.periodMonth < 1 || dto.periodMonth > 12) {
      throw new Error('Invalid period month')
    }
    return this.repository.createCycle(dto)
  }

  generateAllocations(cycleId: string, actorProfileId: string): Promise<{ count: number }> {
    return this.repository.generateAllocations(cycleId, actorProfileId)
  }

  listAllocations(cycleId: string): Promise<RationAllocation[]> {
    return this.repository.listAllocations(cycleId)
  }

  approveAllocation(actorProfileId: string, allocationId: string): Promise<RationAllocation> {
    return this.repository.approveAllocation(actorProfileId, allocationId)
  }

  issueRation(actorProfileId: string, dto: IssueRationDto): Promise<{ distributionId: string; allocationId: string }> {
    return this.repository.issueRation(actorProfileId, dto)
  }

  async reverseRation(actorProfileId: string, distributionId: string, dto: ReverseRationDto): Promise<RationDistribution> {
    if (!dto.reversalReason || dto.reversalReason.trim() === '') {
      throw new Error('Reversal reason is required')
    }
    return this.repository.reverseRation(actorProfileId, distributionId, dto)
  }

  getParentRationStatus(householdId: string): Promise<RationAllocation[]> {
    return this.repository.getParentRationStatus(householdId)
  }
}
