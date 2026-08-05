import { Router } from 'express'
import { z } from 'zod'

import { authenticate } from '../../../middleware/authenticate.js'
import { requirePermission } from '../../../middleware/authorize.js'
import { enforceRecordScope } from '../../../middleware/record-scope.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthenticationService } from '../../auth/application/authentication.service.js'
import { successResponse } from '../../../shared/api-response.js'
import type { AuthorizationService } from '../application/authorization.service.js'
import type { RbacService } from '../application/rbac.service.js'

const idSchema = z.string().uuid()
const roleCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).default(''),
})
const roleUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')
const permissionSetSchema = z.object({
  permissionIds: z.array(z.string().uuid()).max(100),
})

export function createRbacRouter(dependencies: {
  service: RbacService
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
    '/roles',
    authenticated,
    permitted('roles.read'),
    globalScope,
    async (_request, response) => {
      response.json(successResponse(await dependencies.service.listRoles()))
    },
  )
  router.post(
    '/roles',
    authenticated,
    permitted('roles.create'),
    globalScope,
    async (request, response) => {
      response
        .status(201)
        .json(
          successResponse(
            await dependencies.service.createRole(
              request.auth!,
              roleCreateSchema.parse(request.body),
            ),
          ),
        )
    },
  )
  router.patch(
    '/roles/:id',
    authenticated,
    permitted('roles.update'),
    globalScope,
    async (request, response) => {
      response.json(
        successResponse(
          await dependencies.service.updateRole(
            request.auth!,
            idSchema.parse(request.params.id),
            roleUpdateSchema.parse(request.body),
          ),
        ),
      )
    },
  )
  router.put(
    '/roles/:id/permissions',
    authenticated,
    permitted('roles.manage_permissions'),
    globalScope,
    async (request, response) => {
      const input = permissionSetSchema.parse(request.body)
      response.json(
        successResponse(
          await dependencies.service.replacePermissions(
            request.auth!,
            idSchema.parse(request.params.id),
            input.permissionIds,
          ),
        ),
      )
    },
  )
  router.get(
    '/permissions',
    authenticated,
    permitted('permissions.read'),
    globalScope,
    async (_request, response) => {
      response.json(successResponse(await dependencies.service.listPermissions()))
    },
  )
  return router
}
