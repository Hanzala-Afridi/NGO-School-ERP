'use client'

import { useActionState, useState } from 'react'
import type { AcademicYear } from '@ngo-school-erp/contracts'

import { createAcademicYearAction, updateAcademicYearAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function AcademicYearRow({ year }: { year: AcademicYear }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateAcademicYearAction, {})

  return (
    <TableRow>
      <TableCell className="font-semibold text-foreground">{year.name}</TableCell>
      <TableCell>{year.startDate}</TableCell>
      <TableCell>{year.endDate}</TableCell>
      <TableCell>
        <Badge variant={year.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {year.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Academic Year Period</DialogTitle>
            </DialogHeader>
            <form action={dispatch} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={year.id} />
              {state.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              {state.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {state.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`edit-name-${year.id}`}>Academic Year Name</Label>
                <Input id={`edit-name-${year.id}`} name="name" defaultValue={year.name} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edit-start-${year.id}`}>Start Date</Label>
                  <Input id={`edit-start-${year.id}`} name="startDate" type="date" defaultValue={year.startDate} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit-end-${year.id}`}>End Date</Label>
                  <Input id={`edit-end-${year.id}`} name="endDate" type="date" defaultValue={year.endDate} required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  )
}

export function AcademicYearsList({
  years,
  schoolId,
}: {
  years: AcademicYear[]
  schoolId: string
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createState, createAction, createPending] = useActionState(createAcademicYearAction, {})

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Academic Sessions & Years</CardTitle>
          <CardDescription>Total {years.length} session periods configured</CardDescription>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold shadow-xs">+ Add Academic Year</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure New Academic Year</DialogTitle>
            </DialogHeader>
            <form action={createAction} className="space-y-4 pt-2">
              <input type="hidden" name="schoolId" value={schoolId} />
              {createState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {createState.error}
                </div>
              )}
              {createState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {createState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ay-new-name">Academic Year Name</Label>
                <Input id="ay-new-name" name="name" placeholder="2026–2027" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ay-new-start">Start Date</Label>
                  <Input id="ay-new-start" name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-new-end">End Date</Label>
                  <Input id="ay-new-end" name="endDate" type="date" required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? 'Creating...' : 'Create Academic Year'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {years.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No academic years created yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <AcademicYearRow key={year.id} year={year} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
