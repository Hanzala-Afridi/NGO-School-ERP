'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AcademicYear, Class, Section, Subject, TeacherAssignment } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createTeacherAssignmentAction, updateTeacherAssignmentAction } from '@/app/admin/actions'

function AssignmentRow({
  assignment,
  academicYears,
  classes,
  sections,
  subjects,
}: {
  assignment: TeacherAssignment
  academicYears: AcademicYear[]
  classes: Class[]
  sections: Section[]
  subjects: Subject[]
}) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateTeacherAssignmentAction, {})

  const year = academicYears.find((y) => y.id === assignment.academicYearId)
  const cls = classes.find((c) => c.id === assignment.classId)
  const sec = sections.find((s) => s.id === assignment.sectionId)
  const subj = subjects.find((sb) => sb.id === assignment.subjectId)

  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={assignment.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`ta-teacher-${assignment.id}`}>Teacher User Profile ID</Label>
              <Input
                id={`ta-teacher-${assignment.id}`}
                name="teacherId"
                defaultValue={assignment.teacherId}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`ta-status-${assignment.id}`}>Status</Label>
              <select
                id={`ta-status-${assignment.id}`}
                name="status"
                defaultValue={assignment.status}
                className="rounded-md border bg-card px-3 py-1.5 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`ta-ct-${assignment.id}`}
              name="isClassTeacher"
              defaultChecked={assignment.isClassTeacher}
              className="rounded border"
            />
            <Label htmlFor={`ta-ct-${assignment.id}`}>Class Teacher</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">
              Teacher ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{assignment.teacherId}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              {year?.name ?? 'AY'} | {cls?.name ?? 'Class'} {sec ? `(${sec.name})` : ''}{' '}
              {subj ? `— ${subj.name}` : ''}
              {assignment.isClassTeacher ? ' [Class Teacher]' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {assignment.status}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

export function TeacherAssignmentsList({
  assignments,
  academicYears,
  classes,
  sections,
  subjects,
  selectedAcademicYearId,
  selectedClassId,
}: {
  assignments: TeacherAssignment[]
  academicYears: AcademicYear[]
  classes: Class[]
  sections: Section[]
  subjects: Subject[]
  selectedAcademicYearId?: string
  selectedClassId?: string
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createTeacherAssignmentAction, {})

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="ay-filter">Academic Year</Label>
          <select
            id="ay-filter"
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
            value={selectedAcademicYearId ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams()
              if (val) params.set('academicYearId', val)
              if (selectedClassId) params.set('classId', selectedClassId)
              const qs = params.toString() ? `?${params.toString()}` : ''
              router.push(`/teacher-assignments${qs}`)
            }}
          >
            <option value="">All years</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="class-filter">Class</Label>
          <select
            id="class-filter"
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
            value={selectedClassId ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams()
              if (selectedAcademicYearId) params.set('academicYearId', selectedAcademicYearId)
              if (val) params.set('classId', val)
              const qs = params.toString() ? `?${params.toString()}` : ''
              router.push(`/teacher-assignments${qs}`)
            }}
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {assignments.length === 0 && (
        <p className="text-sm text-muted-foreground">No teacher assignments found.</p>
      )}

      <ul className="grid gap-3">
        {assignments.map((assignment) => (
          <AssignmentRow
            key={assignment.id}
            assignment={assignment}
            academicYears={academicYears}
            classes={classes}
            sections={sections}
            subjects={subjects}
          />
        ))}
      </ul>

      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Teacher Assignment</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="ta-new-teacher">Teacher User Profile ID (UUID)</Label>
              <Input
                id="ta-new-teacher"
                name="teacherId"
                placeholder="Profile UUID"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="ta-new-ay">Academic Year</Label>
                <select
                  id="ta-new-ay"
                  name="academicYearId"
                  defaultValue={selectedAcademicYearId ?? ''}
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                  required
                >
                  <option value="">Select Academic Year…</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="ta-new-class">Class</Label>
                <select
                  id="ta-new-class"
                  name="classId"
                  defaultValue={selectedClassId ?? ''}
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                  required
                >
                  <option value="">Select Class…</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="ta-new-sec">Section (optional)</Label>
                <select
                  id="ta-new-sec"
                  name="sectionId"
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                >
                  <option value="">None (all sections)</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="ta-new-subj">Subject (optional)</Label>
                <select
                  id="ta-new-subj"
                  name="subjectId"
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                >
                  <option value="">None (class teacher only)</option>
                  {subjects.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="ta-new-ct" name="isClassTeacher" className="rounded border" />
              <Label htmlFor="ta-new-ct">Assign as Class Teacher</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? 'Creating…' : 'Create'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <Button variant="outline" className="w-fit" onClick={() => setCreating(true)}>
          + Assign Teacher
        </Button>
      )}
    </div>
  )
}
