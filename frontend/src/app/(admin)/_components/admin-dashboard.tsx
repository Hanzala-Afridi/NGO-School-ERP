import Link from 'next/link'
import {
  GraduationCap,
  Layers,
  UserCog,
  Users,
} from 'lucide-react'

import type {
  AcademicYear,
  Class,
  Enrollment,
  Parent,
  Student,
  Teacher,
} from '@ngo-school-erp/contracts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AdminDashboardProps {
  students: Student[]
  parents: Parent[]
  teachers: Teacher[]
  enrollments: Enrollment[]
  classes: Class[]
  academicYears: AcademicYear[]
}

export function AdminDashboard({
  students,
  parents,
  teachers,
  enrollments,
  classes,
  academicYears,
}: AdminDashboardProps) {
  const activeStudentsCount = students.filter((s) => s.status === 'active').length
  const activeEnrollmentsCount = enrollments.filter((e) => e.status === 'active').length
  const activeYear = academicYears.find((ay) => ay.status === 'active') ?? academicYears[0]

  // Derived Analytics from 100% real API data
  const malesCount = students.filter((s) => s.gender === 'male').length
  const femalesCount = students.filter((s) => s.gender === 'female').length
  const otherGenderCount = students.filter((s) => s.gender === 'other').length

  const promotedCount = enrollments.filter((e) => e.status === 'promoted').length
  const transferredCount = enrollments.filter((e) => e.status === 'transferred').length
  const withdrawnCount = enrollments.filter((e) => e.status === 'withdrawn').length

  const totalEnrollments = enrollments.length || 1

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin ERP Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational overview for school profile, academic setup, staff, and student enrollments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeYear && (
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20 text-primary font-semibold">
              Current Year: {activeYear.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Stat Cards Grid (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Students</CardTitle>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeStudentsCount} active</span> student records
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{activeEnrollmentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled across {classes.length} grade levels</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faculty Members</CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <UserCog className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{teachers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered teacher profiles</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-xs transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parent Profiles</CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{parents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Linked family records</p>
          </CardContent>
        </Card>
      </div>

      {/* Derived Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment Lifecycle Distribution */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Enrollment Lifecycle Breakdown</CardTitle>
            <CardDescription>Distribution of student enrollment states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Active Enrollments</span>
                <span className="text-emerald-600 font-mono">{activeEnrollmentsCount} ({Math.round((activeEnrollmentsCount / totalEnrollments) * 100)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${(activeEnrollmentsCount / totalEnrollments) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Promoted Students</span>
                <span className="text-blue-600 font-mono">{promotedCount} ({Math.round((promotedCount / totalEnrollments) * 100)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(promotedCount / totalEnrollments) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Transferred / Withdrawn</span>
                <span className="text-amber-600 font-mono">{transferredCount + withdrawnCount} ({Math.round(((transferredCount + withdrawnCount) / totalEnrollments) * 100)}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${((transferredCount + withdrawnCount) / totalEnrollments) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Demographics Ratio */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Student Gender Ratio</CardTitle>
            <CardDescription>Demographic breakdown of registered students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center py-2">
              <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
                <span className="text-xs text-muted-foreground block font-medium">Male</span>
                <span className="text-2xl font-bold text-primary">{malesCount}</span>
              </div>
              <div className="rounded-lg bg-accent/20 p-3 border border-accent/30">
                <span className="text-xs text-muted-foreground block font-medium">Female</span>
                <span className="text-2xl font-bold text-accent-foreground">{femalesCount}</span>
              </div>
              <div className="rounded-lg bg-muted p-3 border">
                <span className="text-xs text-muted-foreground block font-medium">Other</span>
                <span className="text-2xl font-bold text-foreground">{otherGenderCount}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Total registered demographic count: {students.length} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Administrative Actions</CardTitle>
          <CardDescription>Shortcut workflows for school administration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" className="font-semibold shadow-xs">
              <Link href="/students">+ Register Student</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/enrollments">+ Enroll Student</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/teachers">+ Register Teacher</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/classes">+ Add Grade Level</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/teacher-assignments">+ Teacher Assignment</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/timetable">Manage Timetable</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity / System Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Student Registrations</CardTitle>
              <CardDescription>Latest admissions added to the system</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/students">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No students registered yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student #</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 5).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs font-medium">{student.studentNumber}</TableCell>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell className="capitalize text-xs">{student.gender}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Academic Setup Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Academic Setup Summary</CardTitle>
              <CardDescription>Configured grades and academic years</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/classes">View Classes</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Configured Classes (Pre-seeded KG 1 - Class 3)
              </span>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <Badge key={cls.id} variant="outline" className="px-2.5 py-1 text-xs">
                    {cls.name} ({cls.code})
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Academic Years
              </span>
              <div className="space-y-1">
                {academicYears.map((ay) => (
                  <div key={ay.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <span className="font-medium">{ay.name}</span>
                    <span className="text-xs text-muted-foreground">{ay.startDate} to {ay.endDate}</span>
                    <Badge variant={ay.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                      {ay.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
