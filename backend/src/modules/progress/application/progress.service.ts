import type { ProgressRepository } from '../infrastructure/supabase-progress.repository.js'
import type { CreateProgressCategoryInput, CreateStudentProgressInput, ProgressCategory, StudentProgress } from '../domain/progress.js'

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async listCategories(schoolId?: string): Promise<ProgressCategory[]> {
    return this.repo.listCategories(schoolId)
  }

  async createCategory(input: CreateProgressCategoryInput): Promise<ProgressCategory> {
    return this.repo.createCategory(input)
  }

  async recordProgress(teacherId: string, input: CreateStudentProgressInput): Promise<StudentProgress> {
    return this.repo.recordProgress(teacherId, input)
  }

  async getStudentProgress(studentId: string, visibilityStatus?: string): Promise<StudentProgress[]> {
    return this.repo.getStudentProgress(studentId, visibilityStatus)
  }

  async publishProgress(id: string): Promise<StudentProgress> {
    return this.repo.publishProgress(id)
  }

  async getClassProgressSummary(classId: string): Promise<Array<{ studentId: string; totalRecords: number; publishedRecords: number }>> {
    return this.repo.getClassProgressSummary(classId)
  }
}
