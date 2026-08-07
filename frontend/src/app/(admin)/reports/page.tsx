import { BarChart3, Download, FileText, PieChart, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardMetrics } from '@/lib/backend-api'

interface DashboardPayload {
  totalStudents: number
  totalClasses: number
  dailyAttendancePercentage: number
  pendingComplaints: number
  openWelfareAssessments: number
  rationCompletionPercentage: number
  lowStockItemsCount: number
  totalMonthlyExpenses: number
}

export default async function AdminReportsPage() {
  let metrics: DashboardPayload | null = null
  let errorMsg: string | null = null

  try {
    const raw = await getDashboardMetrics('')
    metrics = raw as unknown as DashboardPayload
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load executive metrics'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Reports & System Analytics</h1>
          <p className="text-muted-foreground">Multi-dimensional operational reporting, demographic breakdowns, and CSV exports.</p>
        </div>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled active scholars</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.dailyAttendancePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Daily average turnout</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ration Coverage</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.rationCompletionPercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Current cycle distribution</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Outlay</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalMonthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Active operational outlay</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Report Center</CardTitle>
          <CardDescription>Select report models to inspect online or export as CSV data sheets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Student Demographics & Roster</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Enrolled student master list, class sections, and status.</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
            <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Class Strength & Capacity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Academic class enrollment capacity and utilization ratios.</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
            <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Operational Expense Audit</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Categorized financial expenditure logs and voiding history.</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
            <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Welfare & Ration Completion</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Household allocation completion rates and delivery summaries.</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
