export interface StudentDistributionEntity {
  id: string
  studentId: string
  inventoryItemId: string
  distributionType: 'uniform' | 'shoes' | 'textbooks' | 'stationery' | 'bag'
  quantity: number
  sizeOrVariant?: string | null
  issueDate: string
  reason?: string | null
  replacementOfDistributionId?: string | null
  approvalStatus: 'pending_approval' | 'approved' | 'issued' | 'rejected'
  issuedBy: string
  receivedByName?: string | null
  acknowledgmentPath?: string | null
  reversedAt?: string | null
  createdAt: string
  updatedAt: string
}
