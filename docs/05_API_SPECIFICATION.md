# REST API Specification

## 1. API Standard

Base path: `/api/v1`

Authentication: `Authorization: Bearer <supabase_access_token>`

Success response:

```json
{ "success": true, "data": {}, "meta": {} }
```

Error response:

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

All endpoints must validate input with Zod, enforce permissions and record scope, use consistent status codes, paginate large results, and log sensitive actions.

## 2. Auth and Users

- `GET /auth/me`
- `GET /auth/permissions`
- `POST /auth/logout`
- `GET /users`
- `POST /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/status`
- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `PUT /roles/:id/permissions`
- `POST /users/:id/roles`

## 3. Students, Parents, and Teachers

- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PATCH /students/:id`
- `POST /students/:id/archive`
- `GET /students/:id/history`
- `GET /students/:id/parents`
- `POST /students/:id/parents`
- `GET /students/:id/siblings`
- `POST /students/:id/siblings`
- `GET /parents`
- `POST /parents`
- `GET /parents/:id`
- `PATCH /parents/:id`
- `GET /parents/me/children`
- `GET /parents/me/children/:studentId/overview`
- `GET /teachers`
- `POST /teachers`
- `GET /teachers/:id`
- `PATCH /teachers/:id`
- `GET /teachers/me/assignments`

## 4. Academic Setup

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
- `GET /teacher-assignments`
- `POST /teacher-assignments`
- `PATCH /teacher-assignments/:id`
- `POST /enrollments`
- `PATCH /enrollments/:id`
- `POST /enrollments/:id/promote`
- `POST /enrollments/:id/transfer`
- `POST /enrollments/:id/withdraw`

## 5. Attendance

- `GET /attendance/sessions`
- `POST /attendance/sessions`
- `GET /attendance/sessions/:id`
- `PUT /attendance/sessions/:id/records`
- `POST /attendance/sessions/:id/lock`
- `POST /attendance/records/:id/correction-request`
- `POST /attendance/corrections/:id/approve`
- `POST /attendance/corrections/:id/reject`
- `GET /students/:id/attendance`
- `GET /reports/attendance`

## 6. Homework and Progress

- `GET /homework`
- `POST /homework`
- `GET /homework/:id`
- `PATCH /homework/:id`
- `DELETE /homework/:id`
- `GET /parents/me/children/:studentId/homework`
- `GET /progress/categories`
- `POST /progress/categories`
- `GET /students/:id/progress`
- `POST /students/:id/progress`
- `PATCH /progress/:id`
- `POST /progress/:id/publish`
- `GET /classes/:id/progress-summary`

## 7. Exams and Timetable

- `GET /exams`
- `POST /exams`
- `PATCH /exams/:id`
- `POST /exams/:id/components`
- `PUT /exam-components/:id/results`
- `POST /exams/:id/approve`
- `POST /exams/:id/publish`
- `GET /students/:id/report-card`
- `GET /parents/me/children/:studentId/results`
- `GET /timetable`
- `POST /timetable`
- `PATCH /timetable/:id`
- `DELETE /timetable/:id`

## 8. Announcements, Messaging, and Complaints

- `GET /announcements`
- `POST /announcements`
- `PATCH /announcements/:id`
- `POST /announcements/:id/publish`
- `GET /conversations`
- `POST /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`
- `GET /complaints`
- `POST /complaints`
- `GET /complaints/:id`
- `PATCH /complaints/:id/assign`
- `PATCH /complaints/:id/status`
- `POST /complaints/:id/resolve`

## 9. Welfare and Ration

- `GET /households`
- `POST /households`
- `GET /households/:id`
- `PATCH /households/:id`
- `POST /households/:id/members`
- `POST /households/:id/documents`
- `POST /households/:id/assessments`
- `POST /welfare-assessments/:id/approve`
- `GET /households/:id/support-history`
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

## 10. Inventory, Distribution, and Expenses

- `GET /inventory/items`
- `POST /inventory/items`
- `PATCH /inventory/items/:id`
- `POST /inventory/receipts`
- `POST /inventory/issues`
- `POST /inventory/adjustments`
- `POST /inventory/damage`
- `POST /inventory/loss`
- `GET /inventory/stock`
- `GET /inventory/ledger`
- `GET /inventory/low-stock`
- `GET /student-distributions`
- `POST /student-distributions`
- `GET /students/:id/distributions`
- `POST /student-distributions/:id/approve-replacement`
- `POST /student-distributions/:id/reverse`
- `GET /expenses`
- `POST /expenses`
- `PATCH /expenses/:id`
- `POST /expenses/:id/void`

## 11. Reports and Audit

- `GET /reports/dashboard`
- `GET /reports/students`
- `GET /reports/class-strength`
- `GET /reports/attendance`
- `GET /reports/progress`
- `GET /reports/results`
- `GET /reports/teacher-activity`
- `GET /reports/complaints`
- `GET /reports/welfare`
- `GET /reports/ration`
- `GET /reports/inventory`
- `GET /reports/student-distributions`
- `GET /reports/expenses`
- `GET /reports/audit`
- `GET /audit-logs`
- `GET /audit-logs/:id`

Audit logs must not be editable through normal application APIs.

## 12. Operations

- `GET /health`
- `GET /ready`

Health responses must not expose secrets or internal infrastructure.
