import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Announcements permissions and route prerequisites', () => {
  it('denies announcement creation without announcements.create permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(teacherContext, 'announcements.create')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'announcements.publish')).toThrow()
  })

  it('allows announcement creation and publishing for admin role', () => {
    const authorization = new AuthorizationService()
    const adminContext = createAuthContext({
      permissions: new Set(['announcements.create', 'announcements.publish']),
    })

    expect(() => authorization.requirePermission(adminContext, 'announcements.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'announcements.publish')).not.toThrow()
  })
})
