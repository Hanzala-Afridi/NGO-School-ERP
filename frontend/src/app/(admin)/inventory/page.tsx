import { AlertTriangle, Package, Warehouse } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInventoryItems } from '@/lib/backend-api'

interface ItemRecord {
  id: string
  sku: string
  name: string
  unit: string
  size?: string | null
  minimumStock: number
  active: boolean
  currentStock?: number
}

export default async function AdminInventoryPage() {
  let items: ItemRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getInventoryItems('')
    items = raw as unknown as ItemRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load inventory items'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock & Inventory Management</h1>
        <p className="text-muted-foreground">Track inventory items, multi-location stock balances, and reorder thresholds.</p>
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
            <CardTitle className="text-sm font-medium">Catalog Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory catalog SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Locations</CardTitle>
            <Warehouse className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Active warehouse rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter((i) => (i.currentStock || 0) <= i.minimumStock).length}</div>
            <p className="text-xs text-muted-foreground">Below minimum threshold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items Catalog</CardTitle>
          <CardDescription>Item specifications, stock units, and minimum balance thresholds.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No inventory items registered in catalog.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((i) => (
                <div key={i.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">{i.sku}</span>
                      <h3 className="font-semibold">{i.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unit: {i.unit} {i.size ? `| Size: ${i.size}` : ''} | Min Threshold: {i.minimumStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
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
