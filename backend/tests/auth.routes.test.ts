import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { errorHandler } from '../src/middleware/error-handler.js'
import { requestId } from '../src/middleware/request-id.js'
import { AuditService } from '../src/modules/audit/application/audit.service.js'
import type { AuthenticationService } from '../src/modules/auth/application/authentication.service.js'
import { createAuthRouter } from '../src/modules/auth/http/auth.routes.js'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext, MemoryAuditRepository } from './test-doubles.js'

function authRouter(service: AuthenticationService) {
  return createAuthRouter({
    service,
    authorization: new AuthorizationService(),
    audit: new AuditService(new MemoryAuditRepository()),
  })
}

describe('auth routes', () => {
  it('returns the standard login session envelope with no-store caching', async () => {
    const service = {
      login: vi.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: 123,
      }),
    } as unknown as AuthenticationService
    const app = express()
    app.use(express.json(), requestId)
    app.use('/api/v1/auth', authRouter(service))
    app.use(errorHandler)
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.invalid', password: 'correct horse battery staple' })
      .expect(200)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect((response.body as { success: boolean }).success).toBe(true)
  })

  it('does not reveal whether a recovery account exists', async () => {
    const service = {
      requestPasswordRecovery: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuthenticationService
    const app = express()
    app.use(express.json(), requestId)
    app.use('/api/v1/auth', authRouter(service))
    app.use(errorHandler)
    const response = await request(app)
      .post('/api/v1/auth/password-recovery')
      .send({ email: 'unknown@example.invalid' })
      .expect(200)
    expect((response.body as { data: { message: string } }).data.message).toMatch(
      /If the account exists/,
    )
  })

  it('default-denies self routes without profiles.read_self', async () => {
    const context = createAuthContext({ permissions: new Set() })
    const currentIdentity = vi.fn()
    const service = {
      authenticate: vi.fn().mockResolvedValue(context),
      currentIdentity,
    } as unknown as AuthenticationService
    const app = express()
    app.use(express.json(), requestId)
    app.use('/api/v1/auth', authRouter(service))
    app.use(errorHandler)

    await request(app).get('/api/v1/auth/me').set('authorization', 'Bearer token').expect(403)
    expect(currentIdentity).not.toHaveBeenCalled()
  })

  it('allows a verified profile to access its own identity', async () => {
    const context = createAuthContext({ permissions: new Set(['profiles.read_self']) })
    const currentIdentity = vi.fn().mockReturnValue({
      profile: context.profile,
      roles: context.roles,
      permissions: ['profiles.read_self'],
    })
    const service = {
      authenticate: vi.fn().mockResolvedValue(context),
      currentIdentity,
    } as unknown as AuthenticationService
    const app = express()
    app.use(express.json(), requestId)
    app.use('/api/v1/auth', authRouter(service))
    app.use(errorHandler)

    await request(app).get('/api/v1/auth/me').set('authorization', 'Bearer token').expect(200)
    expect(currentIdentity).toHaveBeenCalledOnce()
  })
})
