import Link from 'next/link'
import { Award, Calendar, CheckCircle, FileText, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getExams } from '@/lib/backend-api'

interface ExamRecord {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
}

export default async function AdminExamsPage() {
  let exams: ExamRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getExams('')
    exams = raw as unknown as ExamRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load examinations'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examinations & Results</h1>
          <p className="text-muted-foreground">Manage academic exams, component schedules, result approvals, and publication.</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled or conducted exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Results</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter((e) => e.status === 'approved' || e.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground">Reviewed by administration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter((e) => e.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground">Visible on parent portal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Examinations</CardTitle>
          <CardDescription>Click an examination to manage subject components and review marks roster.</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No examinations found for this academic term.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">{exam.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {exam.startDate} to {exam.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      exam.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      exam.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exam.status}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/exams/${exam.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
