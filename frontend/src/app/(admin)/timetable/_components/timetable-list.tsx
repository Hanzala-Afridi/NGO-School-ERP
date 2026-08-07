'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AcademicYear, Class, Section, Subject, TimetableEntry } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import {
  createTimetableEntryAction,
  deleteTimetableEntryAction,
  updateTimetableEntryAction,
} from '@/app/admin/actions'

const WEEKDAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
]

function TimetableRow({
  entry,
  classes,
  sections,
  subjects,
}: {
  entry: TimetableEntry
  academicYears: AcademicYear[]
  classes: Class[]
  sections: Section[]
  subjects: Subject[]
}) {
  const [editing, setEditing] = useState(false)
  const [updateState, updateDispatch, updatePending] = useActionState(updateTimetableEntryAction, {})
  const [deleteState, deleteDispatch, deletePending] = useActionState(deleteTimetableEntryAction, {})

  const cls = classes.find((c) => c.id === entry.classId)
  const sec = sections.find((s) => s.id === entry.sectionId)
  const subj = subjects.find((sb) => sb.id === entry.subjectId)
  const day = WEEKDAYS.find((w) => w.id === entry.weekday)?.name ?? `Day ${entry.weekday}`

  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={updateDispatch} className="grid gap-3">
          {updateState.error && <Alert className="text-destructive">{updateState.error}</Alert>}
          <input type="hidden" name="id" value={entry.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <Label htmlFor={`tt-day-${entry.id}`}>Weekday</Label>
              <select
                id={`tt-day-${entry.id}`}
                name="weekday"
                defaultValue={entry.weekday}
                className="rounded-md border bg-card px-3 py-1.5 text-sm"
              >
                {WEEKDAYS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`tt-start-${entry.id}`}>Start Time</Label>
              <Input
                id={`tt-start-${entry.id}`}
                name="startTime"
                type="time"
                defaultValue={entry.startTime}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`tt-end-${entry.id}`}>End Time</Label>
              <Input
                id={`tt-end-${entry.id}`}
                name="endTime"
                type="time"
                defaultValue={entry.endTime}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`tt-room-${entry.id}`}>Room (optional)</Label>
              <Input id={`tt-room-${entry.id}`} name="room" defaultValue={entry.room ?? ''} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`tt-status-${entry.id}`}>Status</Label>
              <select
                id={`tt-status-${entry.id}`}
                name="status"
                defaultValue={entry.status}
                className="rounded-md border bg-card px-3 py-1.5 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{day}</span>
              <span className="text-sm bg-muted px-2 py-0.5 rounded font-mono">
                {entry.startTime} - {entry.endTime}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {subj?.name ?? 'Subject'} | {cls?.name ?? 'Class'} {sec ? `(${sec.name})` : ''}{' '}
              {entry.room ? `• Room: ${entry.room}` : ''}
              {entry.teacherId ? ` • Teacher: ${entry.teacherId}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${entry.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {entry.status}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <form action={deleteDispatch} className="inline">
              {deleteState.error && <span className="text-xs text-destructive mr-1">{deleteState.error}</span>}
              <input type="hidden" name="id" value={entry.id} />
              <Button size="sm" variant="destructive" disabled={deletePending}>
                {deletePending ? 'Deleting…' : 'Delete'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </li>
  )
}

export function TimetableList({
  entries,
  academicYears,
  classes,
  sections,
  subjects,
  selectedAcademicYearId,
  selectedClassId,
  selectedSectionId,
}: {
  entries: TimetableEntry[]
  academicYears: AcademicYear[]
  classes: Class[]
  sections: Section[]
  subjects: Subject[]
  selectedAcademicYearId?: string
  selectedClassId?: string
  selectedSectionId?: string
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createTimetableEntryAction, {})

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="tt-filter-ay">Academic Year</Label>
          <select
            id="tt-filter-ay"
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
            value={selectedAcademicYearId ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams()
              if (val) params.set('academicYearId', val)
              if (selectedClassId) params.set('classId', selectedClassId)
              if (selectedSectionId) params.set('sectionId', selectedSectionId)
              const qs = params.toString() ? `?${params.toString()}` : ''
              router.push(`/timetable${qs}`)
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
          <Label htmlFor="tt-filter-class">Class</Label>
          <select
            id="tt-filter-class"
            className="rounded-md border bg-card px-3 py-1.5 text-sm"
            value={selectedClassId ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams()
              if (selectedAcademicYearId) params.set('academicYearId', selectedAcademicYearId)
              if (val) params.set('classId', val)
              const qs = params.toString() ? `?${params.toString()}` : ''
              router.push(`/timetable${qs}`)
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

        {selectedClassId && (
          <div className="flex items-center gap-2">
            <Label htmlFor="tt-filter-sec">Section</Label>
            <select
              id="tt-filter-sec"
              className="rounded-md border bg-card px-3 py-1.5 text-sm"
              value={selectedSectionId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                const params = new URLSearchParams()
                if (selectedAcademicYearId) params.set('academicYearId', selectedAcademicYearId)
                if (selectedClassId) params.set('classId', selectedClassId)
                if (val) params.set('sectionId', val)
                const qs = params.toString() ? `?${params.toString()}` : ''
                router.push(`/timetable${qs}`)
              }}
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No timetable entries found.</p>
      )}

      <ul className="grid gap-3">
        {entries.map((entry) => (
          <TimetableRow
            key={entry.id}
            entry={entry}
            academicYears={academicYears}
            classes={classes}
            sections={sections}
            subjects={subjects}
          />
        ))}
      </ul>

      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Timetable Entry</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="tt-new-ay">Academic Year</Label>
                <select
                  id="tt-new-ay"
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
                <Label htmlFor="tt-new-class">Class</Label>
                <select
                  id="tt-new-class"
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
                <Label htmlFor="tt-new-sec">Section (optional)</Label>
                <select
                  id="tt-new-sec"
                  name="sectionId"
                  defaultValue={selectedSectionId ?? ''}
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
                <Label htmlFor="tt-new-subj">Subject</Label>
                <select
                  id="tt-new-subj"
                  name="subjectId"
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                  required
                >
                  <option value="">Select Subject…</option>
                  {subjects.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="grid gap-1">
                <Label htmlFor="tt-new-weekday">Weekday</Label>
                <select
                  id="tt-new-weekday"
                  name="weekday"
                  defaultValue={1}
                  className="rounded-md border bg-card px-3 py-1.5 text-sm"
                  required
                >
                  {WEEKDAYS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tt-new-start">Start Time</Label>
                <Input id="tt-new-start" name="startTime" type="time" required />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tt-new-end">End Time</Label>
                <Input id="tt-new-end" name="endTime" type="time" required />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tt-new-room">Room (optional)</Label>
                <Input id="tt-new-room" name="room" placeholder="Room 101" />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="tt-new-teacher">Teacher User Profile ID (optional UUID)</Label>
              <Input id="tt-new-teacher" name="teacherId" placeholder="Profile UUID" />
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
          + Add Timetable Entry
        </Button>
      )}
    </div>
  )
}
