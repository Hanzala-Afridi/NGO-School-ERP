import { HeartHandshake, Shield } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getParentWelfare } from '@/lib/backend-api'

interface HouseholdRecord {
  id: string
  householdCode: string
  address: string
  householdSize: number
  incomeCategory: string
  housingStatus: string
  eligibilityStatus: string
  verificationStatus: string
}

export default async function ParentWelfarePage() {
  let household: HouseholdRecord | null = null
  let errorMsg: string | null = null

  try {
    const raw = await getParentWelfare('')
    household = raw as unknown as HouseholdRecord
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'No linked family welfare record'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Family Welfare & Support Status</h1>
        <p className="text-muted-foreground">View your registered family household profile and assistance eligibility.</p>
      </div>

      {errorMsg ? (
        <Card className="border-muted bg-muted/20">
          <CardContent className="pt-6 text-center py-8">
            <HeartHandshake className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">{errorMsg}</p>
          </CardContent>
        </Card>
      ) : household && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Family Household Profile ({household.householdCode})</CardTitle>
                <CardDescription>Verified socio-economic support classification.</CardDescription>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 capitalize">
                {household.eligibilityStatus.replace('_', ' ')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg border bg-card">
                <span className="text-xs text-muted-foreground block">Registered Address</span>
                <span className="font-semibold">{household.address}</span>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <span className="text-xs text-muted-foreground block">Household Members</span>
                <span className="font-semibold">{household.householdSize} Persons</span>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <span className="text-xs text-muted-foreground block">Income Category</span>
                <span className="font-semibold capitalize">{household.incomeCategory.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <span className="text-xs text-muted-foreground block">Housing Condition</span>
                <span className="font-semibold capitalize">{household.housingStatus}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Verification Confirmed</span>
                Your family household profile has been processed for school welfare programs and ration assistance.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
