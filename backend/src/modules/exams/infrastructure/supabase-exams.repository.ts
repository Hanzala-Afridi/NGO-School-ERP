import type { SupabaseClient } from '@supabase/supabase-js'
import type { BulkEnterMarksDto, CreateExamComponentDto, CreateExamDto, Exam, ExamComponent, ReportCardDto, StudentResult } from '../domain/exams.js'

export interface ExamsRepository {
  listExams(academicYearId?: string, termId?: string): Promise<Exam[]>
  createExam(createdBy: string, dto: CreateExamDto): Promise<Exam>
  getExamById(id: string): Promise<Exam | null>
  updateExamStatus(id: string, status: Exam['status']): Promise<Exam>
  listExamComponents(examId: string, classId?: string, sectionId?: string): Promise<ExamComponent[]>
  createExamComponent(dto: CreateExamComponentDto): Promise<ExamComponent>
  getExamComponentById(id: string): Promise<ExamComponent | null>
  getComponentResults(componentId: string): Promise<StudentResult[]>
  bulkEnterMarks(actorProfileId: string, dto: BulkEnterMarksDto): Promise<StudentResult[]>
  approveExamResults(actorProfileId: string, examId: string): Promise<Exam>
  publishExamResults(actorProfileId: string, examId: string): Promise<Exam>
  getStudentReportCard(studentId: string, examId: string): Promise<ReportCardDto | null>
  getParentChildResults(studentId: string): Promise<StudentResult[]>
}

export class SupabaseExamsRepository implements ExamsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listExams(academicYearId?: string, termId?: string): Promise<Exam[]> {
    let query = this.supabase.from('exams').select('*').order('created_at', { ascending: false })
    if (academicYearId) query = query.eq('academic_year_id', academicYearId)
    if (termId) query = query.eq('term_id', termId)

    const { data, error } = await query
    if (error || !data) return []
    return data.map((d) => this.mapExam(d))
  }

  async createExam(createdBy: string, dto: CreateExamDto): Promise<Exam> {
    const { data, error } = await this.supabase
      .from('exams')
      .insert({
        academic_year_id: dto.academicYearId,
        term_id: dto.termId,
        name: dto.name,
        start_date: dto.startDate,
        end_date: dto.endDate,
        created_by: createdBy,
        status: 'draft',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create exam failed: ${error?.message}`)
    return this.mapExam(data)
  }

  async getExamById(id: string): Promise<Exam | null> {
    const { data, error } = await this.supabase.from('exams').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return this.mapExam(data)
  }

  async updateExamStatus(id: string, status: Exam['status']): Promise<Exam> {
    const { data, error } = await this.supabase
      .from('exams')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Update exam status failed: ${error?.message}`)
    return this.mapExam(data)
  }

  async listExamComponents(examId: string, classId?: string, sectionId?: string): Promise<ExamComponent[]> {
    let query = this.supabase.from('exam_components').select('*').eq('exam_id', examId)
    if (classId) query = query.eq('class_id', classId)
    if (sectionId) query = query.eq('section_id', sectionId)

    const { data, error } = await query
    if (error || !data) return []
    return data.map((d) => this.mapComponent(d))
  }

  async createExamComponent(dto: CreateExamComponentDto): Promise<ExamComponent> {
    const { data, error } = await this.supabase
      .from('exam_components')
      .insert({
        exam_id: dto.examId,
        class_id: dto.classId,
        section_id: dto.sectionId || null,
        subject_id: dto.subjectId,
        exam_date: dto.examDate,
        maximum_marks: dto.maximumMarks,
        passing_marks: dto.passingMarks,
        assessment_type: dto.assessmentType || 'written',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create exam component failed: ${error?.message}`)
    return this.mapComponent(data)
  }

  async getExamComponentById(id: string): Promise<ExamComponent | null> {
    const { data, error } = await this.supabase.from('exam_components').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return this.mapComponent(data)
  }

  async getComponentResults(componentId: string): Promise<StudentResult[]> {
    const { data, error } = await this.supabase
      .from('student_results')
      .select('*')
      .eq('exam_component_id', componentId)

    if (error || !data) return []
    return data.map((d) => this.mapResult(d))
  }

  async bulkEnterMarks(actorProfileId: string, dto: BulkEnterMarksDto): Promise<StudentResult[]> {
    const { error } = await this.supabase.rpc('rpc_bulk_enter_marks', {
      p_component_id: dto.componentId,
      p_records: dto.results,
      p_actor_id: actorProfileId,
    })

    if (error) {
      throw new Error(`Bulk enter marks failed: ${error.message}`)
    }

    return this.getComponentResults(dto.componentId)
  }

  async approveExamResults(actorProfileId: string, examId: string): Promise<Exam> {
    const { error } = await this.supabase.rpc('rpc_approve_exam_results', {
      p_exam_id: examId,
      p_actor_id: actorProfileId,
    })

    if (error) {
      throw new Error(`Approve exam results failed: ${error.message}`)
    }

    const exam = await this.getExamById(examId)
    if (!exam) throw new Error('Exam not found after approval')
    return exam
  }

  async publishExamResults(actorProfileId: string, examId: string): Promise<Exam> {
    const { error } = await this.supabase.rpc('rpc_publish_exam_results', {
      p_exam_id: examId,
      p_actor_id: actorProfileId,
    })

    if (error) {
      throw new Error(`Publish exam results failed: ${error.message}`)
    }

    const exam = await this.getExamById(examId)
    if (!exam) throw new Error('Exam not found after publication')
    return exam
  }

  async getStudentReportCard(studentId: string, examId: string): Promise<ReportCardDto | null> {
    const [exam, studentRes] = await Promise.all([
      this.getExamById(examId),
      this.supabase.from('students').select('full_name, student_number').eq('id', studentId).single(),
    ])

    if (!exam || !studentRes.data) return null

    const components = await this.listExamComponents(examId)
    if (components.length === 0) return null

    const componentIds = components.map((c) => c.id)
    const { data: results } = await this.supabase
      .from('student_results')
      .select('*, exam_components(maximum_marks, passing_marks, assessment_type, subjects(name, code))')
      .eq('student_id', studentId)
      .in('exam_component_id', componentIds)

    if (!results || results.length === 0) return null

    let totalMax = 0
    let totalObtained = 0
    let hasFail = false

    const subjects = results.map((r: any) => {
      const comp = r.exam_components
      const maxM = Number(comp?.maximum_marks ?? 100)
      const passM = Number(comp?.passing_marks ?? 40)
      const obtM = r.marks_obtained !== null ? Number(r.marks_obtained) : null

      totalMax += maxM
      if (obtM !== null) totalObtained += obtM
      if (r.descriptive_result === 'FAILED' || r.descriptive_result === 'ABSENT') hasFail = true

      return {
        subjectName: comp?.subjects?.name ?? 'Subject',
        subjectCode: comp?.subjects?.code ?? 'SUBJ',
        assessmentType: comp?.assessment_type ?? 'written',
        maximumMarks: maxM,
        passingMarks: passM,
        marksObtained: obtM,
        grade: r.grade ?? 'F',
        descriptiveResult: r.descriptive_result ?? 'PENDING',
        remarks: r.remarks,
      }
    })

    const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
    const overallGrade = overallPct >= 80 ? 'A+' : overallPct >= 70 ? 'A' : overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C' : overallPct >= 40 ? 'D' : 'F'

    return {
      studentId,
      studentName: studentRes.data.full_name,
      studentNumber: studentRes.data.student_number,
      className: 'Primary Grade',
      sectionName: 'A',
      examName: exam.name,
      totalMaximumMarks: totalMax,
      totalObtainedMarks: totalObtained,
      overallPercentage: Math.round(overallPct * 100) / 100,
      overallGrade,
      overallStatus: hasFail ? 'FAILED' : 'PASSED',
      subjects,
    }
  }

  async getParentChildResults(studentId: string): Promise<StudentResult[]> {
    const { data, error } = await this.supabase
      .from('student_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('approval_status', 'published')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((d) => this.mapResult(d))
  }

  private mapExam(d: any): Exam {
    return {
      id: d.id,
      academicYearId: d.academic_year_id,
      termId: d.term_id,
      name: d.name,
      startDate: d.start_date,
      endDate: d.end_date,
      status: d.status,
      createdBy: d.created_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapComponent(d: any): ExamComponent {
    return {
      id: d.id,
      examId: d.exam_id,
      classId: d.class_id,
      sectionId: d.section_id,
      subjectId: d.subject_id,
      examDate: d.exam_date,
      maximumMarks: Number(d.maximum_marks),
      passingMarks: Number(d.passing_marks),
      assessmentType: d.assessment_type,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }

  private mapResult(d: any): StudentResult {
    return {
      id: d.id,
      examComponentId: d.exam_component_id,
      studentId: d.student_id,
      marksObtained: d.marks_obtained !== null ? Number(d.marks_obtained) : null,
      grade: d.grade,
      descriptiveResult: d.descriptive_result,
      remarks: d.remarks,
      enteredBy: d.entered_by,
      approvalStatus: d.approval_status,
      publishedAt: d.published_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }
  }
}
