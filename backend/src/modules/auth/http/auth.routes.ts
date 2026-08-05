import { Router, type Request } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'

import { environment } from '../../../config/env.js'
import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import type { AuthenticationService } from '../application/authentication.service.js'

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
})
const recoverySchema = z.object({ email: z.string().email().max(320) })
const passwordSchema = z.object({
  newPassword: z.string().min(12).max(256),
})

function metadata(request: Request) {
  const requestId =
    typeof request.id === 'string'
      ? request.id
      : typeof request.id === 'number'
        ? request.id.toString()
        : undefined
  return {
    requestId,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  }
}

export function createAuthRouter(dependencies: {
  service: AuthenticationService
  authorization: AuthorizationService
  audit: AuditService
}): Router {
  const router = Router()
  const authMiddleware = authenticate(dependencies.service)
  const selfPermission = requirePermission(
    dependencies.authorization,
    dependencies.audit,
    'profiles.read_self',
  )
  const selfScope = enforceRecordScope(
    dependencies.authorization,
    dependencies.audit,
    (request) => ({
      kind: 'self',
      targetProfileId: request.auth?.profile.id ?? '',
    }),
  )
  const protectedSelf = [authMiddleware, selfPermission, selfScope]
  const credentialLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: environment.NODE_ENV === 'development' ? 1000 : 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })

  router.post('/login', credentialLimiter, async (request, response) => {
    const input = loginSchema.parse(request.body)
    const session = await dependencies.service.login(input.email, input.password, metadata(request))
    response.setHeader('cache-control', 'private, no-store')
    response.json(successResponse(session))
  })

  router.post('/password-recovery', credentialLimiter, async (request, response) => {
    const input = recoverySchema.parse(request.body)
    await dependencies.service.requestPasswordRecovery(input.email, metadata(request))
    response.json(
      successResponse({
        message: 'If the account exists, password recovery instructions have been sent.',
      }),
    )
  })

  router.get('/me', ...protectedSelf, (request, response) => {
    response.setHeader('cache-control', 'private, no-store')
    response.json(successResponse(dependencies.service.currentIdentity(request.auth!)))
  })

  router.get('/permissions', ...protectedSelf, (request, response) => {
    response.setHeader('cache-control', 'private, no-store')
    response.json(successResponse([...request.auth!.permissions].sort()))
  })

  router.patch('/password', ...protectedSelf, async (request, response) => {
    const input = passwordSchema.parse(request.body)
    await dependencies.service.updatePassword(request.auth!, input.newPassword, metadata(request))
    response.json(successResponse({ updated: true }))
  })

  router.post('/logout', ...protectedSelf, async (request, response) => {
    await dependencies.service.logout(request.auth!, metadata(request))
    response.json(successResponse({ loggedOut: true }))
  })

  return router
}
