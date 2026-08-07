export interface DashboardMetrics {
  totalStudents: number
  totalClasses: number
  dailyAttendancePercentage: number
  pendingComplaints: number
  openWelfareAssessments: number
  rationCompletionPercentage: number
  lowStockItemsCount: number
  totalMonthlyExpenses: number
}

export interface StudentReportItem {
  id: string
  fullName: string
  gender: string
  className: string
  sectionName?: string | null
  status: string
}

export interface ClassStrengthReportItem {
  classId: string
  className: string
  sectionCount: number
  enrolledStudents: number
  capacity: number
}

export interface AttendanceReportSummary {
  date: string
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  percentage: number
}

export interface ExpenseReportSummary {
  categoryName: string
  totalAmount: number
  transactionCount: number
}

export interface RationReportSummary {
  cycleName: string
  totalAllocations: number
  issuedAllocations: number
  completionPercentage: number
}
