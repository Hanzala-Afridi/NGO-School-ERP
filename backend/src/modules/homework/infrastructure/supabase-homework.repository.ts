import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateHomeworkInput, Homework, UpdateHomeworkInput } from '../domain/homework.js'

export interface HomeworkRepository {
  createHomework(actorProfileId: string, input: CreateHomeworkInput): Promise<Homework>
  getHomeworkById(id: string): Promise<Homework | null>
  listHomework(filters: { teacherAssignmentId?: string; status?: string }): Promise<Homework[]>
  updateHomework(id: string, patch: UpdateHomeworkInput): Promise<Homework>
  deleteHomework(id: string): Promise<boolean>
}

export class SupabaseHomeworkRepository implements HomeworkRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createHomework(actorProfileId: string, input: CreateHomeworkInput): Promise<Homework> {
    const { data, error } = await this.supabase
      .from('homework')
      .insert({
        teacher_assignment_id: input.teacherAssignmentId,
        title: input.title,
        instructions: input.instructions,
        assigned_date: input.assignedDate,
        due_date: input.dueDate,
        attachment_path: input.attachmentPath || null,
        status: input.status || 'published',
        created_by: actorProfileId,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create homework failed: ${error?.message}`)
    return this.mapHomework(data)
  }

  async getHomeworkById(id: string): Promise<Homework | null> {
    const { data, error } = await this.supabase
      .from('homework')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return this.mapHomework(data)
  }

  async listHomework(filters: { teacherAssignmentId?: string; status?: string }): Promise<Homework[]> {
    let q = this.supabase.from('homework').select('*').order('due_date', { ascending: true })
    if (filters.teacherAssignmentId) q = q.eq('teacher_assignment_id', filters.teacherAssignmentId)
    if (filters.status) q = q.eq('status', filters.status)

    const { data, error } = await q
    if (error || !data) return []
    return data.map((d) => this.mapHomework(d))
  }

  async updateHomework(id: string, patch: UpdateHomeworkInput): Promise<Homework> {
    const payload: any = {}
    if (patch.title !== undefined) payload.title = patch.title
    if (patch.instructions !== undefined) payload.instructions = patch.instructions
    if (patch.assignedDate !== undefined) payload.assigned_date = patch.assignedDate
    if (patch.dueDate !== undefined) payload.due_date = patch.dueDate
    if (patch.attachmentPath !== undefined) payload.attachment_path = patch.attachmentPath
    if (patch.status !== undefined) payload.status = patch.status

    const { data, error } = await this.supabase
      .from('homework')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Update homework failed: ${error?.message}`)
    return this.mapHomework(data)
  }

  async deleteHomework(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('homework').delete().eq('id', id)
    return !error
  }

  private mapHomework(d: any): Homework {
    return {
      id: d.id,
      teacherAssignmentId: d.teacher_assignment_id,
      title: d.title,
      instructions: d.instructions,
      assignedDate: d.assigned_date,
      dueDate: d.due_date,
      attachmentPath: d.attachment_path,
      status: d.status,
      createdBy: d.created_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
