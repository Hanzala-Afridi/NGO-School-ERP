import { AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getComplaints } from '@/lib/backend-api'

interface ComplaintRecord {
  id: string
  category: string
  subject: string
  description: string
  status: string
  createdAt: string
  resolution?: string | null
}

export default async function ParentComplaintsPage() {
  let complaints: ComplaintRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getComplaints('')
    complaints = raw as unknown as ComplaintRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load submitted complaints'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Feedback & Complaints</h1>
          <p className="text-muted-foreground">Submit feedback or track issue resolution with administration.</p>
        </div>
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
          <CardTitle>Submitted Complaints & Feedback</CardTitle>
          <CardDescription>Track resolution progress and staff response notes.</CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>You have not submitted any complaints or issues.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{c.category}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{c.subject}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  {c.resolution && (
                    <div className="p-3 rounded bg-muted text-xs border-l-2 border-primary">
                      <span className="font-semibold block mb-1">Resolution Note:</span>
                      {c.resolution}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pt-2">Submitted: {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
