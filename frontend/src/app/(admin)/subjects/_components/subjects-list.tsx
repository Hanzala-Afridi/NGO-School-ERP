'use client'

import { useActionState, useState } from 'react'
import type { Subject } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createSubjectAction, updateSubjectAction } from '@/app/admin/actions'

function SubjectRow({ subject }: { subject: Subject }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateSubjectAction, {})
  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={subject.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`subj-name-${subject.id}`}>Name</Label>
              <Input
                id={`subj-name-${subject.id}`}
                name="name"
                defaultValue={subject.name}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`subj-code-${subject.id}`}>Code</Label>
              <Input
                id={`subj-code-${subject.id}`}
                name="code"
                defaultValue={subject.code}
                required
                maxLength={20}
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
            <p className="font-medium">{subject.name}</p>
            <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${subject.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {subject.status}
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

export function SubjectsList({ subjects, schoolId }: { subjects: Subject[]; schoolId: string }) {
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createSubjectAction, {})
  return (
    <div className="grid gap-4">
      {subjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects yet.</p>}
      <ul className="grid gap-3">
        {subjects.map((subject) => (
          <SubjectRow key={subject.id} subject={subject} />
        ))}
      </ul>
      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Subject</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <input type="hidden" name="schoolId" value={schoolId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="subj-new-name">Name</Label>
                <Input id="subj-new-name" name="name" placeholder="Mathematics" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="subj-new-code">Code</Label>
                <Input id="subj-new-code" name="code" placeholder="MATH" required maxLength={20} />
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
          + Add Subject
        </Button>
      )}
    </div>
  )
}
