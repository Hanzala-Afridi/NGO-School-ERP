import { SupabaseClient } from '@supabase/supabase-js'
import {
  AddHouseholdMemberDto,
  CreateHouseholdDto,
  CreateWelfareAssessmentDto,
  Household,
  HouseholdMember,
  WelfareAssessment,
  WelfareDocument,
} from '@ngo-school-erp/contracts'

export class SupabaseWelfareRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listHouseholds(): Promise<Household[]> {
    const { data, error } = await this.supabase
      .from('households')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapHousehold(d))
  }

  async findHouseholdById(id: string): Promise<Household | null> {
    const { data, error } = await this.supabase
      .from('households')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return this.mapHousehold(data)
  }

  async findHouseholdByParentId(parentId: string): Promise<Household | null> {
    const { data, error } = await this.supabase
      .from('households')
      .select('*')
      .eq('primary_parent_id', parentId)
      .maybeSingle()

    if (error || !data) return null
    return this.mapHousehold(data)
  }

  async createHousehold(dto: CreateHouseholdDto): Promise<Household> {
    const code = `HH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const { data, error } = await this.supabase
      .from('households')
      .insert({
        household_code: code,
        primary_parent_id: dto.primaryParentId || null,
        address: dto.address,
        household_size: dto.householdSize,
        income_category: dto.incomeCategory,
        housing_status: dto.housingStatus,
        eligibility_status: dto.eligibilityStatus || 'under_review',
        restricted_notes: dto.restrictedNotes || null,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create household failed: ${error?.message}`)
    return this.mapHousehold(data)
  }

  async addHouseholdMember(householdId: string, dto: AddHouseholdMemberDto): Promise<HouseholdMember> {
    const { data, error } = await this.supabase
      .from('household_members')
      .insert({
        household_id: householdId,
        full_name: dto.fullName,
        relationship: dto.relationship,
        date_of_birth: dto.dateOfBirth || null,
        occupation: dto.occupation || null,
        student_id: dto.studentId || null,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Add member failed: ${error?.message}`)
    return this.mapMember(data)
  }

  async listHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
    const { data, error } = await this.supabase
      .from('household_members')
      .select('*')
      .eq('household_id', householdId)

    if (error || !data) return []
    return data.map((d) => this.mapMember(d))
  }

  async createWelfareAssessment(actorProfileId: string, dto: CreateWelfareAssessmentDto): Promise<WelfareAssessment> {
    const { data, error } = await this.supabase
      .from('welfare_assessments')
      .insert({
        household_id: dto.householdId,
        assessment_date: dto.assessmentDate,
        assessed_by: actorProfileId,
        vulnerability_level: dto.vulnerabilityLevel,
        recommendation: dto.recommendation,
        next_review_at: dto.nextReviewAt || null,
        status: 'pending_approval',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create assessment failed: ${error?.message}`)
    return this.mapAssessment(data)
  }

  async approveWelfareAssessment(actorProfileId: string, assessmentId: string): Promise<WelfareAssessment> {
    const { data, error } = await this.supabase
      .from('welfare_assessments')
      .update({
        status: 'approved',
        approved_by: actorProfileId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Approve assessment failed: ${error?.message}`)
    return this.mapAssessment(data)
  }

  async listAssessments(householdId: string): Promise<WelfareAssessment[]> {
    const { data, error } = await this.supabase
      .from('welfare_assessments')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapAssessment(d))
  }

  async listDocuments(householdId: string): Promise<WelfareDocument[]> {
    const { data, error } = await this.supabase
      .from('welfare_documents')
      .select('*')
      .eq('household_id', householdId)

    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      householdId: d.household_id,
      documentType: d.document_type,
      storagePath: d.storage_path,
      uploadedBy: d.uploaded_by,
      createdAt: d.created_at,
    }))
  }

  private mapHousehold(d: any): Household {
    return {
      id: d.id,
      householdCode: d.household_code,
      primaryParentId: d.primary_parent_id,
      address: d.address,
      householdSize: d.household_size,
      incomeCategory: d.income_category,
      housingStatus: d.housing_status,
      eligibilityStatus: d.eligibility_status,
      verificationStatus: d.verification_status,
      lastVerifiedAt: d.last_verified_at,
      nextReviewAt: d.next_review_at,
      restrictedNotes: d.restricted_notes,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapMember(d: any): HouseholdMember {
    return {
      id: d.id,
      householdId: d.household_id,
      fullName: d.full_name,
      relationship: d.relationship,
      dateOfBirth: d.date_of_birth,
      occupation: d.occupation,
      studentId: d.student_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapAssessment(d: any): WelfareAssessment {
    return {
      id: d.id,
      householdId: d.household_id,
      assessmentDate: d.assessment_date,
      assessedBy: d.assessed_by,
      vulnerabilityLevel: d.vulnerability_level,
      recommendation: d.recommendation,
      status: d.status,
      approvedBy: d.approved_by,
      approvedAt: d.approved_at,
      nextReviewAt: d.next_review_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
