'use client'

import { useActionState } from 'react'
import type { Campus, School } from '@ngo-school-erp/contracts'

import { updateSchoolAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SchoolProfileForm({ school, campus }: { school: School; campus: Campus | null }) {
  const [state, dispatch, pending] = useActionState(updateSchoolAction, {})

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">School Administration Details</CardTitle>
            <CardDescription>Primary institution profile and contact parameters</CardDescription>
          </div>
          <Badge variant="outline" className="px-2.5 py-1 bg-primary/10 border-primary/20 text-primary font-mono text-xs">
            Code: {school.code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-5">
          <input type="hidden" name="id" value={school.id} />

          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3.5 text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}
          {state.message && (
            <div className="rounded-md bg-emerald-500/15 p-3.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {state.message}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="school-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Institution Name
            </Label>
            <Input id="school-name" name="name" defaultValue={school.name} required maxLength={200} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="school-address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Physical Campus Address
            </Label>
            <Input
              id="school-address"
              name="address"
              defaultValue={school.address ?? ''}
              maxLength={500}
              placeholder="Full address, City, Country"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="school-phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Official Phone Number
              </Label>
              <Input id="school-phone" name="phone" defaultValue={school.phone ?? ''} maxLength={50} placeholder="+92 (042) 3555-0199" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="school-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administrative Email
              </Label>
              <Input
                id="school-email"
                name="email"
                type="email"
                defaultValue={school.email ?? ''}
                maxLength={320}
                placeholder="info@ngoschool.org.pk"
              />
            </div>
          </div>

          {campus && (
            <div className="rounded-lg bg-muted/60 p-4 border text-sm flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">Default Campus Configuration:</span>
                <span className="text-muted-foreground ml-2">{campus.name}</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">{campus.code}</Badge>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={pending} className="font-semibold px-6 shadow-xs">
              {pending ? 'Saving Changes...' : 'Save School Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
