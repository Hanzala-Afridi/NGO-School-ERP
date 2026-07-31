# Software Requirements Specification

## 1. Purpose

This document defines the functional and non-functional requirements for the NGO School ERP.

## 2. Functional Requirements

### 2.1 Authentication

The system shall:

- Allow users to sign in securely.
- Support password reset.
- Support session expiration.
- Support role-based authorization.
- Block inactive users.
- Record important authentication events.
- Prevent unauthorized access to protected routes.

### 2.2 User Management

Authorized administrators shall be able to:

- Create users
- Edit users
- Activate or deactivate users
- Assign one or more roles
- Reset access where permitted
- View recent account activity
- Search and filter users

### 2.3 Student Management

The system shall support:

- Student admission and registration
- Unique student ID
- Personal information
- Date of birth
- Gender
- Profile image
- Address
- Emergency contact
- Admission date
- Current class and section
- Enrollment status
- Previous school details
- Medical notes where legally appropriate
- Uploaded documents
- Sibling relationships
- Parent or guardian linking
- Academic history
- Welfare-support history

### 2.4 Parent and Guardian Management

The system shall support:

- Multiple guardians per student
- One guardian linked to multiple children
- Contact details
- Occupation
- Household income information
- Relationship to child
- National identity details where lawfully required
- Address
- Emergency contact
- Preferred communication channel
- Portal access
- Household profile
- Welfare eligibility data

### 2.5 Teacher Management

The system shall support:

- Teacher profile
- Contact information
- Qualifications
- Joining date
- Employment status
- Assigned classes
- Assigned subjects
- Class teacher assignment
- Attendance permissions
- Performance-entry permissions

### 2.6 Academic Structure

The system shall support:

- Academic years
- Terms or semesters
- Classes or grades
- Sections
- Subjects
- Class-subject-teacher assignment
- Student enrollment
- Promotion
- Transfer
- Withdrawal
- Graduation or completion

### 2.7 Attendance

Teachers shall be able to:

- Mark daily attendance
- Mark present, absent, late, leave, or excused
- Add remarks
- Correct attendance within permitted rules
- View attendance history

Administrators shall be able to:

- View all attendance
- Lock attendance after a configured period
- Approve corrections
- Generate attendance reports
- Identify chronic absenteeism

Parents and students shall be able to view permitted attendance records.

### 2.8 Homework and Assignments

Teachers shall be able to:

- Create homework
- Select class, section, and subject
- Add title and instructions
- Add due date
- Upload attachments
- Edit or cancel homework
- View submission status where enabled

Students and parents shall be able to:

- View homework
- Download attachments
- View deadlines
- Mark acknowledgment where enabled
- Submit work where enabled in a later phase

### 2.9 Student Performance

Teachers shall be able to:

- Add academic observations
- Add behavior observations
- Add strengths
- Add improvement areas
- Add monthly or term progress notes
- Rate configured performance indicators
- View previous notes

Administrators shall be able to:

- View performance across classes
- Compare periods
- Filter high-risk or high-performing students
- Export reports

Parents and students shall see only approved remarks.

### 2.10 Examinations and Results

The system shall support:

- Exam types
- Exam schedules
- Subjects
- Maximum marks
- Passing marks
- Marks entry
- Grade calculation
- Result approval
- Report cards
- Position or ranking as an optional configuration
- Remarks
- Result publication
- Result correction workflow

### 2.11 Timetable

The system should support:

- Class timetable
- Teacher timetable
- Subject periods
- Rooms where needed
- Conflict detection
- Printable timetable

### 2.12 Announcements

Authorized users shall be able to:

- Create announcements
- Target roles, classes, or individual users
- Set publish and expiry dates
- Add attachments
- Mark urgent announcements
- Track read status where enabled

### 2.13 Household and Welfare Management

The system shall support:

- Household profile
- Household members
- Income sources
- Employment type
- Residence status
- Eligibility assessment
- Approval status
- Support category
- Verification date
- Reassessment date
- Supporting documents
- Welfare officer notes
- Suspended or closed beneficiary status

### 2.14 Ration Management

The system shall support:

- Ration package definitions
- Package items and quantities
- Distribution cycles
- Eligible household list
- Approval workflow
- Issue date
- Issued-by user
- Received-by person
- Acknowledgment
- Distribution location
- Missed collection
- Home delivery status
- Reason for non-issuance
- Duplicate issuance prevention
- Family support history
- Distribution reports

### 2.15 Uniform, Books, and Bag Distribution

The system shall support:

- Item category
- Item variant, size, class, or gender where relevant
- Stock availability
- Student eligibility
- Issue date
- Quantity
- Condition
- Replacement reason
- Issued-by user
- Received-by person
- Acknowledgment
- Distribution history
- Duplicate or early replacement warning

### 2.16 Inventory

The system shall support:

- Item master
- Categories
- Units
- Suppliers
- Warehouses or stores
- Stock receiving
- Stock issue
- Stock transfer
- Stock adjustment
- Minimum stock level
- Batch or lot where needed
- Expiry date where needed
- Purchase reference
- Cost tracking
- Current balance
- Stock ledger
- Damaged or lost items
- Inventory audit

### 2.17 Reports

The system shall provide filtered reports for:

- Students
- Enrollment
- Attendance
- Homework
- Performance
- Results
- Teachers
- Parents
- Welfare eligibility
- Ration distribution
- Uniform distribution
- Books and bags
- Inventory stock
- Stock movement
- Announcements
- User activity
- Audit logs

Reports should support:

- Date filters
- Class and section filters
- Status filters
- Search
- Sorting
- Pagination
- CSV export
- PDF export in a later phase

### 2.18 Audit Logs

The system shall record critical actions including:

- User creation
- Role changes
- Student updates
- Attendance changes
- Marks changes
- Welfare approval
- Ration issuance
- Inventory adjustment
- Record deletion
- Login-related security events

Audit logs shall include actor, action, target, timestamp, and relevant metadata.

## 3. Non-Functional Requirements

### 3.1 Security

- Enforce RBAC on the backend.
- Validate all incoming requests.
- Do not trust frontend authorization alone.
- Store secrets in environment variables.
- Apply secure headers.
- Use HTTPS in deployed environments.
- Protect sensitive personal data.
- Implement rate limiting where appropriate.
- Maintain audit trails.

### 3.2 Performance

- Use pagination for large datasets.
- Add indexes for common filters and joins.
- Avoid N+1 queries.
- Use caching only when justified.
- Keep typical API responses reasonably fast under expected demo load.

### 3.3 Reliability

- Handle errors consistently.
- Avoid partial updates through database transactions.
- Maintain backups according to hosting capability.
- Provide clear retry or recovery behavior.

### 3.4 Usability

- Responsive on mobile, tablet, and desktop.
- Clear navigation.
- Consistent forms and validation messages.
- Accessible labels and keyboard navigation.
- Simple dashboards for non-technical users.

### 3.5 Maintainability

- TypeScript across frontend and backend.
- Modular code.
- Automated formatting and linting.
- Clear documentation.
- Consistent naming.
- Testable business logic.

### 3.6 Portability

- Use environment variables.
- Avoid provider-specific logic in business services.
- Abstract file storage and authentication dependencies where practical.
- Support Docker in a later setup phase.
