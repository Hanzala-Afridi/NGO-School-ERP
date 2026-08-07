import { describe, expect, it } from 'vitest'
import { createWelfareRouter } from '../src/modules/welfare/http/welfare.routes.js'
import { WelfareService } from '../src/modules/welfare/application/welfare.service.js'

describe('Welfare Module HTTP Routes & Service Rules', () => {
  it('instantiates welfare router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createWelfareRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('masks restricted notes when restricted permission is missing', async () => {
    const mockRepo = {
      listHouseholds: async () => [
        {
          id: 'h-1',
          householdCode: 'HH-2026-1001',
          address: 'Main Street',
          householdSize: 4,
          incomeCategory: 'extremely_low',
          housingStatus: 'temporary',
          eligibilityStatus: 'eligible',
          restrictedNotes: 'CONFIDENTIAL: High priority intervention required',
        },
      ],
    } as any

    const service = new WelfareService(mockRepo)
    const result = await service.listHouseholds(false)

    expect(result[0].restrictedNotes).toBeNull()
  })

  it('includes restricted notes when restricted permission is present', async () => {
    const mockRepo = {
      listHouseholds: async () => [
        {
          id: 'h-1',
          householdCode: 'HH-2026-1001',
          address: 'Main Street',
          householdSize: 4,
          incomeCategory: 'extremely_low',
          housingStatus: 'temporary',
          eligibilityStatus: 'eligible',
          restrictedNotes: 'CONFIDENTIAL: High priority intervention required',
        },
      ],
    } as any

    const service = new WelfareService(mockRepo)
    const result = await service.listHouseholds(true)

    expect(result[0].restrictedNotes).toBe('CONFIDENTIAL: High priority intervention required')
  })

  it('validates mandatory address and household size on creation', async () => {
    const mockRepo = {} as any
    const service = new WelfareService(mockRepo)

    await expect(
      service.createHousehold({
        address: '',
        householdSize: 4,
        incomeCategory: 'low',
        housingStatus: 'rented',
      })
    ).rejects.toThrow('Address is required')
  })
})
