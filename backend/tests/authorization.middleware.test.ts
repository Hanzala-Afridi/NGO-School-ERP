import { describe, expect, it } from 'vitest'

import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('default-deny authorization', () => {
  const service = new AuthorizationService()

  it('allows an explicitly assigned permission', () => {
    expect(() => service.requirePermission(createAuthContext(), 'users.read')).not.toThrow()
  })

  it('denies a missing permission', () => {
    expect(() => service.requirePermission(createAuthContext(), 'users.update')).toThrow(
      'not authorized',
    )
  })
})
