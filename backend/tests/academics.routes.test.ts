import { describe, expect, it } from 'vitest'

import { AuthorizationService } from '../src/modules/rbac/application/authorization.service.js'
import { createAuthContext } from './test-doubles.js'

describe('Academics permissions and route prerequisites', () => {
  it('denies academic resource access without required permission', () => {
    const authorization = new AuthorizationService()
    const teacherContext = createAuthContext({
      permissions: ['profiles.read_self'],
    })

    expect(() => authorization.requirePermission(teacherContext, 'schools.read')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'academic_years.create')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'classes.update')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'teachers.assign')).toThrow()
    expect(() => authorization.requirePermission(teacherContext, 'timetable.create')).toThrow()
  })

  it('allows access when required academic permission is present', () => {
    const authorization = new AuthorizationService()
    const adminContext = createAuthContext({
      permissions: new Set([
        'schools.read',
        'schools.update',
        'academic_years.create',
        'classes.create',
        'sections.create',
        'subjects.create',
        'teachers.assign',
        'timetable.read',
        'timetable.create',
        'timetable.update',
        'timetable.delete',
      ]),
    })

    expect(() => authorization.requirePermission(adminContext, 'schools.read')).not.toThrow()
    expect(() =>
      authorization.requirePermission(adminContext, 'academic_years.create'),
    ).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'classes.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'teachers.assign')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'timetable.create')).not.toThrow()
  })
})
