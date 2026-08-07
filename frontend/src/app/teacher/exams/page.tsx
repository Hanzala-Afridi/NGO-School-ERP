import Link from 'next/link'
import { Award, Edit3 } from 'lucide-react'

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

export default async function TeacherExamsPage() {
  let exams: ExamRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getExams('')
    exams = raw as unknown as ExamRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load assigned examinations'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Examinations & Marks Entry</h1>
        <p className="text-muted-foreground">Select an active exam to enter student subject marks.</p>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assigned Examinations</CardTitle>
          <CardDescription>Enter subject scores for assigned class rosters.</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Award className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No active examinations scheduled for your classes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <h3 className="font-semibold">{e.name}</h3>
                    <p className="text-xs text-muted-foreground">Term Examination ({e.startDate} to {e.endDate})</p>
                  </div>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/teacher/exams/${e.id}/marks`}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Enter Marks
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
