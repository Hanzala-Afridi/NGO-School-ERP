import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import type { AuthorizationService } from '../../rbac/application/authorization.service.js'
import { successResponse } from '../../../shared/api-response.js'
import type { IdentityService } from '../application/identity.service.js'

const idSchema = z.string().uuid()
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
})
const inviteSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().trim().min(1).max(200),
  roleIds: z.array(z.string().uuid()).min(1).max(10),
})
const updateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(200).optional(),
    phone: z.string().trim().max(50).nullable().optional(),
    profileImageUrl: z.string().url().max(2048).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')
const statusSchema = z.object({ status: z.enum(['active', 'inactive']) })
const rolesSchema = z.object({ roleIds: z.array(z.string().uuid()).max(10) })

export function createIdentityRouter(dependencies: {
  service: IdentityService
  authentication: AuthenticationService
  authorization: AuthorizationService
  audit: AuditService
}): Router {
  const router = Router()
  const authenticated = authenticate(dependencies.authentication)
  const globalScope = enforceRecordScope(dependencies.authorization, dependencies.audit, () => ({
    kind: 'all',
  }))
  const permitted = (permission: string) =>
    requirePermission(dependencies.authorization, dependencies.audit, permission)

  router.get(
    '/',
    authenticated,
    permitted('users.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.list(listSchema.parse(request.query))),
      )
    },
  )
  router.post(
    '/',
    authenticated,
    permitted('users.create'),
    globalScope,
    async (request, response) => {
      const user = await dependencies.service.invite(
        request.auth!,
        inviteSchema.parse(request.body),
      )
      response.status(201).json(successResponse(user))
    },
  )
  router.get(
    '/:id',
    authenticated,
    permitted('users.read'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(await dependencies.service.get(idSchema.parse(request.params.id))),
      )
    },
  )
  router.patch(
    '/:id',
    authenticated,
    permitted('users.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.update(
            request.auth!,
            idSchema.parse(request.params.id),
            updateSchema.parse(request.body),
          ),
        ),
      )
    },
  )
  router.patch(
    '/:id/status',
    authenticated,
    permitted('users.manage_status'),
    globalScope,
    async (request, response) => {
      const input = statusSchema.parse(request.body)
      response.json(
        successResponse(
          await dependencies.service.updateStatus(
            request.auth!,
            idSchema.parse(request.params.id),
            input.status,
          ),
        ),
      )
    },
  )
  router.post(
    '/:id/roles',
    authenticated,
    permitted('users.assign_roles'),
    globalScope,
    async (request, response) => {
      const input = rolesSchema.parse(request.body)
      response.json(
        successResponse(
          await dependencies.service.replaceRoles(
            request.auth!,
            idSchema.parse(request.params.id),
            input.roleIds,
          ),
        ),
      )
    },
  )
  return router
}
