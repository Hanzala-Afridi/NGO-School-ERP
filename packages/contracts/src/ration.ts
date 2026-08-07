export interface RationPackageItem {
  id: string
  rationPackageId: string
  inventoryItemId: string
  quantity: number
  createdAt: string
}

export interface RationPackage {
  id: string
  name: string
  description?: string | null
  active: boolean
  items?: RationPackageItem[]
  createdAt: string
  updatedAt: string
}

export interface RationCycle {
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

export interface RationAllocation {
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

export interface RationDistribution {
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

export interface CreateRationPackageDto {
  name: string
  description?: string | null
  items: Array<{ inventoryItemId: string; quantity: number }>
}

export interface CreateRationCycleDto {
  name: string
  periodMonth: number
  periodYear: number
  distributionStart: string
  distributionEnd: string
}

export interface IssueRationDto {
  allocationId: string
  distributionMethod: 'collection' | 'home_delivery'
  receivedByName?: string | null
  acknowledgmentPath?: string | null
}

export interface ReverseRationDto {
  reversalReason: string
}
