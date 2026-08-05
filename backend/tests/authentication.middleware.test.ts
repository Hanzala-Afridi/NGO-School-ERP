import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { authenticate } from '../src/middleware/authenticate.js'
import type { AuthenticationService } from '../src/modules/auth/application/authentication.service.js'
import { errorHandler } from '../src/middleware/error-handler.js'
import { requestId } from '../src/middleware/request-id.js'
import { createAuthContext } from './test-doubles.js'

describe('authenticate middleware', () => {
  it('rejects a missing bearer token', async () => {
    const service = { authenticate: vi.fn() } as unknown as AuthenticationService
    const app = express()
    app.use(requestId, authenticate(service))
    app.get('/', (_request, response) => response.sendStatus(204))
    app.use(errorHandler)
    const response = await request(app).get('/').expect(401)
    expect((response.body as { error: { code: string } }).error.code).toBe('UNAUTHENTICATED')
  })

  it('attaches a verified auth context', async () => {
    const context = createAuthContext()
    const service = {
      authenticate: vi.fn().mockResolvedValue(context),
    } as unknown as AuthenticationService
    const app = express()
    app.use(requestId, authenticate(service))
    app.get('/', (req, response) => response.json({ profileId: req.auth?.profile.id }))
    app.use(errorHandler)
    const response = await request(app).get('/').set('authorization', 'Bearer token').expect(200)
    expect((response.body as { profileId: string }).profileId).toBe(context.profile.id)
  })
})
