import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateProgressCategoryInput, CreateStudentProgressInput, ProgressCategory, StudentProgress } from '../domain/progress.js'

export interface ProgressRepository {
  listCategories(schoolId?: string): Promise<ProgressCategory[]>
  createCategory(input: CreateProgressCategoryInput): Promise<ProgressCategory>
  recordProgress(teacherId: string, input: CreateStudentProgressInput): Promise<StudentProgress>
  getStudentProgress(studentId: string, visibilityStatus?: string): Promise<StudentProgress[]>
  getClassProgressSummary(classId: string): Promise<Array<{ studentId: string; totalRecords: number; publishedRecords: number }>>
  publishProgress(id: string): Promise<StudentProgress>
}

export class SupabaseProgressRepository implements ProgressRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listCategories(schoolId?: string): Promise<ProgressCategory[]> {
    let q = this.supabase.from('progress_categories').select('*').eq('active', true)
    if (schoolId) q = q.eq('school_id', schoolId)

    const { data, error } = await q
    if (error || !data) return []
    return data.map((d) => ({
      id: d.id,
      schoolId: d.school_id,
      name: d.name,
      description: d.description,
      active: d.active,
      createdAt: d.created_at,
    }))
  }

  async createCategory(input: CreateProgressCategoryInput): Promise<ProgressCategory> {
    const { data, error } = await this.supabase
      .from('progress_categories')
      .insert({
        school_id: input.schoolId,
        name: input.name,
        description: input.description || null,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create category failed: ${error?.message}`)
    return {
      id: data.id,
      schoolId: data.school_id,
      name: data.name,
      description: data.description,
      active: data.active,
      createdAt: data.created_at,
    }
  }

  async recordProgress(teacherId: string, input: CreateStudentProgressInput): Promise<StudentProgress> {
    const { data, error } = await this.supabase
      .from('student_progress')
      .insert({
        student_id: input.studentId,
        academic_year_id: input.academicYearId,
        term_id: input.termId,
        teacher_id: teacherId || null,
        subject_id: input.subjectId || null,
        category_id: input.categoryId,
        rating: input.rating,
        note: input.note || null,
        visibility_status: input.visibilityStatus || 'draft',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Record progress failed: ${error?.message}`)
    return this.mapProgress(data)
  }

  async getStudentProgress(studentId: string, visibilityStatus?: string): Promise<StudentProgress[]> {
    let q = this.supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('recorded_at', { ascending: false })

    if (visibilityStatus) q = q.eq('visibility_status', visibilityStatus)

    const { data, error } = await q
    if (error || !data) return []
    return data.map((d) => this.mapProgress(d))
  }

  async getClassProgressSummary(classId: string): Promise<Array<{ studentId: string; totalRecords: number; publishedRecords: number }>> {
    const { data: enrollments } = await this.supabase
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'active')

    if (!enrollments || enrollments.length === 0) return []
    const studentIds = enrollments.map((e) => e.student_id)

    const { data: records } = await this.supabase
      .from('student_progress')
      .select('student_id, visibility_status')
      .in('student_id', studentIds)

    const summaryMap = new Map<string, { studentId: string; totalRecords: number; publishedRecords: number }>()
    studentIds.forEach((sid) => summaryMap.set(sid, { studentId: sid, totalRecords: 0, publishedRecords: 0 }))

    if (records) {
      for (const r of records) {
        const item = summaryMap.get(r.student_id)
        if (item) {
          item.totalRecords += 1
          if (r.visibility_status === 'published') item.publishedRecords += 1
        }
      }
    }

    return Array.from(summaryMap.values())
  }

  async publishProgress(id: string): Promise<StudentProgress> {
    const { data, error } = await this.supabase
      .from('student_progress')
      .update({ visibility_status: 'published' })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Publish progress failed: ${error?.message}`)
    return this.mapProgress(data)
  }

  private mapProgress(d: any): StudentProgress {
    return {
      id: d.id,
      studentId: d.student_id,
      academicYearId: d.academic_year_id,
      termId: d.term_id,
      teacherId: d.teacher_id,
      subjectId: d.subject_id,
      categoryId: d.category_id,
      rating: d.rating,
      note: d.note,
      visibilityStatus: d.visibility_status,
      recordedAt: d.recorded_at,
    }
  }
}
