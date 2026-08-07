import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Homework permissions and route prerequisites', () => {
  it('denies homework creation without homework.create permission', () => {
    const authorization = new AuthorizationService()
    const parentContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(parentContext, 'homework.create')).toThrow()
  })

  it('allows homework creation for teacher with homework.create permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: new Set(['homework.create']),
    })

    expect(() => authorization.requirePermission(teacherContext, 'homework.create')).not.toThrow()
  })
})
