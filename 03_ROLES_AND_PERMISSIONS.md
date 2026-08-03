# Roles and Permissions — Version 1

## 1. Roles

Version 1 has three main roles:

- Admin
- Teacher
- Parent

The database shall support custom roles and permissions so specialized roles can be added later.

## 2. Admin Permissions

Admin may manage:

- Users, roles, permissions, and account status
- Students, parents, siblings, teachers, and documents
- Academic years, terms, classes, sections, subjects, and timetable
- Enrollments, promotion, transfer, withdrawal, and archival
- Attendance review, correction, and locking
- Homework, progress, exams, results, and publication
- Announcements, messages, complaints, assignment, and resolution
- Households, welfare eligibility, verification, and support history
- Ration packages, cycles, allocation, issue, and reversal
- Uniform, shoes, books, stationery, and bag distribution
- Inventory, suppliers, receipts, issues, adjustments, damage, and loss
- Expenses, receipts, voiding, dashboards, reports, and audit logs

## 3. Teacher Permissions

Teacher may:

- View own profile and timetable
- View assigned classes, subjects, and students
- Mark and review attendance for assigned classes
- Create and manage own homework
- Record progress for assigned students
- Enter marks for assigned subjects
- View class performance
- Read announcements
- Message linked parents
- Respond to relevant complaints
- Request correction of locked records

Teacher may not:

- Access unrelated classes
- Manage users or roles
- View restricted welfare or financial information
- Manage ration, inventory, or expenses
- Publish final results unless explicitly granted
- Delete audit records

## 4. Parent Permissions

Parent may:

- View own profile
- View linked children only
- View attendance, homework, timetable, published progress, and published results
- View announcements
- Send messages and complaints
- Track complaint status
- View approved support history
- Request contact-information updates

Parent may not:

- Access another family or child
- Edit attendance, marks, progress, or distribution records
- View unpublished results or internal welfare notes
- Access inventory, expense, role, or audit modules

## 5. Permission Naming

Use `resource.action`, for example:

- `students.create`
- `students.read`
- `students.update`
- `students.archive`
- `parents.link_student`
- `teachers.assign`
- `attendance.mark`
- `attendance.correct`
- `attendance.lock`
- `homework.create`
- `progress.create`
- `marks.enter`
- `results.approve`
- `results.publish`
- `welfare.approve`
- `ration.plan`
- `ration.issue`
- `ration.reverse`
- `inventory.receive`
- `inventory.issue`
- `inventory.adjust`
- `expenses.create`
- `expenses.void`
- `complaints.resolve`
- `reports.export`
- `audit.read`

## 6. Record Scope

A permission does not automatically grant access to every record.

- Teacher access requires an active class or subject assignment.
- Parent access requires an active parent-child link.
- Version 1 Admin has school-wide access.
- Version 2 shall add campus scope.

## 7. Default Deny

Anything not explicitly allowed is denied.

## 8. Mandatory Audit Actions

Always audit:

- Role or permission change
- Parent-child link change
- Student archival or transfer
- Attendance correction
- Marks correction
- Result publication
- Welfare approval
- Ration issue or reversal
- Stock adjustment
- Material replacement
- Expense void
- Complaint resolution

## 9. Future Roles

The permission engine shall later support Super Admin, Campus Admin, Principal, Management Viewer, Welfare Officer, Inventory Officer, Finance Officer, Data Entry Operator, Auditor, and Student without redesigning the core authorization model.
