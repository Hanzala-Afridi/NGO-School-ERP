import { describe, expect, it } from 'vitest'

import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('record scope', () => {
  const service = new AuthorizationService()

  it('allows Admin global scope', () => {
    expect(() => service.enforceScope(createAuthContext(), { kind: 'all' })).not.toThrow()
  })

  it('allows self and denies another profile', () => {
    const context = createAuthContext({ roles: [{ id: 'teacher', name: 'Teacher' }] })
    expect(() =>
      service.enforceScope(context, { kind: 'self', targetProfileId: context.profile.id }),
    ).not.toThrow()
    expect(() =>
      service.enforceScope(context, { kind: 'self', targetProfileId: 'another-profile' }),
    ).toThrow('outside your scope')
  })

  it('denies unsupported future scopes', () => {
    expect(() =>
      service.enforceScope(createAuthContext(), {
        kind: 'unsupported',
        resource: 'students',
      }),
    ).toThrow('outside your scope')
  })
})
