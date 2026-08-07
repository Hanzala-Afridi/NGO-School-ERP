import { describe, expect, it } from 'vitest'
import { createReportsRouter } from '../src/modules/reports/http/reports.routes.js'
import { ReportsService } from '../src/modules/reports/application/reports.service.js'

describe('Reports & Analytics Module HTTP Routes & Service Rules', () => {
  it('instantiates reports router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createReportsRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('escapes CSV formula injection characters safely', async () => {
    const mockRepo = {
      getStudentsReport: async () => [
        { id: '1', first_name: '=SUM(1+1)', last_name: '+MALICIOUS', gender: 'male', status: '@DANGEROUS' },
      ],
    } as any

    const service = new ReportsService(mockRepo)
    const csv = await service.exportReportCsv('students')

    expect(csv).toContain("\"'=SUM(1+1)\"")
    expect(csv).toContain("\"'+MALICIOUS\"")
    expect(csv).toContain("\"'@DANGEROUS\"")
  })
})
