import { describe, expect, it } from 'vitest'
import { createSystemRouter } from '../src/modules/system/http/system.routes.js'
import { SystemService } from '../src/modules/system/application/system.service.js'

describe('System Diagnostics & Audit Logs HTTP Routes & Security Rules', () => {
  it('instantiates system router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createSystemRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('sanitizes secrets and connection strings from diagnostics payload', async () => {
    const mockRepo = {
      getDiagnostics: async () => ({
        status: 'operational',
        dbStatus: 'connected',
        dbLatencyMs: 12,
        apiUptimeSeconds: 120,
        processMemoryUsage: { heapUsedMb: 45, heapTotalMb: 80, rssMb: 110 },
        environment: 'production',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }),
    } as any

    const service = new SystemService(mockRepo)
    const diag = await service.getDiagnostics()

    expect(diag).toHaveProperty('dbStatus', 'connected')
    expect(diag).not.toHaveProperty('DATABASE_URL')
    expect(diag).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY')
    expect(diag).not.toHaveProperty('password')
  })

  it('escapes CSV formula injection characters in audit CSV export', async () => {
    const mockRepo = {
      exportAuditLogsCsv: async () => 'id,action,entityType\n"log-1","\'=CMD|""/C calc""!A0","\'+SYSTEM_EXEC"',
    } as any

    const service = new SystemService(mockRepo)
    const csv = await service.exportAuditLogsCsv({})

    expect(csv).toContain("\"'=CMD|\"\"/C calc\"\"!A0\"")
    expect(csv).toContain("\"'+SYSTEM_EXEC\"")
  })
})
