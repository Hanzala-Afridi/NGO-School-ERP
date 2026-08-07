export interface SuccessResponse<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

export * from './academics.js'
export * from './announcements.js'
export * from './attendance.js'
export * from './auth.js'
export * from './communication.js'
export * from './enrollments.js'
export * from './exams.js'
export * from './homework.js'
export * from './identity.js'
export * from './inventory.js'
export * from './material.js'
export * from './people.js'
export * from './progress.js'
export * from './ration.js'
export * from './rbac.js'
export * from './reports.js'
export * from './system.js'
export * from './welfare.js'
