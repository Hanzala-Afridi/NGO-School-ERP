export interface InventoryCategory {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
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
  currentStock?: number
  createdAt: string
  updatedAt: string
}

export interface StorageLocation {
  id: string
  schoolId: string
  name: string
  location?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
}

export interface StockTransaction {
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

export interface ExpenseCategory {
  id: string
  name: string
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Expense {
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

export interface CreateInventoryItemDto {
  categoryId: string
  sku: string
  name: string
  unit: string
  size?: string | null
  classLevel?: string | null
  genderVariant?: string | null
  minimumStock: number
}

export interface StockTransactionDto {
  itemId: string
  storageLocationId: string
  transactionType: 'receipt' | 'issue' | 'adjustment' | 'damage' | 'loss'
  quantity: number
  unitCost?: number | null
  notes?: string | null
}

export interface CreateExpenseDto {
  categoryId: string
  expenseDate: string
  amount: number
  payee: string
  paymentMethod: string
  description: string
  receiptPath?: string | null
}

export interface VoidExpenseDto {
  voidReason: string
}
