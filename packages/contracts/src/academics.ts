export type EntityStatus = 'active' | 'inactive'

export interface School {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Campus {
  id: string
  schoolId: string
  name: string
  code: string
  address: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface AcademicYear {
  id: string
  schoolId: string
  name: string
  startDate: string
  endDate: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Term {
  id: string
  academicYearId: string
  name: string
  startDate: string
  endDate: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  schoolId: string
  name: string
  code: string
  gradeOrder: number
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  classId: string
  name: string
  capacity: number | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: string
  schoolId: string
  name: string
  code: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}
