import type { HomeworkRepository } from '../infrastructure/supabase-homework.repository.js'
import type { CreateHomeworkInput, Homework, UpdateHomeworkInput } from '../domain/homework.js'

export class HomeworkService {
  constructor(private readonly repo: HomeworkRepository) {}

  async createHomework(actorProfileId: string, input: CreateHomeworkInput): Promise<Homework> {
    return this.repo.createHomework(actorProfileId, input)
  }

  async getHomeworkById(id: string): Promise<Homework | null> {
    return this.repo.getHomeworkById(id)
  }

  async listHomework(filters: { teacherAssignmentId?: string; status?: string }): Promise<Homework[]> {
    return this.repo.listHomework(filters)
  }

  async updateHomework(id: string, patch: UpdateHomeworkInput): Promise<Homework> {
    return this.repo.updateHomework(id, patch)
  }

  async deleteHomework(id: string): Promise<boolean> {
    return this.repo.deleteHomework(id)
  }
}
