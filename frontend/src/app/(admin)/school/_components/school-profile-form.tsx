'use client'

import { useActionState } from 'react'
import type { School, Campus } from '@ngo-school-erp/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { updateSchoolAction } from '@/app/admin/actions'

export function SchoolProfileForm({ school, campus }: { school: School; campus: Campus | null }) {
  const [state, dispatch, pending] = useActionState(updateSchoolAction, {})
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      {state.error && <Alert className="mb-4 text-destructive">{state.error}</Alert>}
      {state.message && <Alert className="mb-4 text-green-700">{state.message}</Alert>}
      <form action={dispatch} className="grid gap-4">
        <input type="hidden" name="id" value={school.id} />
        <div className="grid gap-1.5">
          <Label htmlFor="school-name">School name</Label>
          <Input id="school-name" name="name" defaultValue={school.name} required maxLength={200} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="school-address">Address</Label>
          <Input
            id="school-address"
            name="address"
            defaultValue={school.address ?? ''}
            maxLength={500}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="school-phone">Phone</Label>
          <Input id="school-phone" name="phone" defaultValue={school.phone ?? ''} maxLength={50} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="school-email">Email</Label>
          <Input
            id="school-email"
            name="email"
            type="email"
            defaultValue={school.email ?? ''}
            maxLength={320}
          />
        </div>
        {campus && (
          <p className="text-sm text-muted-foreground">
            Default campus: <strong>{campus.name}</strong> ({campus.code})
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </section>
  )
}
