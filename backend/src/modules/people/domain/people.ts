import type {
  Attachment,
  EmploymentStatus,
  Gender,
  Parent,
  ParentRelationship,
  Student,
  StudentParentLink,
  StudentSiblingLink,
  Teacher,
} from '@ngo-school-erp/contracts'

export interface PeopleRepository {
  // Students
  listStudents(filter?: {
    schoolId?: string
    status?: string
    gender?: Gender
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: Student[]; total: number }>
  findStudentById(id: string): Promise<Student | null>
  findStudentByNumber(studentNumber: string): Promise<Student | null>
  createStudent(input: {
    schoolId: string
    studentNumber?: string
    fullName: string
    dateOfBirth: string
    gender: Gender
    admissionDate?: string
    profileImageUrl?: string | null
    address?: string | null
    emergencyNotes?: string | null
    createdBy?: string | null
  }): Promise<Student>
  updateStudent(
    id: string,
    patch: Partial<{
      studentNumber: string
      fullName: string
      dateOfBirth: string
      gender: Gender
      admissionDate: string
      profileImageUrl: string | null
      address: string | null
      emergencyNotes: string | null
      status: Student['status']
    }>,
  ): Promise<Student>
  archiveStudent(id: string): Promise<Student>

  // Parents
  listParents(filter?: { search?: string; page?: number; limit?: number }): Promise<{ items: Parent[]; total: number }>
  findParentById(id: string): Promise<Parent | null>
  findParentByProfileId(profileId: string): Promise<Parent | null>
  createParent(input: {
    profileId: string
    fullName: string
    phone?: string | null
    email?: string | null
    occupation?: string | null
    address?: string | null
  }): Promise<Parent>
  updateParent(
    id: string,
    patch: Partial<{
      fullName: string
      phone: string | null
      email: string | null
      occupation: string | null
      address: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<Parent>

  // Student-Parent Links
  listStudentParents(studentId: string): Promise<StudentParentLink[]>
  listParentChildren(parentId: string): Promise<StudentParentLink[]>
  linkStudentParent(input: {
    studentId: string
    parentId: string
    relationship: ParentRelationship
    isPrimary?: boolean
    receivesNotifications?: boolean
    portalAccessEnabled?: boolean
  }): Promise<StudentParentLink>
  updateStudentParentLink(
    studentId: string,
    parentId: string,
    patch: Partial<{
      relationship: ParentRelationship
      isPrimary: boolean
      receivesNotifications: boolean
      portalAccessEnabled: boolean
    }>,
  ): Promise<StudentParentLink>

  // Student Siblings
  listStudentSiblings(studentId: string): Promise<StudentSiblingLink[]>
  linkStudentSiblings(studentIdA: string, studentIdB: string): Promise<StudentSiblingLink>

  // Teachers
  listTeachers(filter?: { employmentStatus?: EmploymentStatus; search?: string; page?: number; limit?: number }): Promise<{ items: Teacher[]; total: number }>
  findTeacherById(id: string): Promise<Teacher | null>
  findTeacherByProfileId(profileId: string): Promise<Teacher | null>
  createTeacher(input: {
    profileId: string
    employeeNumber?: string
    qualification?: string | null
    joiningDate?: string
    employmentStatus?: EmploymentStatus
  }): Promise<Teacher>
  updateTeacher(
    id: string,
    patch: Partial<{
      employeeNumber: string
      qualification: string | null
      joiningDate: string
      employmentStatus: EmploymentStatus
    }>,
  ): Promise<Teacher>

  // Attachments / Student Documents
  listAttachments(entityType: string, entityId: string): Promise<Attachment[]>
  findAttachmentById(id: string): Promise<Attachment | null>
  createAttachment(input: {
    entityType: string
    entityId: string
    fileName: string
    storagePath: string
    mimeType: string
    sizeBytes: number
    uploadedBy?: string | null
  }): Promise<Attachment>
  deleteAttachment(id: string): Promise<void>
}
