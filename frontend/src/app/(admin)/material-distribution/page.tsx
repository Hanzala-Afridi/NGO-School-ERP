import { BookOpen, RefreshCw, Shirt, UserCheck } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getStudentDistributions } from '@/lib/backend-api'

interface MaterialRecord {
  id: string
  studentId: string
  distributionType: string
  quantity: number
  sizeOrVariant?: string | null
  issueDate: string
  approvalStatus: string
}

export default async function AdminMaterialDistributionPage() {
  let distributions: MaterialRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getStudentDistributions('')
    distributions = raw as unknown as MaterialRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load material distribution history'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Material & Uniform Distribution</h1>
        <p className="text-muted-foreground">Issue uniforms, shoes, textbooks, bags, and manage replacement workflows.</p>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uniform Kits</CardTitle>
            <Shirt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.filter((d) => d.distributionType === 'uniform').length}</div>
            <p className="text-xs text-muted-foreground">Sets issued to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Textbook Bundles</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.filter((d) => d.distributionType === 'textbooks').length}</div>
            <p className="text-xs text-muted-foreground">Curriculum packs issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Replacements</CardTitle>
            <RefreshCw className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.filter((d) => d.approvalStatus === 'pending_approval').length}</div>
            <p className="text-xs text-muted-foreground">Pending replacement requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Receipts</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.length}</div>
            <p className="text-xs text-muted-foreground">Total material distributions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Distribution Log</CardTitle>
          <CardDescription>Recent student material, uniform, and shoe issuance history.</CardDescription>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Shirt className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No student material distributions recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {distributions.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm capitalize">{d.distributionType}</span>
                      {d.sizeOrVariant && (
                        <span className="text-xs text-muted-foreground">({d.sizeOrVariant})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Issue Date: {d.issueDate} | Qty: {d.quantity}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 capitalize">
                    {d.approvalStatus}
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
