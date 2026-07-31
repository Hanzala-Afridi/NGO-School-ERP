# API Specification

## 1. API Standards

Base path:

`/api/v1`

Format:

- Request and response body: JSON
- Authentication: Bearer access token
- Dates: ISO 8601
- IDs: UUID
- Pagination: page and limit, or cursor where justified

## 2. Standard Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## 3. Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## 4. Authentication Endpoints

Authentication is primarily handled by Supabase Auth.

Backend endpoints may include:

- `GET /auth/me`
- `POST /auth/logout`
- `GET /auth/permissions`

The backend must verify Supabase-issued access tokens.

## 5. User and Role Endpoints

- `GET /users`
- `POST /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/status`
- `POST /users/:id/roles`
- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `GET /permissions`

## 6. Student Endpoints

- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PATCH /students/:id`
- `POST /students/:id/documents`
- `GET /students/:id/guardians`
- `POST /students/:id/guardians`
- `GET /students/:id/attendance`
- `GET /students/:id/performance`
- `GET /students/:id/results`
- `GET /students/:id/distributions`

## 7. Guardian Endpoints

- `GET /guardians`
- `POST /guardians`
- `GET /guardians/:id`
- `PATCH /guardians/:id`
- `GET /guardians/:id/students`
- `GET /guardians/me/children`

## 8. Teacher Endpoints

- `GET /teachers`
- `POST /teachers`
- `GET /teachers/:id`
- `PATCH /teachers/:id`
- `GET /teachers/me/classes`
- `GET /teachers/me/timetable`

## 9. Academic Endpoints

- `GET /academic-years`
- `POST /academic-years`
- `GET /terms`
- `POST /terms`
- `GET /classes`
- `POST /classes`
- `GET /sections`
- `POST /sections`
- `GET /subjects`
- `POST /subjects`
- `GET /class-subjects`
- `POST /class-subjects`
- `POST /enrollments`
- `PATCH /enrollments/:id`

## 10. Attendance Endpoints

- `GET /attendance/sessions`
- `POST /attendance/sessions`
- `GET /attendance/sessions/:id`
- `PUT /attendance/sessions/:id/records`
- `POST /attendance/records/:id/correction-requests`
- `POST /attendance/correction-requests/:id/approve`
- `POST /attendance/sessions/:id/lock`
- `GET /attendance/reports/summary`

Important rules:

- Only assigned teachers or authorized administrators may mark attendance.
- Duplicate attendance for the same student and session must be prevented.
- Locked attendance cannot be edited without an approved correction.

## 11. Homework Endpoints

- `GET /homework`
- `POST /homework`
- `GET /homework/:id`
- `PATCH /homework/:id`
- `DELETE /homework/:id`
- `GET /students/me/homework`
- `GET /guardians/me/children/:studentId/homework`

## 12. Performance Endpoints

- `GET /performance-notes`
- `POST /performance-notes`
- `PATCH /performance-notes/:id`
- `POST /performance-notes/:id/approve`
- `POST /performance-notes/:id/publish`
- `GET /students/:id/progress-summary`

## 13. Examination Endpoints

- `GET /exams`
- `POST /exams`
- `PATCH /exams/:id`
- `POST /exams/:id/subjects`
- `PUT /exam-subjects/:id/marks`
- `POST /exams/:id/approve`
- `POST /exams/:id/publish`
- `GET /students/:id/report-card`

## 14. Household and Welfare Endpoints

- `GET /households`
- `POST /households`
- `GET /households/:id`
- `PATCH /households/:id`
- `POST /households/:id/members`
- `POST /households/:id/documents`
- `POST /households/:id/assessments`
- `POST /welfare-assessments/:id/recommend`
- `POST /welfare-assessments/:id/approve`
- `POST /households/:id/suspend`

## 15. Ration Endpoints

- `GET /ration/packages`
- `POST /ration/packages`
- `GET /ration/cycles`
- `POST /ration/cycles`
- `POST /ration/cycles/:id/generate-allocations`
- `GET /ration/cycles/:id/allocations`
- `POST /ration/allocations/:id/approve`
- `POST /ration/allocations/:id/issue`
- `POST /ration/distributions/:id/reverse`
- `GET /households/:id/ration-history`
- `GET /ration/reports/distribution`

## 16. Inventory Endpoints

- `GET /inventory/items`
- `POST /inventory/items`
- `GET /inventory/items/:id`
- `PATCH /inventory/items/:id`
- `GET /inventory/warehouses`
- `POST /inventory/receipts`
- `POST /inventory/issues`
- `POST /inventory/transfers`
- `POST /inventory/adjustments`
- `GET /inventory/stock`
- `GET /inventory/ledger`
- `GET /inventory/low-stock`

## 17. Student Material Distribution Endpoints

- `POST /student-distributions`
- `GET /student-distributions`
- `GET /students/:id/material-history`
- `POST /student-distributions/:id/approve-replacement`
- `POST /student-distributions/:id/reverse`

## 18. Announcement Endpoints

- `GET /announcements`
- `POST /announcements`
- `PATCH /announcements/:id`
- `POST /announcements/:id/publish`
- `DELETE /announcements/:id`

## 19. Report Endpoints

- `GET /reports/students`
- `GET /reports/attendance`
- `GET /reports/results`
- `GET /reports/welfare`
- `GET /reports/ration`
- `GET /reports/inventory`
- `GET /reports/distributions`
- `GET /reports/audit`

Report endpoints must enforce role and data scope.

## 20. Audit Endpoints

- `GET /audit-logs`
- `GET /audit-logs/:id`

Audit records must not be editable through normal application APIs.

## 21. Validation

Use Zod schemas for request validation.

Validate:

- Params
- Query
- Body
- File metadata

Return consistent validation errors.

## 22. Security Middleware

The backend should include:

- Authentication middleware
- Permission middleware
- Scope checks
- Request validation
- Rate limiting
- Secure headers
- CORS
- Central error handling
- Request logging
