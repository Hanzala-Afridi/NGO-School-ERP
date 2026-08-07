import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../../middleware/authenticate.js'
import { InventoryService } from '../application/inventory.service.js'

const createItemSchema = z.object({
  categoryId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  size: z.string().optional().nullable(),
  classLevel: z.string().optional().nullable(),
  genderVariant: z.string().optional().nullable(),
  minimumStock: z.number().int().nonnegative(),
})

const stockTxSchema = z.object({
  itemId: z.string().uuid(),
  storageLocationId: z.string().uuid(),
  transactionType: z.enum(['receipt', 'issue', 'adjustment', 'damage', 'loss']),
  quantity: z.number().int().positive(),
  unitCost: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const createExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  expenseDate: z.string(),
  amount: z.number().positive(),
  payee: z.string().min(1),
  paymentMethod: z.string().min(1),
  description: z.string().min(1),
  receiptPath: z.string().optional().nullable(),
})

const voidExpenseSchema = z.object({
  voidReason: z.string().min(1),
})

export function createInventoryRouter(dependencies: {
  service: InventoryService
  authentication: any
  authorization: any
  audit: any
}): Router {
  const router = Router()
  const { service, authentication, authorization } = dependencies
  const authenticatedMw = authenticate(authentication)

  router.get('/inventory/items', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'inventory.manage')
      const items = await service.listItems()
      return res.json({ success: true, data: items })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/inventory/items', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'inventory.manage')
      const dto = createItemSchema.parse(req.body)
      const item = await service.createItem(dto)
      return res.status(201).json({ success: true, data: item })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/inventory/transactions', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'inventory.transact')
      const dto = stockTxSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const result = await service.recordStockTransaction(actorId, dto)
      return res.status(201).json({ success: true, data: result })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/inventory/ledger', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'inventory.manage')
      const itemId = req.query.itemId ? String(req.query.itemId) : undefined
      const ledger = await service.listStockLedger(itemId)
      return res.json({ success: true, data: ledger })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/expenses', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'expenses.create')
      const expenses = await service.listExpenses()
      return res.json({ success: true, data: expenses })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/expenses', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'expenses.create')
      const dto = createExpenseSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const expense = await service.createExpense(actorId, dto)
      return res.status(201).json({ success: true, data: expense })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/expenses/:id/void', authenticatedMw, async (req: Request, res: Response, next) => {
    try {
      authorization.requirePermission(req.auth!, 'expenses.void')
      const id = String(req.params.id)
      const dto = voidExpenseSchema.parse(req.body)
      const actorId = req.auth?.profile?.id
      if (!actorId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } })

      const expense = await service.voidExpense(actorId, id, dto.voidReason)
      return res.json({ success: true, data: expense })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
