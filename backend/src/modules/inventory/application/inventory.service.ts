import {
  CreateExpenseDto,
  CreateInventoryItemDto,
  Expense,
  ExpenseCategory,
  InventoryCategory,
  InventoryItem,
  StockTransaction,
  StockTransactionDto,
  StorageLocation,
  Supplier,
} from '@ngo-school-erp/contracts'
import { SupabaseInventoryRepository } from '../infrastructure/supabase-inventory.repository.js'

export class InventoryService {
  constructor(private readonly repository: SupabaseInventoryRepository) {}

  listCategories(): Promise<InventoryCategory[]> {
    return this.repository.listCategories()
  }

  listItems(): Promise<InventoryItem[]> {
    return this.repository.listItems()
  }

  getItemById(id: string): Promise<InventoryItem | null> {
    return this.repository.findItemById(id)
  }

  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    if (!dto.sku || dto.sku.trim() === '') {
      throw new Error('SKU code is required')
    }
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Item name is required')
    }
    return this.repository.createItem(dto)
  }

  listStorageLocations(): Promise<StorageLocation[]> {
    return this.repository.listStorageLocations()
  }

  listSuppliers(): Promise<Supplier[]> {
    return this.repository.listSuppliers()
  }

  async recordStockTransaction(actorProfileId: string, dto: StockTransactionDto): Promise<{ transactionId: string; newBalance: number }> {
    if (dto.quantity <= 0) {
      throw new Error('Quantity must be greater than zero')
    }
    return this.repository.recordStockTransaction(actorProfileId, dto)
  }

  listStockLedger(itemId?: string): Promise<StockTransaction[]> {
    return this.repository.listStockLedger(itemId)
  }

  listExpenseCategories(): Promise<ExpenseCategory[]> {
    return this.repository.listExpenseCategories()
  }

  listExpenses(): Promise<Expense[]> {
    return this.repository.listExpenses()
  }

  getExpenseById(id: string): Promise<Expense | null> {
    return this.repository.findExpenseById(id)
  }

  async createExpense(actorProfileId: string, dto: CreateExpenseDto): Promise<Expense> {
    if (dto.amount <= 0) {
      throw new Error('Expense amount must be greater than zero')
    }
    if (!dto.payee || dto.payee.trim() === '') {
      throw new Error('Payee name is required')
    }
    return this.repository.createExpense(actorProfileId, dto)
  }

  async voidExpense(actorProfileId: string, expenseId: string, reason: string): Promise<Expense> {
    if (!reason || reason.trim() === '') {
      throw new Error('Void reason is required')
    }
    return this.repository.voidExpense(actorProfileId, expenseId, reason)
  }
}
