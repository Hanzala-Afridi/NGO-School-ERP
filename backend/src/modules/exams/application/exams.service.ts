import type { BulkEnterMarksDto, CreateExamComponentDto, CreateExamDto, Exam, ExamComponent, ReportCardDto, StudentResult } from '../domain/exams.js'
import type { ExamsRepository } from '../infrastructure/supabase-exams.repository.js'

export class ExamsService {
  constructor(private readonly examsRepo: ExamsRepository) {}

  async listExams(academicYearId?: string, termId?: string): Promise<Exam[]> {
    return this.examsRepo.listExams(academicYearId, termId)
  }

  async createExam(createdBy: string, dto: CreateExamDto): Promise<Exam> {
    if (!dto.name || !dto.academicYearId || !dto.termId) {
      throw new Error('Exam name, academic year, and term are required')
    }
    return this.examsRepo.createExam(createdBy, dto)
  }

  async getExamById(id: string): Promise<Exam | null> {
    return this.examsRepo.getExamById(id)
  }

  async updateExamStatus(id: string, status: Exam['status']): Promise<Exam> {
    return this.examsRepo.updateExamStatus(id, status)
  }

  async listExamComponents(examId: string, classId?: string, sectionId?: string): Promise<ExamComponent[]> {
    return this.examsRepo.listExamComponents(examId, classId, sectionId)
  }

  async createExamComponent(dto: CreateExamComponentDto): Promise<ExamComponent> {
    if (dto.maximumMarks <= 0) {
      throw new Error('Maximum marks must be greater than zero')
    }
    if (dto.passingMarks < 0 || dto.passingMarks > dto.maximumMarks) {
      throw new Error('Passing marks must be between 0 and maximum marks')
    }
    return this.examsRepo.createExamComponent(dto)
  }

  async getComponentResults(componentId: string): Promise<StudentResult[]> {
    return this.examsRepo.getComponentResults(componentId)
  }

  async bulkEnterMarks(actorProfileId: string, dto: BulkEnterMarksDto): Promise<StudentResult[]> {
    for (const res of dto.results) {
      if (!res.isAbsent && res.marksObtained !== null && res.marksObtained < 0) {
        throw new Error(`Negative marks not allowed for student ${res.studentId}`)
      }
    }
    return this.examsRepo.bulkEnterMarks(actorProfileId, dto)
  }

  async approveExamResults(actorProfileId: string, examId: string): Promise<Exam> {
    return this.examsRepo.approveExamResults(actorProfileId, examId)
  }

  async publishExamResults(actorProfileId: string, examId: string): Promise<Exam> {
    return this.examsRepo.publishExamResults(actorProfileId, examId)
  }

  async getStudentReportCard(studentId: string, examId: string): Promise<ReportCardDto | null> {
    return this.examsRepo.getStudentReportCard(studentId, examId)
  }

  async getParentChildResults(studentId: string): Promise<StudentResult[]> {
    return this.examsRepo.getParentChildResults(studentId)
  }
}
