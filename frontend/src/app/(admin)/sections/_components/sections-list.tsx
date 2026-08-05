'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Class, Section } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createSectionAction, updateSectionAction } from '@/app/admin/actions'

function SectionRow({ section }: { section: Section }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateSectionAction, {})
  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={section.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`sec-name-${section.id}`}>Name</Label>
              <Input
                id={`sec-name-${section.id}`}
                name="name"
                defaultValue={section.name}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`sec-cap-${section.id}`}>Capacity (optional)</Label>
              <Input
                id={`sec-cap-${section.id}`}
                name="capacity"
                type="number"
                min={1}
                defaultValue={section.capacity ?? ''}
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
            <p className="font-medium">{section.name}</p>
            {section.capacity != null && (
              <p className="text-sm text-muted-foreground">Capacity: {section.capacity}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {section.status}
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

export function SectionsList({
  sections,
  classes,
  selectedClassId,
}: {
  sections: Section[]
  classes: Class[]
  selectedClassId?: string
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createSectionAction, {})
  const selectedClass = classes.find((c) => c.id === selectedClassId)

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="class-filter">Class</Label>
        <select
          id="class-filter"
          className="rounded-md border bg-card px-3 py-1.5 text-sm"
          value={selectedClassId ?? ''}
          onChange={(e) => {
            const val = e.target.value
            router.push(val ? `/sections?classId=${encodeURIComponent(val)}` : '/sections')
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

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No sections found{selectedClass ? ` for ${selectedClass.name}` : ''}.
        </p>
      )}
      <ul className="grid gap-3">
        {sections.map((section) => (
          <SectionRow key={section.id} section={section} />
        ))}
      </ul>

      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Section</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="sec-class">Class</Label>
              <select
                id="sec-class"
                name="classId"
                defaultValue={selectedClassId ?? ''}
                className="rounded-md border bg-card px-3 py-1.5 text-sm"
                required
              >
                <option value="">Select class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="sec-new-name">Name</Label>
                <Input id="sec-new-name" name="name" placeholder="Section A" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="sec-new-cap">Capacity (optional)</Label>
                <Input id="sec-new-cap" name="capacity" type="number" min={1} placeholder="30" />
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
          + Add Section
        </Button>
      )}
    </div>
  )
}
