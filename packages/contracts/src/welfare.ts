export interface Household {
  id: string
  householdCode: string
  primaryParentId?: string | null
  address: string
  householdSize: number
  incomeCategory: 'extremely_low' | 'low' | 'moderate' | 'above_threshold'
  housingStatus: 'owned' | 'rented' | 'temporary' | 'homeless'
  eligibilityStatus: 'eligible' | 'under_review' | 'ineligible' | 'suspended'
  verificationStatus: 'verified' | 'unverified' | 'rejected'
  lastVerifiedAt?: string | null
  nextReviewAt?: string | null
  restrictedNotes?: string | null
  createdAt: string
  updatedAt: string
}

export interface HouseholdMember {
  id: string
  householdId: string
  fullName: string
  relationship: string
  dateOfBirth?: string | null
  occupation?: string | null
  studentId?: string | null
  createdAt: string
  updatedAt: string
}

export interface WelfareAssessment {
  id: string
  householdId: string
  assessmentDate: string
  assessedBy: string
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  approvedBy?: string | null
  approvedAt?: string | null
  nextReviewAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface WelfareDocument {
  id: string
  householdId: string
  documentType: string
  storagePath: string
  uploadedBy: string
  createdAt: string
}

export interface CreateHouseholdDto {
  primaryParentId?: string | null
  address: string
  householdSize: number
  incomeCategory: 'extremely_low' | 'low' | 'moderate' | 'above_threshold'
  housingStatus: 'owned' | 'rented' | 'temporary' | 'homeless'
  eligibilityStatus?: 'eligible' | 'under_review' | 'ineligible' | 'suspended'
  restrictedNotes?: string | null
}

export interface AddHouseholdMemberDto {
  fullName: string
  relationship: string
  dateOfBirth?: string | null
  occupation?: string | null
  studentId?: string | null
}

export interface CreateWelfareAssessmentDto {
  householdId: string
  assessmentDate: string
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  nextReviewAt?: string | null
}
