import { SupabaseClient } from '@supabase/supabase-js'
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

export class SupabaseInventoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listCategories(): Promise<InventoryCategory[]> {
    const { data, error } = await this.supabase.from('inventory_categories').select('*').order('name')
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))
  }

  async listItems(): Promise<InventoryItem[]> {
    const { data, error } = await this.supabase.from('inventory_items').select('*').order('name')
    if (error || !data) return []
    return data.map((d) => this.mapItem(d))
  }

  async findItemById(id: string): Promise<InventoryItem | null> {
    const { data, error } = await this.supabase.from('inventory_items').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return this.mapItem(data)
  }

  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .insert({
        category_id: dto.categoryId,
        sku: dto.sku,
        name: dto.name,
        unit: dto.unit,
        size: dto.size || null,
        class_level: dto.classLevel || null,
        gender_variant: dto.genderVariant || null,
        minimum_stock: dto.minimumStock,
        active: true,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create inventory item failed: ${error?.message}`)
    return this.mapItem(data)
  }

  async listStorageLocations(): Promise<StorageLocation[]> {
    const { data, error } = await this.supabase.from('storage_locations').select('*').order('name')
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      schoolId: d.school_id,
      name: d.name,
      location: d.location,
      active: d.active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))
  }

  async listSuppliers(): Promise<Supplier[]> {
    const { data, error } = await this.supabase.from('suppliers').select('*').order('name')
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      contactPerson: d.contact_person,
      phone: d.phone,
      email: d.email,
      address: d.address,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))
  }

  async recordStockTransaction(actorProfileId: string, dto: StockTransactionDto): Promise<{ transactionId: string; newBalance: number }> {
    const { data, error } = await this.supabase.rpc('rpc_record_stock_transaction', {
      p_item_id: dto.itemId,
      p_location_id: dto.storageLocationId,
      p_type: dto.transactionType,
      p_quantity: dto.quantity,
      p_unit_cost: dto.unitCost || null,
      p_ref_type: null,
      p_ref_id: null,
      p_actor_id: actorProfileId,
      p_notes: dto.notes || null,
    })

    if (error) throw new Error(`Stock transaction failed: ${error.message}`)
    return { transactionId: data.transactionId, newBalance: data.newBalance }
  }

  async listStockLedger(itemId?: string): Promise<StockTransaction[]> {
    let query = this.supabase.from('stock_transactions').select('*').order('created_at', { ascending: false })
    if (itemId) query = query.eq('item_id', itemId)
    const { data, error } = await query
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      itemId: d.item_id,
      storageLocationId: d.storage_location_id,
      transactionType: d.transaction_type,
      quantity: d.quantity,
      unitCost: d.unit_cost,
      referenceType: d.reference_type,
      referenceId: d.reference_id,
      performedBy: d.performed_by,
      transactionDate: d.transaction_date,
      notes: d.notes,
      createdAt: d.created_at,
    }))
  }

  async listExpenseCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await this.supabase.from('expense_categories').select('*').order('name')
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      active: d.active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))
  }

  async listExpenses(): Promise<Expense[]> {
    const { data, error } = await this.supabase.from('expenses').select('*').order('expense_date', { ascending: false })
    if (error || !data) return []
    return data.map((d) => this.mapExpense(d))
  }

  async findExpenseById(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabase.from('expenses').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return this.mapExpense(data)
  }

  async createExpense(actorProfileId: string, dto: CreateExpenseDto): Promise<Expense> {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        category_id: dto.categoryId,
        expense_date: dto.expenseDate,
        amount: dto.amount,
        payee: dto.payee,
        payment_method: dto.paymentMethod,
        description: dto.description,
        receipt_path: dto.receiptPath || null,
        status: 'active',
        created_by: actorProfileId,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create expense failed: ${error?.message}`)
    return this.mapExpense(data)
  }

  async voidExpense(actorProfileId: string, expenseId: string, reason: string): Promise<Expense> {
    const { error } = await this.supabase.rpc('rpc_void_expense', {
      p_expense_id: expenseId,
      p_actor_id: actorProfileId,
      p_reason: reason,
    })

    if (error) throw new Error(`Void expense failed: ${error.message}`)

    const updated = await this.findExpenseById(expenseId)
    if (!updated) throw new Error('Expense not found after voiding')
    return updated
  }

  private mapItem(d: any): InventoryItem {
    return {
      id: d.id,
      categoryId: d.category_id,
      sku: d.sku,
      name: d.name,
      unit: d.unit,
      size: d.size,
      classLevel: d.class_level,
      genderVariant: d.gender_variant,
      minimumStock: d.minimum_stock,
      active: d.active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapExpense(d: any): Expense {
    return {
      id: d.id,
      categoryId: d.category_id,
      expenseDate: d.expense_date,
      amount: Number(d.amount),
      payee: d.payee,
      paymentMethod: d.payment_method,
      description: d.description,
      receiptPath: d.receipt_path,
      referenceType: d.reference_type,
      referenceId: d.reference_id,
      status: d.status,
      createdBy: d.created_by,
      voidedBy: d.voided_by,
      voidedAt: d.voided_at,
      voidReason: d.void_reason,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
