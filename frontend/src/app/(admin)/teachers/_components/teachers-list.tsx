'use client'

import { useActionState, useState } from 'react'
import type { Teacher } from '@ngo-school-erp/contracts'

import { createTeacherAction, updateTeacherAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TeachersListProps {
  teachers: Teacher[]
  profiles: Array<{ id: string; fullName: string; email: string }>
}

export function TeachersList({ teachers, profiles }: TeachersListProps) {
  const [createState, createAction, createPending] = useActionState(createTeacherAction, {})
  const [updateState, updateAction, updatePending] = useActionState(updateTeacherAction, {})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [search, setSearch] = useState('')

  const filtered = teachers.filter(
    (t) =>
      t.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      (t.qualification && t.qualification.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers Directory</h1>
          <p className="text-sm text-muted-foreground">Manage teacher employment records and qualifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Register Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Teacher Record</DialogTitle>
            </DialogHeader>
            <form action={createAction} className="space-y-4 pt-2">
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
                <Label htmlFor="profileId">Select User Profile</Label>
                <Select name="profileId" defaultValue={profiles[0]?.id ?? ''}>
                  <SelectTrigger id="profileId">
                    <SelectValue placeholder="Select user profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.fullName} ({prof.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Employee Number</Label>
                  <Input id="employeeNumber" name="employeeNumber" placeholder="EMP-1001 (optional)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input id="joiningDate" name="joiningDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification & Degrees</Label>
                <Input id="qualification" name="qualification" placeholder="M.Sc. Mathematics, B.Ed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select name="employmentStatus" defaultValue="active">
                  <SelectTrigger id="employmentStatus">
                    <SelectValue placeholder="Employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? 'Registering...' : 'Register Teacher'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>All Teacher Records</CardTitle>
              <CardDescription>Total {filtered.length} faculty members listed</CardDescription>
            </div>
            <Input
              placeholder="Search employee # or qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Profile ID</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Employment Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No teacher records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-mono text-xs font-semibold">{teacher.employeeNumber}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{teacher.profileId.substring(0, 8)}...</TableCell>
                    <TableCell>{teacher.qualification ?? 'N/A'}</TableCell>
                    <TableCell>{teacher.joiningDate}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.employmentStatus === 'active' ? 'default' : 'secondary'}>
                        {teacher.employmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditTeacher(teacher)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editTeacher && (
        <Dialog open={!!editTeacher} onOpenChange={(o) => !o && setEditTeacher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teacher Profile</DialogTitle>
            </DialogHeader>
            <form action={updateAction} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={editTeacher.id} />
              {updateState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {updateState.error}
                </div>
              )}
              {updateState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {updateState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-emp">Employee Number</Label>
                <Input id="edit-emp" name="employeeNumber" defaultValue={editTeacher.employeeNumber} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-qual">Qualification</Label>
                <Input id="edit-qual" name="qualification" defaultValue={editTeacher.qualification ?? ''} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-join">Joining Date</Label>
                  <Input id="edit-join" name="joiningDate" type="date" defaultValue={editTeacher.joiningDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-empStatus">Employment Status</Label>
                  <Select name="employmentStatus" defaultValue={editTeacher.employmentStatus}>
                    <SelectTrigger id="edit-empStatus">
                      <SelectValue placeholder="Employment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditTeacher(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
