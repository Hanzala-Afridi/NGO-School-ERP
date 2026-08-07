import { IssueStudentMaterialDto, StudentDistribution } from '@ngo-school-erp/contracts'
import { SupabaseMaterialRepository } from '../infrastructure/supabase-material.repository.js'

export class MaterialService {
  constructor(private readonly repository: SupabaseMaterialRepository) {}

  listStudentDistributions(studentId?: string): Promise<StudentDistribution[]> {
    return this.repository.listStudentDistributions(studentId)
  }

  async issueStudentMaterial(actorProfileId: string, dto: IssueStudentMaterialDto): Promise<{ distributionId: string; studentId: string }> {
    if (dto.quantity <= 0) {
      throw new Error('Quantity must be greater than zero')
    }
    return this.repository.issueStudentMaterial(actorProfileId, dto)
  }

  approveReplacement(actorProfileId: string, distributionId: string): Promise<StudentDistribution> {
    return this.repository.approveReplacement(actorProfileId, distributionId)
  }
}
