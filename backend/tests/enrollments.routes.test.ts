import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Enrollments Permissions and Route Rules', () => {
  it('denies enrollment access without required permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(teacherContext, 'enrollments.read')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'enrollments.create')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'enrollments.promote')).toThrow()
  })

  it('allows access when required enrollment permission is present', () => {
    const authorization = new AuthorizationService()
    const adminContext = createAuthContext({
      permissions: new Set([
        'enrollments.create',
        'enrollments.read',
        'enrollments.update',
        'enrollments.promote',
        'enrollments.transfer',
        'enrollments.withdraw',
      ]),
    })

    expect(() => authorization.requirePermission(adminContext, 'enrollments.read')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'enrollments.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'enrollments.promote')).not.toThrow()
  })
})
