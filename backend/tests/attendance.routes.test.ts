import { describe, expect, it } from 'vitest'
import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Attendance permissions and route prerequisites', () => {
  it('denies attendance marking without attendance.mark permission', () => {
    const authorization = new AuthorizationService()
    const parentContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(parentContext, 'attendance.mark')).toThrow()
    expect(() => authorization.requirePermission(parentContext, 'attendance.correct')).toThrow()
    expect(() => authorization.requirePermission(parentContext, 'attendance.lock')).toThrow()
  })

  it('allows attendance marking when attendance.mark is assigned', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: new Set(['attendance.mark', 'attendance.correct']),
    })

    expect(() => authorization.requirePermission(teacherContext, 'attendance.mark')).not.toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'attendance.correct')).not.toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'attendance.lock')).toThrow()
  })

  it('allows attendance locking for admin profile', () => {
    const authorization = new AuthorizationService()
    const adminContext = createAuthContext({
      permissions: new Set(['attendance.mark', 'attendance.correct', 'attendance.lock']),
    })

    expect(() => authorization.requirePermission(adminContext, 'attendance.lock')).not.toThrow()
  })
})
