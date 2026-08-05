import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import { environment } from './config/env.js'
import { healthRouter } from './health.routes.js'
import {
  createAdminSupabaseClient,
  createPublicSupabaseClient,
} from './infrastructure/supabase/client.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found-handler.js'
import { requestId } from './middleware/request-id.js'
import { requestLogger } from './middleware/request-logger.js'
import { AuditService } from './modules/audit/application/audit.service.js'
import { SupabaseAuditRepository } from './modules/audit/infrastructure/supabase-audit.repository.js'
import { AuthenticationService } from './modules/auth/application/authentication.service.js'
import { SupabaseAuthGateway } from './modules/auth/infrastructure/supabase-auth.gateway.js'
import { createAuthRouter } from './modules/auth/http/auth.routes.js'
import { IdentityService } from './modules/identity/application/identity.service.js'
import { SupabaseIdentityRepository } from './modules/identity/infrastructure/supabase-identity.repository.js'
import { createIdentityRouter } from './modules/identity/http/identity.routes.js'
import { AuthorizationService } from './modules/rbac/application/authorization.service.js'
import { RbacService } from './modules/rbac/application/rbac.service.js'
import { SupabaseRbacRepository } from './modules/rbac/infrastructure/supabase-rbac.repository.js'
import { createRbacRouter } from './modules/rbac/http/rbac.routes.js'

function createSecurityDependencies() {
  const adminClient = createAdminSupabaseClient()
  const audit = new AuditService(new SupabaseAuditRepository(adminClient))
  const identities = new SupabaseIdentityRepository(adminClient)
  const rbacRepository = new SupabaseRbacRepository(adminClient)
  const authGateway = new SupabaseAuthGateway(createPublicSupabaseClient(), adminClient)
  const authentication = new AuthenticationService(authGateway, identities, rbacRepository, audit)
  const authorization = new AuthorizationService()
  return {
    audit,
    authentication,
    authorization,
    identityService: new IdentityService(identities, authGateway, audit),
    rbacService: new RbacService(rbacRepository, audit),
  }
}

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(requestId)
  app.use(requestLogger)
  app.use(helmet())
  app.use(
    cors({
      origin: environment.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['authorization', 'content-type', 'x-request-id'],
    }),
  )
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  const security = createSecurityDependencies()
  app.use('/api/v1', healthRouter)
  app.use(
    '/api/v1/auth',
    createAuthRouter({
      service: security.authentication,
      authorization: security.authorization,
      audit: security.audit,
    }),
  )
  app.use(
    '/api/v1/users',
    createIdentityRouter({
      service: security.identityService,
      authentication: security.authentication,
      authorization: security.authorization,
      audit: security.audit,
    }),
  )
  app.use(
    '/api/v1',
    createRbacRouter({
      service: security.rbacService,
      authentication: security.authentication,
      authorization: security.authorization,
      audit: security.audit,
    }),
  )
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
