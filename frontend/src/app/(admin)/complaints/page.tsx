import { AlertCircle, CheckCircle2, Clock, MessageSquare } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getComplaints } from '@/lib/backend-api'

interface ComplaintRecord {
  id: string
  parentName?: string
  studentName?: string
  category: string
  subject: string
  description: string
  priority: string
  status: string
  createdAt: string
}

export default async function AdminComplaintsPage() {
  let complaints: ComplaintRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getComplaints('')
    complaints = raw as unknown as ComplaintRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load complaints'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parent Complaints & Issues</h1>
        <p className="text-muted-foreground">Review, assign, and resolve parent feedback and complaint submissions.</p>
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
            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.filter((c) => c.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review or assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.filter((c) => c.status === 'in_progress').length}</div>
            <p className="text-xs text-muted-foreground">Assigned to staff for action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length}</div>
            <p className="text-xs text-muted-foreground">Completed resolutions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Queue</CardTitle>
          <CardDescription>Track resolution state and staff assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No complaints or issues reported.</p>
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
                  <div className="text-xs text-muted-foreground pt-2 flex items-center justify-between">
                    <span>Parent: {c.parentName || 'Parent'} ({c.studentName || 'Student'})</span>
                    <span>Submitted: {new Date(c.createdAt).toLocaleDateString()}</span>
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
