import { Calendar, CheckCircle2, HeartHandshake, Package } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRationCycles, getRationPackages } from '@/lib/backend-api'

interface PackageRecord {
  id: string
  name: string
  description?: string | null
  active: boolean
}

interface CycleRecord {
  id: string
  name: string
  periodMonth: number
  periodYear: number
  status: string
}

export default async function AdminRationPage() {
  let packages: PackageRecord[] = []
  let cycles: CycleRecord[] = []
  let errorMsg: string | null = null

  try {
    const [rawPkgs, rawCycles] = await Promise.all([
      getRationPackages(''),
      getRationCycles(''),
    ])
    packages = rawPkgs as unknown as PackageRecord[]
    cycles = rawCycles as unknown as CycleRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load ration management data'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ration Package & Distribution Management</h1>
        <p className="text-muted-foreground">Configure food ration bundles, monthly distribution cycles, and household allocation desks.</p>
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
            <CardTitle className="text-sm font-medium">Ration Bundles</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">Configured ration packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cycles.filter((c) => c.status === 'open' || c.status === 'generated').length}</div>
            <p className="text-xs text-muted-foreground">Monthly distribution windows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ration Desk</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Atomic</div>
            <p className="text-xs text-muted-foreground">PostgreSQL RPC issue & reversal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ration Package Bundles</CardTitle>
            <CardDescription>Inventory items mapped to food ration packages.</CardDescription>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No ration package bundles configured.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.description || 'Standard Family Ration Basket'}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution Cycles</CardTitle>
            <CardDescription>Monthly distribution schedules and allocation status.</CardDescription>
          </CardHeader>
          <CardContent>
            {cycles.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <HeartHandshake className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No active distribution cycles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">Period: {c.periodMonth}/{c.periodYear}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
