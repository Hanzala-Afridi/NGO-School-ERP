import { describe, expect, it } from 'vitest'

import { AcademicsService } from '../src/modules/academics/application/academics.service.js'
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
    expect(() => authorization.requirePermission(adminContext, 'academic_years.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'classes.create')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'teachers.assign')).not.toThrow()
    expect(() => authorization.requirePermission(adminContext, 'timetable.create')).not.toThrow()
  })

  it('rejects timetable teacher conflict during overlapping time slot', async () => {
    const mockAudit = { record: async () => {} } as any
    const mockRepo = {
      listTimetableEntries: async () => [
        {
          id: 't-1',
          academicYearId: 'year-1',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-1',
          teacherId: 'teacher-1',
          weekday: 1,
          startTime: '08:00',
          endTime: '09:00',
          room: '101',
          status: 'active',
        },
      ],
    } as any

    const service = new AcademicsService(mockRepo, mockAudit)
    const adminContext = createAuthContext()

    await expect(
      service.createTimetableEntry(adminContext, {
        academicYearId: 'year-1',
        classId: 'class-2',
        sectionId: 'sec-2',
        subjectId: 'sub-2',
        teacherId: 'teacher-1',
        weekday: 1,
        startTime: '08:30',
        endTime: '09:30',
        room: '102',
      })
    ).rejects.toThrow('Teacher is already scheduled')
  })

  it('rejects timetable room double-booking conflict during overlapping time slot', async () => {
    const mockAudit = { record: async () => {} } as any
    const mockRepo = {
      listTimetableEntries: async () => [
        {
          id: 't-1',
          academicYearId: 'year-1',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-1',
          teacherId: 'teacher-1',
          weekday: 1,
          startTime: '08:00',
          endTime: '09:00',
          room: '101',
          status: 'active',
        },
      ],
    } as any

    const service = new AcademicsService(mockRepo, mockAudit)
    const adminContext = createAuthContext()

    await expect(
      service.createTimetableEntry(adminContext, {
        academicYearId: 'year-1',
        classId: 'class-2',
        sectionId: 'sec-2',
        subjectId: 'sub-2',
        teacherId: 'teacher-2',
        weekday: 1,
        startTime: '08:15',
        endTime: '08:45',
        room: '101',
      })
    ).rejects.toThrow('Room is already booked')
  })
})
