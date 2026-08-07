import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Progress permissions and route prerequisites', () => {
  it('denies progress recording without progress.create permission', () => {
    const authorization = new AuthorizationService()
    const parentContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(parentContext, 'progress.create')).toThrow()
  })

  it('allows progress recording for teacher with progress.create permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: new Set(['progress.create']),
    })

    expect(() => authorization.requirePermission(teacherContext, 'progress.create')).not.toThrow()
  })
})
