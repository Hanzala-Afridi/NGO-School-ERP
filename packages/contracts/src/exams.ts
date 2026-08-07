export interface Exam {
  id: string
  academicYearId: string
  termId: string
  name: string
  startDate: string
  endDate: string
  status: 'draft' | 'scheduled' | 'ongoing' | 'grading' | 'approved' | 'published' | 'archived'
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface ExamComponent {
  id: string
  examId: string
  classId: string
  sectionId: string | null
  subjectId: string
  examDate: string
  maximumMarks: number
  passingMarks: number
  assessmentType: 'written' | 'oral' | 'practical' | 'assignment'
  createdAt: string
  updatedAt: string
}

export interface StudentResult {
  id: string
  examComponentId: string
  studentId: string
  marksObtained: number | null
  grade: string | null
  descriptiveResult: 'PASSED' | 'FAILED' | 'ABSENT' | 'EXCUSED' | null
  remarks: string | null
  enteredBy: string | null
  approvalStatus: 'pending' | 'submitted' | 'approved' | 'published'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExamDto {
  academicYearId: string
  termId: string
  name: string
  startDate: string
  endDate: string
}

export interface CreateExamComponentDto {
  examId: string
  classId: string
  sectionId?: string | null
  subjectId: string
  examDate: string
  maximumMarks: number
  passingMarks: number
  assessmentType?: 'written' | 'oral' | 'practical' | 'assignment'
}

export interface BulkEnterMarksDto {
  componentId: string
  results: Array<{
    studentId: string
    marksObtained: number | null
    isAbsent?: boolean
    remarks?: string | null
  }>
}

export interface ReportCardSubjectItem {
  subjectName: string
  subjectCode: string
  assessmentType: string
  maximumMarks: number
  passingMarks: number
  marksObtained: number | null
  grade: string | null
  descriptiveResult: string | null
  remarks: string | null
}

export interface ReportCardDto {
  studentId: string
  studentName: string
  studentNumber: string
  className: string
  sectionName: string | null
  examName: string
  totalMaximumMarks: number
  totalObtainedMarks: number
  overallPercentage: number
  overallGrade: string
  overallStatus: 'PASSED' | 'FAILED' | 'INCOMPLETE'
  subjects: ReportCardSubjectItem[]
}
