import { DashboardMetrics } from '@ngo-school-erp/contracts'
import { SupabaseReportsRepository } from '../infrastructure/supabase-reports.repository.js'

export class ReportsService {
  constructor(private readonly repository: SupabaseReportsRepository) {}

  getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.repository.getDashboardMetrics()
  }

  getStudentsReport(): Promise<Array<Record<string, unknown>>> {
    return this.repository.getStudentsReport()
  }

  getClassStrengthReport(): Promise<Array<Record<string, unknown>>> {
    return this.repository.getClassStrengthReport()
  }

  getAttendanceReport(): Promise<Array<Record<string, unknown>>> {
    return this.repository.getAttendanceReport()
  }

  getExpensesReport(): Promise<Array<Record<string, unknown>>> {
    return this.repository.getExpensesReport()
  }

  getRationReport(): Promise<Array<Record<string, unknown>>> {
    return this.repository.getRationReport()
  }

  async exportReportCsv(reportType: string): Promise<string> {
    let rows: Array<Record<string, unknown>> = []
    if (reportType === 'students') {
      rows = await this.repository.getStudentsReport()
    } else if (reportType === 'expenses') {
      rows = await this.repository.getExpensesReport()
    } else {
      rows = await this.repository.getClassStrengthReport()
    }

    const firstRow = rows[0]
    if (!firstRow) return 'id,name,status\n'

    const headers = Object.keys(firstRow)
    const csvRows = rows.map((r) =>
      headers
        .map((h) => {
          let val = String(r[h] ?? '')
          if (['=', '+', '-', '@'].includes(val.charAt(0))) {
            val = `'${val}`
          }
          return `"${val.replace(/"/g, '""')}"`
        })
        .join(','),
    )

    return `${headers.join(',')}\n${csvRows.join('\n')}`
  }
}
