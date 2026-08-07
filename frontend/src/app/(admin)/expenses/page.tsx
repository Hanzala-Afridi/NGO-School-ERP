import { Ban, DollarSign, FileText } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getExpenses } from '@/lib/backend-api'

interface ExpenseRecord {
  id: string
  expenseDate: string
  amount: number
  payee: string
  paymentMethod: string
  description: string
  status: string
  voidReason?: string | null
}

export default async function AdminExpensesPage() {
  let expenses: ExpenseRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getExpenses('')
    expenses = raw as unknown as ExpenseRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load expense records'
  }

  const activeTotal = expenses.filter((e) => e.status === 'active').reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operational Expense Accounting</h1>
        <p className="text-muted-foreground">Log expenditures, upload voucher receipts, and manage voiding audits.</p>
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
            <CardTitle className="text-sm font-medium">Total Active Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${activeTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Operational outlay total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expense Entries</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Logged financial vouchers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Voided Records</CardTitle>
            <Ban className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.filter((e) => e.status === 'voided').length}</div>
            <p className="text-xs text-muted-foreground">Cancelled vouchers with audit notes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Register</CardTitle>
          <CardDescription>Financial transaction log and audit status.</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No expense vouchers logged.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((e) => (
                <div key={e.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{e.description}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        e.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payee: {e.payee} | Method: {e.paymentMethod} | Date: {e.expenseDate}
                    </p>
                    {e.voidReason && (
                      <p className="text-xs text-rose-600 mt-1 font-mono">Void Reason: {e.voidReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${e.amount.toFixed(2)}</div>
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
