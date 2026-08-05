'use client'

import { useActionState, useState } from 'react'
import type { AcademicYear } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createAcademicYearAction, updateAcademicYearAction } from '@/app/admin/actions'

function AcademicYearRow({ year }: { year: AcademicYear }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateAcademicYearAction, {})
  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={year.id} />
          <div className="grid gap-1 sm:grid-cols-3 sm:gap-3">
            <div className="grid gap-1">
              <Label htmlFor={`ay-name-${year.id}`}>Name</Label>
              <Input id={`ay-name-${year.id}`} name="name" defaultValue={year.name} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`ay-start-${year.id}`}>Start date</Label>
              <Input
                id={`ay-start-${year.id}`}
                name="startDate"
                type="date"
                defaultValue={year.startDate}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`ay-end-${year.id}`}>End date</Label>
              <Input
                id={`ay-end-${year.id}`}
                name="endDate"
                type="date"
                defaultValue={year.endDate}
                required
              />
            </div>
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
            <p className="font-medium">{year.name}</p>
            <p className="text-sm text-muted-foreground">
              {year.startDate} → {year.endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${year.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {year.status}
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

export function AcademicYearsList({
  years,
  schoolId,
}: {
  years: AcademicYear[]
  schoolId: string
}) {
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createAcademicYearAction, {})
  return (
    <div className="grid gap-4">
      {years.length === 0 && (
        <p className="text-sm text-muted-foreground">No academic years yet.</p>
      )}
      <ul className="grid gap-3">
        {years.map((year) => (
          <AcademicYearRow key={year.id} year={year} />
        ))}
      </ul>
      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Academic Year</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <input type="hidden" name="schoolId" value={schoolId} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1">
                <Label htmlFor="ay-new-name">Name</Label>
                <Input id="ay-new-name" name="name" placeholder="2026–2027" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="ay-new-start">Start date</Label>
                <Input id="ay-new-start" name="startDate" type="date" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="ay-new-end">End date</Label>
                <Input id="ay-new-end" name="endDate" type="date" required />
              </div>
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
          + Add Academic Year
        </Button>
      )}
    </div>
  )
}
