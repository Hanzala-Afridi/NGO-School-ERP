import { describe, expect, it } from 'vitest'

import { AuditService } from '../src/modules/audit/application/audit.service.js'
import { MemoryAuditRepository } from './test-doubles.js'

describe('security audit service', () => {
  it('records security metadata without credentials', async () => {
    const repository = new MemoryAuditRepository()
    const service = new AuditService(repository)
    await service.record({
      action: 'auth.token.rejected',
      outcome: 'denied',
      requestId: 'request-1',
      reasonCode: 'INVALID_ACCESS_TOKEN',
    })
    expect(repository.events).toEqual([
      expect.objectContaining({
        action: 'auth.token.rejected',
        outcome: 'denied',
      }),
    ])
    expect(JSON.stringify(repository.events)).not.toMatch(/password|accessToken|refreshToken/)
  })
})
