import { describe, expect, it } from 'vitest'

import { AuditService } from '../src/modules/audit/application/audit.service.js'
import { AuthenticationService } from '../src/modules/auth/application/authentication.service.js'
import { MemoryAuditRepository } from './test-doubles.js'

describe('AuthenticationService', () => {
  it('updates the authenticated profile password through the server gateway', async () => {
    const repository = new MemoryAuditRepository()
    const calls: unknown[][] = []
    const service = new AuthenticationService(
      {
        updatePassword: (...arguments_: unknown[]) => {
          calls.push(arguments_)
          return Promise.resolve()
        },
      } as never,
      {} as never,
      {} as never,
      new AuditService(repository),
    )

    await service.updatePassword(
      {
        accessToken: 'redacted-access-token',
        sessionId: 'session-1',
        profile: {
          id: 'profile-1',
          authUserId: 'auth-user-1',
          fullName: 'Synthetic Admin',
          email: 'admin@example.invalid',
          status: 'active',
          roles: [],
          createdAt: '2026-08-04T00:00:00.000Z',
          updatedAt: '2026-08-04T00:00:00.000Z',
        },
        roles: [],
        permissions: new Set(),
      },
      'not-a-real-password',
      { requestId: 'request-1' },
    )

    expect(calls).toEqual([['auth-user-1', 'not-a-real-password']])
    expect(repository.events).toEqual([
      expect.objectContaining({
        action: 'auth.password.updated',
        actorProfileId: 'profile-1',
        outcome: 'success',
        sessionId: 'session-1',
      }),
    ])
  })

  it('keeps password recovery responses generic when the provider fails', async () => {
    const repository = new MemoryAuditRepository()
    const service = new AuthenticationService(
      {
        requestPasswordRecovery: () => Promise.reject(new Error('provider details')),
      } as never,
      {} as never,
      {} as never,
      new AuditService(repository),
    )

    await expect(
      service.requestPasswordRecovery('unknown@example.invalid', {
        requestId: 'request-1',
      }),
    ).resolves.toBeUndefined()
    expect(repository.events).toEqual([
      expect.objectContaining({
        action: 'auth.password_recovery.requested',
        outcome: 'failure',
        reasonCode: 'PASSWORD_RECOVERY_PROVIDER_FAILED',
      }),
    ])
  })
})
