# Software Requirements Specification

## 1. Authentication

The system shall support secure login, logout, password recovery, session handling, account activation/deactivation, Supabase access-token verification on the Express backend, and audit logging of important security events.

Frontend visibility is not authorization. Every protected backend endpoint must verify role, permission, and record scope.

## 2. Admin Portal

Admin shall be able to:

- Create users and assign roles and permissions
- Register students, parents, siblings, and teachers
- Search existing family records to reduce duplicates
- Create academic years, terms, classes, sections, and subjects
- Assign students to classes and teachers to classes or subjects
- Promote, transfer, withdraw, or archive students
- View and correct attendance through controlled workflows
- Review homework, progress, exams, results, and teacher activity
- Create timetables and announcements
- Manage parent messages and complaints
- Maintain household and welfare eligibility records
- Create ration packages and monthly distribution cycles
- Issue ration through collection or home delivery
- Record uniforms, shoes, books, stationery, and bag distribution
- Manage stock receipt, issue, adjustment, damage, and loss
- Record basic operational expenses and receipt attachments
- Generate daily, monthly, term, and yearly reports
- View audit logs and system settings

## 3. Teacher Portal

Teacher shall be able to:

- View assigned classes, subjects, timetable, and students
- Mark Present, Absent, Late, Leave, or Excused attendance
- Add attendance remarks
- Create homework with due date and attachments
- Record reading, writing, numeracy, participation, behavior, and subject progress
- Enter marks for assigned subjects
- View class and student performance history
- Read announcements
- Message linked parents
- Respond to assigned complaints
- Request correction of locked attendance or marks

Teacher shall not access unrelated classes, confidential household data, ration, inventory, expenses, role management, or unpublished records outside the teacher’s scope.

## 4. Parent Portal

Parent shall be able to:

- View linked children only
- View child profile, class, section, and timetable
- View attendance and homework
- View published progress, teacher remarks, and results
- View announcements
- Send controlled messages to the relevant teacher or Admin
- Submit complaints and track their status
- View approved ration or material-support history where permitted
- Request correction of contact information

Parent shall not modify official academic, attendance, welfare, stock, or distribution records.

## 5. Student and Family Registration

The system shall support a unique student number, profile photo, date of birth, gender, admission date, address, emergency information, documents, enrollment status, class assignment, parent links, and sibling links.

One parent may be linked to multiple children. One student may have multiple parents or guardians. The interface shall search existing people and households before creating new records.

## 6. Attendance

The system shall prevent duplicate attendance for the same student and session. Attendance may be locked after a configured time. Corrections after locking require a request or Admin action and must be audited.

Reports shall support daily, monthly, term, and yearly views, including frequent-absence identification.

## 7. Homework and Progress

Homework shall include class, subject, title, instructions, assigned date, due date, teacher, status, and optional attachment.

Progress shall support numeric, graded, and descriptive assessment. Early-grade indicators shall include reading, writing, numeracy, participation, behavior, and social development. Only published or approved remarks shall appear to parents.

## 8. Examinations and Results

The system shall support exam schedules, subjects, maximum and passing marks, descriptive assessments, marks entry, approval, correction history, result publication, and report cards. Parents can view published results only.

## 9. Communication and Complaints

Messages shall be limited to relevant participants. Complaints shall support category, priority, attachment, assignee, status, response, escalation, resolution, and timestamps. Personal phone numbers should not be exposed by default.

## 10. Welfare and Ration

The system shall support household members, income category, housing status, vulnerability, eligibility, verification, documents, approval, reassessment, and restricted internal notes.

Ration management shall support packages, package items, monthly cycles, household allocation, approval, collection or home delivery, receiver details, acknowledgment, missed distribution, reversal, history, inventory deduction, and duplicate prevention for the same household and cycle.

## 11. Material Distribution and Inventory

The system shall track uniform, shoes, books, notebooks, stationery, bags, sizes, variants, quantities, issue dates, recipients, replacements, approvals, and reversals.

Inventory shall use a stock ledger and support receipt, issue, adjustment, damage, loss, minimum stock, suppliers, costs, current balance, low-stock alerts, and reports. Stock-changing operations must use database transactions.

## 12. Expenses

Version 1 shall provide basic operational expense management: category, date, amount, payee, payment method, description, receipt, linked activity, status, and void workflow. Finalized entries must not be silently deleted.

## 13. Reports

Reports shall cover students, class strength, attendance, progress, results, teacher activity, complaints, welfare eligibility, ration, material distribution, inventory, stock movement, expenses, users, and audit history.

Reports shall support filtering, sorting, pagination, CSV export, and printable views.

## 14. Non-Functional Requirements

- Responsive on mobile, tablet, laptop, and desktop
- TypeScript frontend and backend
- Consistent validation and error responses
- CORS allowlist, secure headers, rate limiting, and HTTPS
- No secrets in source control
- No Supabase service-role key in frontend
- Row-level security for exposed database tables
- Pagination and indexed queries
- Database transactions for bulk attendance, stock, ration, and reversals
- Accessible forms and navigation
- Synthetic data in demos
- Modular, testable, maintainable code
