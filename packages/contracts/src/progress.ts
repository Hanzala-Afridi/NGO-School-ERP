export interface ProgressCategory {
  id: string
  schoolId: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
}

export interface StudentProgress {
  id: string
  studentId: string
  academicYearId: string
  termId: string
  teacherId: string | null
  subjectId: string | null
  categoryId: string
  rating: string
  note: string | null
  visibilityStatus: 'draft' | 'published'
  recordedAt: string
}

export interface CreateStudentProgressInput {
  studentId: string
  academicYearId: string
  termId: string
  subjectId?: string | null
  categoryId: string
  rating: string
  note?: string | null
  visibilityStatus?: 'draft' | 'published'
}

export interface CreateProgressCategoryInput {
  schoolId: string
  name: string
  description?: string | null
}
