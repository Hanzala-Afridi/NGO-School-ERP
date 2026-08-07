import { describe, expect, it } from 'vitest'
import { createRationRouter } from '../src/modules/ration/http/ration.routes.js'
import { RationService } from '../src/modules/ration/application/ration.service.js'
import { MaterialService } from '../src/modules/material/application/material.service.js'

describe('Ration & Material Distribution Security & Business Logic Unit Tests', () => {
  it('instantiates ration router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createRationRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('validates non-empty package name on creation', async () => {
    const mockRepo = {} as any
    const service = new RationService(mockRepo)

    await expect(
      service.createPackage({
        name: '',
        items: [{ inventoryItemId: 'item-1', quantity: 2 }],
      })
    ).rejects.toThrow('Package name is required')
  })

  it('validates package items requirement on creation', async () => {
    const mockRepo = {} as any
    const service = new RationService(mockRepo)

    await expect(
      service.createPackage({
        name: 'Family Food Basket',
        items: [],
      })
    ).rejects.toThrow('Ration package must contain at least one inventory item')
  })

  it('validates non-empty reversal reason when reversing a distribution', async () => {
    const mockRepo = {} as any
    const service = new RationService(mockRepo)

    await expect(
      service.reverseRation('actor-1', 'dist-1', { reversalReason: '' })
    ).rejects.toThrow('Reversal reason is required')
  })

  it('validates positive quantity for student material issuance', async () => {
    const mockRepo = {} as any
    const service = new MaterialService(mockRepo)

    await expect(
      service.issueStudentMaterial('actor-1', {
        studentId: 'student-1',
        inventoryItemId: 'item-1',
        storageLocationId: 'loc-1',
        distributionType: 'uniform',
        quantity: 0,
      })
    ).rejects.toThrow('Quantity must be greater than zero')
  })

  it('validates period month bounds on cycle creation', async () => {
    const mockRepo = {} as any
    const service = new RationService(mockRepo)

    await expect(
      service.createCycle({
        name: 'Invalid Cycle',
        periodMonth: 13,
        periodYear: 2026,
        distributionStart: '2026-08-01',
        distributionEnd: '2026-08-31',
      })
    ).rejects.toThrow('Invalid period month')
  })
})
