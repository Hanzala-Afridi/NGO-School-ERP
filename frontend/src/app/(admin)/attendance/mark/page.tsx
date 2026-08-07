'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react'

import { bulkMarkAttendanceAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function MarkAttendanceSheet() {
  const [state, action, pending] = useActionState(bulkMarkAttendanceAction, {})
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  // Roster status map: studentId -> status (initially UNMARKED)
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  const mockStudents = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Muhammad Ali', roll: 1 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Ahmed Raza', roll: 2 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Fatima Noor', roll: 3 },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Ayesha Khan', roll: 4 },
  ]

  const handleMarkAllPresent = () => {
    const updated: Record<string, string> = {}
    mockStudents.forEach((s) => (updated[s.id] = 'present'))
    setStatuses(updated)
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  const recordsPayload = mockStudents
    .filter((s) => statuses[s.id])
    .map((s) => ({
      studentId: s.id,
      attendanceStatus: statuses[s.id],
      remarks: remarks[s.id] || null,
    }))

  const allMarked = mockStudents.length > 0 && recordsPayload.length === mockStudents.length

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/attendance">
            <ArrowLeft className="size-4 mr-1" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Bulk Attendance Marking Sheet</h1>
          <p className="text-sm text-muted-foreground">
            Initial roster loads <span className="font-semibold text-amber-600">UNMARKED</span>. Status must be chosen for every student.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Details & Class Selection</CardTitle>
          <CardDescription>Select academic parameters and attendance date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Attendance Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg1">KG1</SelectItem>
                  <SelectItem value="kg2">KG2</SelectItem>
                  <SelectItem value="class1">Class 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sec-a">Section A</SelectItem>
                  <SelectItem value="sec-b">Section B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Sheet */}
      <form action={action} className="space-y-6">
        <input type="hidden" name="academicYearId" value="a0000000-0000-0000-0000-000000000001" />
        <input type="hidden" name="classId" value="c0000000-0000-0000-0000-000000000001" />
        <input type="hidden" name="sectionId" value="s0000000-0000-0000-0000-000000000001" />
        <input type="hidden" name="attendanceDate" value={date} />
        <input type="hidden" name="recordsJson" value={JSON.stringify(recordsPayload)} />

        {state?.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
            {state.error}
          </div>
        )}
        {state?.message && (
          <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 font-medium">
            {state.message}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Class Roster</CardTitle>
              <CardDescription>Select status for each student. Unmarked roster will block submission.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleMarkAllPresent}>
              <UserCheck className="size-4 mr-1.5" /> Pre-fill &quot;Mark All Present&quot;
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Roll #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance Status</TableHead>
                    <TableHead>Remarks (Optional)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((s) => {
                    const st = statuses[s.id]
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold">{s.roll}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Select value={st || ''} onValueChange={(val) => handleStatusChange(s.id, val)}>
                            <SelectTrigger className={st ? 'border-emerald-500' : 'border-amber-500'}>
                              <SelectValue placeholder="-- UNMARKED --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional note"
                            value={remarks[s.id] || ''}
                            onChange={(e) => setRemarks({ ...remarks, [s.id]: e.target.value })}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div className="text-xs text-muted-foreground font-medium">
                {allMarked ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-4" /> All {mockStudents.length} students marked. Ready for submission.
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">
                    {mockStudents.length - recordsPayload.length} students remaining UNMARKED.
                  </span>
                )}
              </div>
              <Button type="submit" disabled={pending || !allMarked} className="px-6 font-semibold">
                {pending ? 'Submitting...' : 'Submit Final Attendance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
