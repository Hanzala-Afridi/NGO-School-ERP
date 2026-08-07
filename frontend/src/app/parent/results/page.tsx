import { Award } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getParentChildResults } from '@/lib/backend-api'

interface ResultRecord {
  id: string
  marksObtained: number | null
  grade: string | null
  descriptiveResult: string | null
  remarks: string | null
  publishedAt: string | null
}

export default async function ParentResultsPage() {
  let results: ResultRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getParentChildResults('', '')
    results = raw as unknown as ResultRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load exam results'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Results & Report Cards</h1>
        <p className="text-muted-foreground">View published examination scores and academic reports for your children.</p>
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
          <CardTitle>Published Examination Results</CardTitle>
          <CardDescription>Official verified marks and evaluation remarks.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Award className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No published examination results available at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Grade: {r.grade || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className={r.descriptiveResult === 'PASSED' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{r.descriptiveResult || 'PENDING'}</span>
                    </p>
                    {r.remarks && <p className="text-xs text-muted-foreground mt-1">Teacher Remarks: &quot;{r.remarks}&quot;</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{r.marksObtained !== null ? r.marksObtained : 'ABSENT'}</div>
                    <span className="text-xs text-muted-foreground">Marks Obtained</span>
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
