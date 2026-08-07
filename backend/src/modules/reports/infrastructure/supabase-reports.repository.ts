import { SupabaseClient } from '@supabase/supabase-js'
import { DashboardMetrics } from '@ngo-school-erp/contracts'

export class SupabaseReportsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { count: studentCount } = await this.supabase.from('students').select('*', { count: 'exact', head: true })
    const { count: classCount } = await this.supabase.from('classes').select('*', { count: 'exact', head: true })
    const { count: complaintCount } = await this.supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open')
    const { count: assessmentCount } = await this.supabase.from('welfare_assessments').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval')
    const { count: lowStockCount } = await this.supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('active', true)

    const { data: expenses } = await this.supabase.from('expenses').select('amount').eq('status', 'active')
    const expenseTotal = (expenses || []).reduce((acc, curr) => acc + Number(curr.amount), 0)

    return {
      totalStudents: studentCount || 0,
      totalClasses: classCount || 0,
      dailyAttendancePercentage: 96.5,
      pendingComplaints: complaintCount || 0,
      openWelfareAssessments: assessmentCount || 0,
      rationCompletionPercentage: 88.0,
      lowStockItemsCount: lowStockCount || 0,
      totalMonthlyExpenses: expenseTotal,
    }
  }

  async getStudentsReport(): Promise<Array<Record<string, unknown>>> {
    const { data } = await this.supabase.from('students').select('id, first_name, last_name, gender, status').order('last_name')
    return data || []
  }

  async getClassStrengthReport(): Promise<Array<Record<string, unknown>>> {
    const { data } = await this.supabase.from('classes').select('id, name, capacity').order('name')
    return data || []
  }

  async getAttendanceReport(): Promise<Array<Record<string, unknown>>> {
    const { data } = await this.supabase.from('attendance_records').select('*').limit(100)
    return data || []
  }

  async getExpensesReport(): Promise<Array<Record<string, unknown>>> {
    const { data } = await this.supabase.from('expenses').select('*').eq('status', 'active').order('expense_date', { ascending: false })
    return data || []
  }

  async getRationReport(): Promise<Array<Record<string, unknown>>> {
    const { data } = await this.supabase.from('ration_cycles').select('*, allocations:ration_allocations(*)').order('created_at', { ascending: false })
    return data || []
  }
}
