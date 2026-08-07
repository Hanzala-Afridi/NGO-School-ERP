export type StudentStatus = 'active' | 'inactive' | 'archived' | 'transferred' | 'withdrawn'
export type Gender = 'male' | 'female' | 'other'
export type ParentRelationship = 'father' | 'mother' | 'guardian' | 'other'
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'resigned' | 'terminated'

export interface Student {
  id: string
  schoolId: string
  studentNumber: string
  fullName: string
  dateOfBirth: string
  gender: Gender
  admissionDate: string
  profileImageUrl: string | null
  address: string | null
  emergencyNotes: string | null
  status: StudentStatus
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Parent {
  id: string
  profileId: string
  fullName: string
  phone: string | null
  email: string | null
  occupation: string | null
  address: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface StudentParentLink {
  studentId: string
  parentId: string
  relationship: ParentRelationship
  isPrimary: boolean
  receivesNotifications: boolean
  portalAccessEnabled: boolean
  createdAt: string
}

export interface StudentSiblingLink {
  studentIdA: string
  studentIdB: string
  createdAt: string
}

export interface Teacher {
  id: string
  profileId: string
  employeeNumber: string
  qualification: string | null
  joiningDate: string
  employmentStatus: EmploymentStatus
  createdAt: string
  updatedAt: string
}
