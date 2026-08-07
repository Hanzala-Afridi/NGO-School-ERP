import { MessageSquare, User } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getConversations } from '@/lib/backend-api'

interface ConvRecord {
  id: string
  studentName?: string
  status: string
  updatedAt: string
}

export default async function TeacherMessagesPage() {
  let conversations: ConvRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getConversations('')
    conversations = raw as unknown as ConvRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load conversations'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parent Messages & Discussions</h1>
        <p className="text-muted-foreground">Direct communication threads with parents of assigned students.</p>
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
          <CardTitle>Active Conversations</CardTitle>
          <CardDescription>Direct messaging with verified parent contacts.</CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No active message threads with parents.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Parent of {c.studentName || 'Student'}</h3>
                      <p className="text-xs text-muted-foreground">Updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 capitalize">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
