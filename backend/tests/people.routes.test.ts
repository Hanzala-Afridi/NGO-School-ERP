import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('People Permissions and Route Rules', () => {
  it('denies people access without required permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(teacherContext, 'students.read')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'students.create')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'parents.create')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'teachers.create')).toThrow()
  })

  it('allows access when required people permission is present', () => {
    const authorization = new AuthorizationService()
    const adminContext = createAuthContext({
      permissions: new Set([
        'students.create',
        'students.read',
        'students.update',
        'students.archive',
        'parents.create',
        'parents.read',
        'parents.update',
        'parents.link_student',
        'teachers.create',
        'teachers.read',
        'teachers.update',
      ]),
    })

    expect(() => authorization.requirePermission(adminContext, 'students.read')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'students.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'parents.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'teachers.create')).not.toThrow()
  })
})
