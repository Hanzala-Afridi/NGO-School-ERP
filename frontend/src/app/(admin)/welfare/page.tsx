import { AlertCircle, HeartHandshake, ShieldAlert, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getHouseholds } from '@/lib/backend-api'

interface HouseholdRecord {
  id: string
  householdCode: string
  address: string
  householdSize: number
  incomeCategory: string
  housingStatus: string
  eligibilityStatus: string
  verificationStatus: string
  restrictedNotes?: string | null
}

export default async function AdminWelfarePage() {
  let households: HouseholdRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getHouseholds('')
    households = raw as unknown as HouseholdRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load welfare household profiles'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Household & Welfare Management</h1>
        <p className="text-muted-foreground">Manage family socio-economic profiling, eligibility, and vulnerability evaluations.</p>
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
            <CardTitle className="text-sm font-medium">Registered Households</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{households.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled student families</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible for Support</CardTitle>
            <HeartHandshake className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{households.filter((h) => h.eligibilityStatus === 'eligible').length}</div>
            <p className="text-xs text-muted-foreground">Verified ration & financial aid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{households.filter((h) => h.eligibilityStatus === 'under_review').length}</div>
            <p className="text-xs text-muted-foreground">Pending social worker evaluation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Household Welfare Directory</CardTitle>
          <CardDescription>Socio-economic classification and restricted social worker records.</CardDescription>
        </CardHeader>
        <CardContent>
          {households.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <HeartHandshake className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No welfare household profiles registered.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {households.map((h) => (
                <div key={h.id} className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary">{h.householdCode}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      h.eligibilityStatus === 'eligible' ? 'bg-emerald-100 text-emerald-800' :
                      h.eligibilityStatus === 'under_review' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'
                    }`}>
                      {h.eligibilityStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{h.address}</h3>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Family Size: {h.householdSize}</span>
                    <span>Income: <span className="capitalize">{h.incomeCategory.replace('_', ' ')}</span></span>
                    <span>Housing: <span className="capitalize">{h.housingStatus}</span></span>
                  </div>
                  {h.restrictedNotes && (
                    <div className="p-2.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-2 mt-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                      <div>
                        <span className="font-semibold block">Confidential Social Worker Note:</span>
                        {h.restrictedNotes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
