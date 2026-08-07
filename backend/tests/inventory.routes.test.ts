import { describe, expect, it } from 'vitest'
import { createInventoryRouter } from '../src/modules/inventory/http/inventory.routes.js'
import { InventoryService } from '../src/modules/inventory/application/inventory.service.js'

describe('Inventory & Expenses Module HTTP Routes & Service Rules', () => {
  it('instantiates inventory router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createInventoryRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('rejects stock transaction with non-positive quantity', async () => {
    const mockRepo = {} as any
    const service = new InventoryService(mockRepo)

    await expect(
      service.recordStockTransaction('actor-1', {
        itemId: 'item-1',
        storageLocationId: 'loc-1',
        transactionType: 'issue',
        quantity: 0,
      })
    ).rejects.toThrow('Quantity must be greater than zero')
  })

  it('validates mandatory void reason when voiding an expense', async () => {
    const mockRepo = {} as any
    const service = new InventoryService(mockRepo)

    await expect(service.voidExpense('actor-1', 'exp-1', '')).rejects.toThrow('Void reason is required')
  })

  it('validates expense amount must be greater than zero', async () => {
    const mockRepo = {} as any
    const service = new InventoryService(mockRepo)

    await expect(
      service.createExpense('actor-1', {
        categoryId: 'cat-1',
        expenseDate: '2026-08-07',
        amount: -50,
        payee: 'Vendor Supplies',
        paymentMethod: 'cash',
        description: 'Office supplies',
      })
    ).rejects.toThrow('Expense amount must be greater than zero')
  })
})
