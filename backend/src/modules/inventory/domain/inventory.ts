export interface InventoryCategoryEntity {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItemEntity {
  id: string
  categoryId: string
  sku: string
  name: string
  unit: string
  size?: string | null
  classLevel?: string | null
  genderVariant?: string | null
  minimumStock: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface StorageLocationEntity {
  id: string
  schoolId: string
  name: string
  location?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface SupplierEntity {
  id: string
  name: string
  contactPerson?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
}

export interface StockTransactionEntity {
  id: string
  itemId: string
  storageLocationId: string
  transactionType: 'receipt' | 'issue' | 'adjustment' | 'damage' | 'loss'
  quantity: number
  unitCost?: number | null
  referenceType?: string | null
  referenceId?: string | null
  performedBy: string
  transactionDate: string
  notes?: string | null
  createdAt: string
}

export interface ExpenseCategoryEntity {
  id: string
  name: string
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseEntity {
  id: string
  categoryId: string
  expenseDate: string
  amount: number
  payee: string
  paymentMethod: string
  description: string
  receiptPath?: string | null
  referenceType?: string | null
  referenceId?: string | null
  status: 'active' | 'voided'
  createdBy: string
  voidedBy?: string | null
  voidedAt?: string | null
  voidReason?: string | null
  createdAt: string
  updatedAt: string
}
