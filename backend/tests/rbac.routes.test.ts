import { describe, expect, it } from 'vitest'

import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('RBAC route prerequisites', () => {
  it('requires explicit role administration permissions', () => {
    const service = new AuthorizationService()
    expect(() => service.requirePermission(createAuthContext(), 'roles.create')).toThrow()
  })
})
