'use client'

import { useActionState, useState } from 'react'
import type { AcademicYear, Class, Enrollment, Section, Student } from '@ngo-school-erp/contracts'

import {
  createEnrollmentAction,
  promoteEnrollmentAction,
  transferEnrollmentAction,
  withdrawEnrollmentAction,
} from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface EnrollmentsListProps {
  enrollments: Enrollment[]
  students: Student[]
  academicYears: AcademicYear[]
  classes: Class[]
  sections: Section[]
}

export function EnrollmentsList({
  enrollments,
  students,
  academicYears,
  classes,
  sections,
}: EnrollmentsListProps) {
  const [createState, createAction, createPending] = useActionState(createEnrollmentAction, {})
  const [promoteState, promoteAction, promotePending] = useActionState(promoteEnrollmentAction, {})
  const [transferState, transferAction, transferPending] = useActionState(transferEnrollmentAction, {})
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(withdrawEnrollmentAction, {})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [promoteTarget, setPromoteTarget] = useState<Enrollment | null>(null)
  const [transferTarget, setTransferTarget] = useState<Enrollment | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<Enrollment | null>(null)

  const [yearFilter, setYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = enrollments.filter((e) => {
    const matchYear = yearFilter === 'all' || e.academicYearId === yearFilter
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchYear && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Enrollments</h1>
          <p className="text-sm text-muted-foreground">Manage student class enrollments, promotions, transfers, and withdrawals</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Enroll Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll Student in Academic Year</DialogTitle>
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
                <Label htmlFor="studentId">Select Student</Label>
                <Select name="studentId" defaultValue={students[0]?.id ?? ''}>
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName} ({s.studentNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYearId">Academic Year</Label>
                <Select name="academicYearId" defaultValue={academicYears[0]?.id ?? ''}>
                  <SelectTrigger id="academicYearId">
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((ay) => (
                      <SelectItem key={ay.id} value={ay.id}>
                        {ay.name} ({ay.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
                  <Select name="classId" defaultValue={classes[0]?.id ?? ''}>
                    <SelectTrigger id="classId">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectionId">Section (optional)</Label>
                  <Select name="sectionId">
                    <SelectTrigger id="sectionId">
                      <SelectValue placeholder="None / Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((sec) => (
                        <SelectItem key={sec.id} value={sec.id}>
                          Section {sec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number (optional)</Label>
                <Input id="rollNumber" name="rollNumber" type="number" placeholder="101" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? 'Enrolling...' : 'Enroll Student'}
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
              <CardTitle>Enrollment Records</CardTitle>
              <CardDescription>Total {filtered.length} enrollments listed</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="promoted">Promoted</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Roll #</TableHead>
                <TableHead>Class ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Lifecycle Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No enrollment records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((en) => (
                  <TableRow key={en.id}>
                    <TableCell className="font-mono text-xs font-medium">{en.studentId.substring(0, 8)}...</TableCell>
                    <TableCell>{en.rollNumber ?? '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{en.classId.substring(0, 8)}...</TableCell>
                    <TableCell>{en.startDate}</TableCell>
                    <TableCell>
                      <Badge variant={en.status === 'active' ? 'default' : 'secondary'}>
                        {en.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {en.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setPromoteTarget(en)}>
                            Promote
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setTransferTarget(en)}>
                            Transfer
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setWithdrawTarget(en)}>
                            Withdraw
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Promote Dialog */}
      {promoteTarget && (
        <Dialog open={!!promoteTarget} onOpenChange={(o) => !o && setPromoteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote Student to Next Academic Year/Class</DialogTitle>
            </DialogHeader>
            <form action={promoteAction} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={promoteTarget.id} />
              {promoteState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {promoteState.error}
                </div>
              )}
              {promoteState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {promoteState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="targetAcademicYearId">Target Academic Year</Label>
                <Select name="targetAcademicYearId" defaultValue={academicYears[0]?.id ?? ''}>
                  <SelectTrigger id="targetAcademicYearId">
                    <SelectValue placeholder="Select target academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((ay) => (
                      <SelectItem key={ay.id} value={ay.id}>
                        {ay.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetClassId">Target Class</Label>
                <Select name="targetClassId" defaultValue={classes[0]?.id ?? ''}>
                  <SelectTrigger id="targetClassId">
                    <SelectValue placeholder="Select target class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRollNumber">New Roll Number (optional)</Label>
                <Input id="newRollNumber" name="newRollNumber" type="number" placeholder="Roll #" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setPromoteTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={promotePending}>
                  {promotePending ? 'Promoting...' : 'Promote Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Transfer Dialog */}
      {transferTarget && (
        <Dialog open={!!transferTarget} onOpenChange={(o) => !o && setTransferTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Student Section / Class</DialogTitle>
            </DialogHeader>
            <form action={transferAction} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={transferTarget.id} />
              {transferState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {transferState.error}
                </div>
              )}
              {transferState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {transferState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="targetSectionId">Target Section</Label>
                <Select name="targetSectionId" defaultValue={sections[0]?.id ?? ''}>
                  <SelectTrigger id="targetSectionId">
                    <SelectValue placeholder="Select target section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRollNumber">New Roll Number (optional)</Label>
                <Input id="newRollNumber" name="newRollNumber" type="number" placeholder="Roll #" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setTransferTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={transferPending}>
                  {transferPending ? 'Transferring...' : 'Transfer Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Withdraw Dialog */}
      {withdrawTarget && (
        <Dialog open={!!withdrawTarget} onOpenChange={(o) => !o && setWithdrawTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Student Enrollment</DialogTitle>
            </DialogHeader>
            <form action={withdrawAction} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={withdrawTarget.id} />
              {withdrawState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {withdrawState.error}
                </div>
              )}
              {withdrawState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {withdrawState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Withdrawal Reason</Label>
                <Input id="reason" name="reason" placeholder="School transfer, relocation, etc." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setWithdrawTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={withdrawPending}>
                  {withdrawPending ? 'Withdrawing...' : 'Confirm Withdrawal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
