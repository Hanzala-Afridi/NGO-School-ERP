'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { School, Student } from '@ngo-school-erp/contracts'
import { Search, UserPlus } from 'lucide-react'

import { createStudentAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface StudentsListProps {
  students: Student[]
  schools: School[]
}

export function StudentsList({ students, schools }: StudentsListProps) {
  const [createState, createAction, createPending] = useActionState(createStudentAction, {})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(search.toLowerCase())
    const matchGender = genderFilter === 'all' || s.gender === genderFilter
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchGender && matchStatus
  })

  return (
    <div className="space-y-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Enrolled Student Profiles</CardTitle>
              <CardDescription>Total {filtered.length} student records listed</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full sm:w-56"
                />
              </div>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-semibold shadow-xs gap-1.5">
                    <UserPlus className="size-4" />
                    <span>Register Student</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Register New Student</DialogTitle>
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

                    <div className="space-y-1.5">
                      <Label htmlFor="schoolId">School Campus</Label>
                      <Select name="schoolId" defaultValue={schools[0]?.id ?? ''}>
                        <SelectTrigger id="schoolId">
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((sch) => (
                            <SelectItem key={sch.id} value={sch.id}>
                              {sch.name} ({sch.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" placeholder="Muhammad Ali" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="studentNumber">Registration # (Optional)</Label>
                        <Input id="studentNumber" name="studentNumber" placeholder="STD-2026-00101" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender" defaultValue="male">
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admissionDate">Admission Date</Label>
                      <Input id="admissionDate" name="admissionDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address">Residential Address</Label>
                      <Input id="address" name="address" placeholder="House #, Street, City" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyNotes">Emergency Notes</Label>
                      <Input id="emergencyNotes" name="emergencyNotes" placeholder="Blood group, allergies, contact" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPending}>
                        {createPending ? 'Registering...' : 'Register Student'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student #</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No student records found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-xs font-semibold">{student.studentNumber}</TableCell>
                    <TableCell className="font-medium text-foreground">{student.fullName}</TableCell>
                    <TableCell className="capitalize text-xs">{student.gender}</TableCell>
                    <TableCell className="text-xs">{student.dateOfBirth}</TableCell>
                    <TableCell className="text-xs">{student.admissionDate}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/students/${student.id}`}>View Profile</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
