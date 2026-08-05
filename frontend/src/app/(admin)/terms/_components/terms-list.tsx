'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AcademicYear, Term } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createTermAction, updateTermAction } from '@/app/admin/actions'

function TermRow({ term }: { term: Term }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateTermAction, {})
  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={term.id} />
          <div className="grid gap-1 sm:grid-cols-3 sm:gap-3">
            <div className="grid gap-1">
              <Label htmlFor={`term-name-${term.id}`}>Name</Label>
              <Input id={`term-name-${term.id}`} name="name" defaultValue={term.name} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`term-start-${term.id}`}>Start date</Label>
              <Input
                id={`term-start-${term.id}`}
                name="startDate"
                type="date"
                defaultValue={term.startDate}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`term-end-${term.id}`}>End date</Label>
              <Input
                id={`term-end-${term.id}`}
                name="endDate"
                type="date"
                defaultValue={term.endDate}
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
            <p className="font-medium">{term.name}</p>
            <p className="text-sm text-muted-foreground">
              {term.startDate} → {term.endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${term.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {term.status}
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

export function TermsList({
  terms,
  academicYears,
  selectedYearId,
}: {
  terms: Term[]
  academicYears: AcademicYear[]
  selectedYearId?: string
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createTermAction, {})
  const selectedYear = academicYears.find((y) => y.id === selectedYearId)

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="year-filter">Academic year</Label>
        <select
          id="year-filter"
          className="rounded-md border bg-card px-3 py-1.5 text-sm"
          value={selectedYearId ?? ''}
          onChange={(e) => {
            const val = e.target.value
            router.push(val ? `/terms?academicYearId=${encodeURIComponent(val)}` : '/terms')
          }}
        >
          <option value="">All years</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </select>
      </div>

      {terms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No terms found{selectedYear ? ` for ${selectedYear.name}` : ''}.
        </p>
      )}
      <ul className="grid gap-3">
        {terms.map((term) => (
          <TermRow key={term.id} term={term} />
        ))}
      </ul>

      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Term</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="term-year">Academic year</Label>
              <select
                id="term-year"
                name="academicYearId"
                defaultValue={selectedYearId ?? ''}
                className="rounded-md border bg-card px-3 py-1.5 text-sm"
                required
              >
                <option value="">Select year…</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1">
                <Label htmlFor="term-new-name">Name</Label>
                <Input id="term-new-name" name="name" placeholder="Term 1" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="term-new-start">Start date</Label>
                <Input id="term-new-start" name="startDate" type="date" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="term-new-end">End date</Label>
                <Input id="term-new-end" name="endDate" type="date" required />
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
          + Add Term
        </Button>
      )}
    </div>
  )
}
