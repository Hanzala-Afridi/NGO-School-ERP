# Roles and Permissions

## 1. Authorization Model

The system shall use Role-Based Access Control.

Permissions should follow this format:

`resource.action`

Examples:

- `students.read`
- `students.create`
- `students.update`
- `attendance.mark`
- `results.publish`
- `ration.issue`
- `inventory.adjust`

Backend authorization is mandatory for every protected operation.

## 2. Roles

### 2.1 Super Admin

Full system access, including:

- System settings
- All campuses if multi-campus is later enabled
- User and role management
- Permission management
- All academic data
- All welfare data
- All inventory data
- Reports
- Audit logs
- Integrations
- Data export
- System maintenance controls

### 2.2 School Admin

Can manage:

- Students
- Parents
- Teachers
- Classes
- Sections
- Subjects
- Enrollments
- Attendance review
- Homework review
- Exams
- Results
- Announcements
- Reports
- Basic user accounts

Cannot modify protected platform-level configuration unless granted.

### 2.3 Principal or Management

Can:

- View school-wide dashboards
- View attendance
- Review academic performance
- Approve results
- Review teacher activity
- View welfare summaries
- View inventory summaries
- View and export reports
- Publish announcements where granted

### 2.4 Teacher

Can access only assigned academic areas.

Can:

- View assigned classes and students
- Mark attendance
- Create homework
- Enter marks
- Add performance notes
- View assigned timetables
- View relevant announcements
- Correct own entries within allowed time
- Request correction after lock

Cannot:

- View unrelated classes
- View confidential household financial data
- Change user roles
- Adjust inventory
- Approve welfare support
- Publish final results without permission

### 2.5 Parent or Guardian

Can:

- View own profile
- View linked children
- View children’s attendance
- View homework
- View published results
- View approved teacher remarks
- View announcements
- View permitted support-distribution history
- Update limited contact information subject to approval

Cannot access another family or student.

### 2.6 Student

Can:

- View own profile
- View timetable
- View attendance
- View homework
- View published results
- View approved feedback
- View announcements

Cannot modify official academic records.

### 2.7 Welfare Officer

Can:

- Create and update household profiles
- Record eligibility assessments
- Upload verification documents
- Recommend support approval
- Prepare ration distribution lists
- Record delivery or collection
- View support history
- Generate welfare reports

Cannot change academic results unless separately granted.

### 2.8 Inventory Officer

Can:

- Manage inventory items
- Record stock receipts
- Issue stock
- Transfer stock
- Record damaged or lost items
- View stock balances
- Run inventory reports

Sensitive stock adjustments may require approval.

### 2.9 Accountant or Finance Officer

Initial scope may include limited expense or cost records.

Can:

- View approved inventory costs
- Record permitted expenses
- View finance-related reports
- Export reports

This role should not automatically receive student academic permissions.

### 2.10 Data Entry Operator

Can:

- Create draft student, parent, and household records
- Upload documents
- Correct draft information
- Submit records for approval

Cannot approve sensitive records or issue welfare items.

### 2.11 Auditor or Read-Only Reviewer

Can:

- View permitted reports
- View audit logs
- View historical records
- Export approved reports

Cannot create, update, delete, approve, or issue records.

## 3. Permission Groups

### User Administration

- users.read
- users.create
- users.update
- users.deactivate
- users.assign_roles
- roles.read
- roles.manage

### Students

- students.read
- students.create
- students.update
- students.archive
- students.documents.manage
- students.promote
- students.transfer

### Parents and Guardians

- guardians.read
- guardians.create
- guardians.update
- guardians.link_student

### Teachers

- teachers.read
- teachers.create
- teachers.update
- teachers.assign

### Academic Structure

- academics.read
- academics.manage_years
- academics.manage_classes
- academics.manage_sections
- academics.manage_subjects
- academics.assign_teachers

### Attendance

- attendance.read
- attendance.mark
- attendance.update_own
- attendance.correct
- attendance.lock
- attendance.approve_correction

### Homework

- homework.read
- homework.create
- homework.update_own
- homework.delete_own
- homework.manage_all

### Performance

- performance.read
- performance.create
- performance.update_own
- performance.approve
- performance.publish

### Examinations

- exams.read
- exams.manage
- marks.enter
- marks.update_own
- marks.approve
- results.publish

### Welfare

- households.read
- households.create
- households.update
- welfare.assess
- welfare.recommend
- welfare.approve
- welfare.suspend

### Ration

- ration.read
- ration.plan
- ration.approve
- ration.issue
- ration.reverse
- ration.report

### Distribution

- distributions.read
- distributions.issue_uniform
- distributions.issue_books
- distributions.issue_bag
- distributions.replace
- distributions.approve_replacement

### Inventory

- inventory.read
- inventory.receive
- inventory.issue
- inventory.transfer
- inventory.adjust
- inventory.approve_adjustment
- inventory.audit

### Announcements

- announcements.read
- announcements.create
- announcements.publish
- announcements.delete

### Reports and Audits

- reports.read
- reports.export
- audits.read

## 4. Data-Level Access Rules

Permissions alone are not sufficient. The backend must also enforce scope.

Examples:

- A teacher may read only assigned classes and subjects.
- A parent may read only linked children.
- A student may read only their own information.
- A welfare officer may access welfare data but not marks unless granted.
- An inventory officer may access stock but not confidential household income.
- An admin may be limited to a campus in a future multi-campus version.

## 5. Approval Rules

Sensitive actions should support approval:

- Welfare eligibility
- Ration plan approval
- Inventory adjustments
- Replacement uniforms or bags
- Result publication
- Attendance correction after lock
- Record deletion or archival

## 6. Default Deny

If a permission is not explicitly granted, access must be denied.
