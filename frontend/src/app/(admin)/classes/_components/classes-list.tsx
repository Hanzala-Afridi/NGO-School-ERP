'use client'

import { useActionState, useState } from 'react'
import type { Class } from '@ngo-school-erp/contracts'

import { createClassAction, updateClassAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function ClassRow({ cls }: { cls: Class }) {
  const [editing, setEditing] = useState(false)
  const [state, dispatch, pending] = useActionState(updateClassAction, {})

  return (
    <TableRow>
      <TableCell className="font-bold text-foreground">{cls.name}</TableCell>
      <TableCell className="font-mono text-xs font-semibold">{cls.code}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-semibold">
          Grade Order {cls.gradeOrder}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={cls.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {cls.status}
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
              <DialogTitle>Edit Class Grade Level</DialogTitle>
            </DialogHeader>
            <form action={dispatch} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={cls.id} />
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
                <Label htmlFor={`cls-name-${cls.id}`}>Class Name</Label>
                <Input id={`cls-name-${cls.id}`} name="name" defaultValue={cls.name} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cls-code-${cls.id}`}>Class Code</Label>
                  <Input id={`cls-code-${cls.id}`} name="code" defaultValue={cls.code} required maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cls-order-${cls.id}`}>Grade Sequence Order</Label>
                  <Input id={`cls-order-${cls.id}`} name="gradeOrder" type="number" min={1} defaultValue={cls.gradeOrder} required />
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

export function ClassesList({ classes, schoolId }: { classes: Class[]; schoolId: string }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createState, createAction, createPending] = useActionState(createClassAction, {})

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Grade Levels & Classes</CardTitle>
          <CardDescription>Total {classes.length} grade levels configured</CardDescription>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold shadow-xs">+ Add Grade Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Grade Class Level</DialogTitle>
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
                <Label htmlFor="cls-new-name">Class Name</Label>
                <Input id="cls-new-name" name="name" placeholder="Class 4" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cls-new-code">Class Code</Label>
                  <Input id="cls-new-code" name="code" placeholder="CL4" required maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cls-new-order">Grade Sequence Order</Label>
                  <Input id="cls-new-order" name="gradeOrder" type="number" min={1} placeholder="7" required />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? 'Creating...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Class Code</TableHead>
              <TableHead>Sequence Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <ClassRow key={cls.id} cls={cls} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
