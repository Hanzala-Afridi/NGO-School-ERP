import { Calendar, CheckCircle2, HeartHandshake } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getParentWelfare } from '@/lib/backend-api'

interface HouseholdRecord {
  id: string
  householdCode: string
  address: string
  eligibilityStatus: string
}

export default async function ParentRationPage() {
  let household: HouseholdRecord | null = null
  let errorMsg: string | null = null

  try {
    const raw = await getParentWelfare('')
    household = raw as unknown as HouseholdRecord
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'No linked family welfare profile found'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Family Ration Collection & Delivery Status</h1>
        <p className="text-muted-foreground">Track monthly food ration package allocation, collection dates, and delivery status.</p>
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
                <CardTitle>Family Ration Status ({household.householdCode})</CardTitle>
                <CardDescription>Monthly food basket allocation record.</CardDescription>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 capitalize">
                {household.eligibilityStatus.replace('_', ' ')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Allocation Approved for Current Cycle</span>
                Your household is registered for ration collection. Please bring your family ID card to the campus distribution desk.
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Monthly Family Ration Basket</span>
                <span className="text-xs font-mono text-primary font-bold">CURRENT CYCLE</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Distribution Start: 1st of Month</span>
                <span>Method: Campus Collection Desk</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
