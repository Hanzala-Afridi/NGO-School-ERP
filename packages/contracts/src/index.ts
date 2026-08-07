export type { ApiError, ApiResponse, ErrorResponse, SuccessResponse } from './api-envelope.js'
export type {
  AcademicYear,
  Campus,
  Class,
  EntityStatus,
  School,
  Section,
  Subject,
  TeacherAssignment,
  Term,
  TimetableEntry,
} from './academics.js'
export type { AuthProfile, AuthSession, CurrentIdentity } from './auth.js'
export type { PaginatedUsers, UserSummary } from './identity.js'
export type { Permission, Role } from './rbac.js'
export type {
  EmploymentStatus,
  Gender,
  Parent,
  ParentRelationship,
  Student,
  StudentParentLink,
  StudentSiblingLink,
  StudentStatus,
  Teacher,
} from './people.js'
export type { Attachment, Enrollment, EnrollmentStatus } from './enrollments.js'
export * from './attendance.js'
export * from './homework.js'
export * from './progress.js'
export * from './announcements.js'
