export interface RationPackageEntity {
  id: string
  name: string
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface RationPackageItemEntity {
  id: string
  rationPackageId: string
  inventoryItemId: string
  quantity: number
  createdAt: string
}

export interface RationCycleEntity {
  id: string
  name: string
  periodMonth: number
  periodYear: number
  distributionStart: string
  distributionEnd: string
  status: 'draft' | 'generated' | 'open' | 'completed' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface RationAllocationEntity {
  id: string
  rationCycleId: string
  householdId: string
  rationPackageId: string
  approvalStatus: 'pending' | 'approved' | 'issued' | 'rejected'
  approvedBy?: string | null
  eligibilitySnapshot?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface RationDistributionEntity {
  id: string
  rationAllocationId: string
  distributionMethod: 'collection' | 'home_delivery'
  distributionDate: string
  status: 'issued' | 'reversed'
  issuedBy: string
  receivedByName?: string | null
  acknowledgmentPath?: string | null
  nonIssueReason?: string | null
  reversalReason?: string | null
  reversedBy?: string | null
  reversedAt?: string | null
  createdAt: string
  updatedAt: string
}
