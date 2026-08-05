import type {
  AcademicYear,
  Campus,
  Class,
  School,
  Section,
  Subject,
  Term,
} from '@ngo-school-erp/contracts'

export interface AcademicsRepository {
  // Schools
  listSchools(): Promise<School[]>
  findSchoolById(id: string): Promise<School | null>
  createSchool(input: {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    logoUrl?: string | null
  }): Promise<School>
  updateSchool(
    id: string,
    patch: Partial<{
      name: string
      code: string
      address: string | null
      phone: string | null
      email: string | null
      logoUrl: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<School>

  // Campuses
  listCampuses(filter?: { schoolId?: string }): Promise<Campus[]>
  findCampusById(id: string): Promise<Campus | null>
  createCampus(input: {
    schoolId: string
    name: string
    code: string
    address?: string | null
  }): Promise<Campus>
  updateCampus(
    id: string,
    patch: Partial<{
      name: string
      code: string
      address: string | null
      status: 'active' | 'inactive'
    }>,
  ): Promise<Campus>

  // Academic Years
  listAcademicYears(filter?: { schoolId?: string }): Promise<AcademicYear[]>
  findAcademicYearById(id: string): Promise<AcademicYear | null>
  createAcademicYear(input: {
    schoolId: string
    name: string
    startDate: string
    endDate: string
  }): Promise<AcademicYear>
  updateAcademicYear(
    id: string,
    patch: Partial<{
      name: string
      startDate: string
      endDate: string
      status: 'active' | 'inactive'
    }>,
  ): Promise<AcademicYear>

  // Terms
  listTerms(filter?: { academicYearId?: string }): Promise<Term[]>
  findTermById(id: string): Promise<Term | null>
  createTerm(input: {
    academicYearId: string
    name: string
    startDate: string
    endDate: string
  }): Promise<Term>
  updateTerm(
    id: string,
    patch: Partial<{
      name: string
      startDate: string
      endDate: string
      status: 'active' | 'inactive'
    }>,
  ): Promise<Term>

  // Classes
  listClasses(filter?: { schoolId?: string }): Promise<Class[]>
  findClassById(id: string): Promise<Class | null>
  createClass(input: {
    schoolId: string
    name: string
    code: string
    gradeOrder: number
  }): Promise<Class>
  updateClass(
    id: string,
    patch: Partial<{
      name: string
      code: string
      gradeOrder: number
      status: 'active' | 'inactive'
    }>,
  ): Promise<Class>

  // Sections
  listSections(filter?: { classId?: string }): Promise<Section[]>
  findSectionById(id: string): Promise<Section | null>
  createSection(input: {
    classId: string
    name: string
    capacity?: number | null
  }): Promise<Section>
  updateSection(
    id: string,
    patch: Partial<{ name: string; capacity: number | null; status: 'active' | 'inactive' }>,
  ): Promise<Section>

  // Subjects
  listSubjects(filter?: { schoolId?: string }): Promise<Subject[]>
  findSubjectById(id: string): Promise<Subject | null>
  createSubject(input: { schoolId: string; name: string; code: string }): Promise<Subject>
  updateSubject(
    id: string,
    patch: Partial<{ name: string; code: string; status: 'active' | 'inactive' }>,
  ): Promise<Subject>
}
