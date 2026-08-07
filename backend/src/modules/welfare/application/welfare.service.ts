import {
  AddHouseholdMemberDto,
  CreateHouseholdDto,
  CreateWelfareAssessmentDto,
  Household,
  HouseholdMember,
  WelfareAssessment,
  WelfareDocument,
} from '@ngo-school-erp/contracts'
import { SupabaseWelfareRepository } from '../infrastructure/supabase-welfare.repository.js'

export class WelfareService {
  constructor(private readonly repository: SupabaseWelfareRepository) {}

  async listHouseholds(hasRestrictedPermission: boolean): Promise<Household[]> {
    const list = await this.repository.listHouseholds()
    if (!hasRestrictedPermission) {
      return list.map((h) => ({ ...h, restrictedNotes: null }))
    }
    return list
  }

  async getHouseholdById(id: string, hasRestrictedPermission: boolean): Promise<Household | null> {
    const h = await this.repository.findHouseholdById(id)
    if (!h) return null
    if (!hasRestrictedPermission) {
      return { ...h, restrictedNotes: null }
    }
    return h
  }

  async getHouseholdByParentId(parentId: string): Promise<Household | null> {
    const h = await this.repository.findHouseholdByParentId(parentId)
    if (!h) return null
    return { ...h, restrictedNotes: null }
  }

  async createHousehold(dto: CreateHouseholdDto): Promise<Household> {
    if (!dto.address || dto.address.trim() === '') {
      throw new Error('Address is required')
    }
    if (dto.householdSize <= 0) {
      throw new Error('Household size must be greater than zero')
    }
    return this.repository.createHousehold(dto)
  }

  async addHouseholdMember(householdId: string, dto: AddHouseholdMemberDto): Promise<HouseholdMember> {
    if (!dto.fullName || dto.fullName.trim() === '') {
      throw new Error('Member full name is required')
    }
    return this.repository.addHouseholdMember(householdId, dto)
  }

  async listHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
    return this.repository.listHouseholdMembers(householdId)
  }

  async createWelfareAssessment(actorProfileId: string, dto: CreateWelfareAssessmentDto): Promise<WelfareAssessment> {
    if (!dto.recommendation || dto.recommendation.trim() === '') {
      throw new Error('Recommendation text is required for welfare assessment')
    }
    return this.repository.createWelfareAssessment(actorProfileId, dto)
  }

  async approveWelfareAssessment(actorProfileId: string, assessmentId: string): Promise<WelfareAssessment> {
    return this.repository.approveWelfareAssessment(actorProfileId, assessmentId)
  }

  async listAssessments(householdId: string): Promise<WelfareAssessment[]> {
    return this.repository.listAssessments(householdId)
  }

  async listDocuments(householdId: string): Promise<WelfareDocument[]> {
    return this.repository.listDocuments(householdId)
  }
}
