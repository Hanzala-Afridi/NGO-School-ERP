'use client'

import { useActionState, useState } from 'react'
import type { Class } from '@ngo-school-erp/contracts'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { createClassAction, updateClassAction } from '@/app/admin/actions'

function ClassRow({ cls }: { cls: Class }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateClassAction, {})
  return (
    <li className="rounded-lg border bg-card p-4">
      {editing ? (
        <form action={dispatch} className="grid gap-3">
          {state.error && <Alert className="text-destructive">{state.error}</Alert>}
          <input type="hidden" name="id" value={cls.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <Label htmlFor={`cls-name-${cls.id}`}>Name</Label>
              <Input id={`cls-name-${cls.id}`} name="name" defaultValue={cls.name} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`cls-code-${cls.id}`}>Code</Label>
              <Input
                id={`cls-code-${cls.id}`}
                name="code"
                defaultValue={cls.code}
                required
                maxLength={20}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`cls-order-${cls.id}`}>Grade order</Label>
              <Input
                id={`cls-order-${cls.id}`}
                name="gradeOrder"
                type="number"
                min={1}
                defaultValue={cls.gradeOrder}
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
            <p className="font-medium">{cls.name}</p>
            <p className="text-sm text-muted-foreground">
              Code: {cls.code} · Grade {cls.gradeOrder}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}
            >
              {cls.status}
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

export function ClassesList({ classes, schoolId }: { classes: Class[]; schoolId: string }) {
  const [creating, setCreating] = useState(false)
  const [state, dispatch, pending] = useActionState(createClassAction, {})
  return (
    <div className="grid gap-4">
      <ul className="grid gap-3">
        {classes.map((cls) => (
          <ClassRow key={cls.id} cls={cls} />
        ))}
      </ul>
      {creating ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-3">New Class</h2>
          {state.error && <Alert className="mb-3 text-destructive">{state.error}</Alert>}
          {state.message && <Alert className="mb-3 text-green-700">{state.message}</Alert>}
          <form action={dispatch} className="grid gap-3">
            <input type="hidden" name="schoolId" value={schoolId} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1">
                <Label htmlFor="cls-new-name">Name</Label>
                <Input id="cls-new-name" name="name" placeholder="Class 4" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cls-new-code">Code</Label>
                <Input id="cls-new-code" name="code" placeholder="CL4" required maxLength={20} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cls-new-order">Grade order</Label>
                <Input
                  id="cls-new-order"
                  name="gradeOrder"
                  type="number"
                  min={1}
                  placeholder="7"
                  required
                />
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
          + Add Class
        </Button>
      )}
    </div>
  )
}
