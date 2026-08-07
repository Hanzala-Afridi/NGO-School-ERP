export interface Homework {
  id: string
  teacherAssignmentId: string
  title: string
  instructions: string
  assignedDate: string
  dueDate: string
  attachmentPath: string | null
  status: 'draft' | 'published' | 'archived'
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateHomeworkInput {
  teacherAssignmentId: string
  title: string
  instructions: string
  assignedDate: string
  dueDate: string
  attachmentPath?: string | null
  status?: 'draft' | 'published' | 'archived'
}

export interface UpdateHomeworkInput {
  title?: string
  instructions?: string
  assignedDate?: string
  dueDate?: string
  attachmentPath?: string | null
  status?: 'draft' | 'published' | 'archived'
}
