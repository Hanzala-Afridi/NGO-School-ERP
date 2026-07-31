# NGO School ERP — Project Brief

## 1. Project Overview

The NGO School ERP is a responsive, cloud-based web application for a non-profit school that provides free education and material support to underprivileged students.

The school may provide:

- Free education
- Monthly ration support to eligible families
- Free uniforms
- Free books and notebooks
- Free school bags
- Other educational or welfare support

The system will centralize academic, administrative, student, parent, teacher, inventory, and NGO-support operations.

## 2. Project Goal

Build a secure, maintainable, scalable, and mobile-responsive School ERP that allows authorized users to manage school operations from any modern web browser.

The initial release will be web-based only. A native Android or iOS application is outside the initial scope.

## 3. Primary Users

- Super Admin
- School Admin
- Principal or Management
- Teacher
- Parent or Guardian
- Student
- NGO Welfare Officer
- Inventory Officer
- Accountant or Finance Officer
- Data Entry Operator
- Auditor or Read-only Reviewer

## 4. Core Portals

### Admin Portal

The Admin Portal will provide complete control over users, roles, students, parents, teachers, classes, attendance, academic performance, homework, examinations, inventory, ration distribution, reports, audit logs, and system configuration.

### Teacher Portal

Teachers will manage assigned classes and subjects, record attendance, assign homework, enter marks, write performance notes, communicate announcements, and review student progress.

### Parent Portal

Parents will view only their own children’s attendance, homework, examination results, teacher remarks, announcements, school calendar, and welfare-support history where permitted.

### Student Portal

Students will view their timetable, homework, attendance, results, teacher feedback, announcements, and personal profile.

## 5. NGO-Specific Capabilities

The system must support:

- Family and household profiles
- Welfare eligibility assessment
- Monthly ration scheduling
- Ration issuance and acknowledgment
- Uniform distribution
- Books and school bag distribution
- Inventory stock tracking
- Support history per student and family
- Beneficiary status
- Donor-funded campaign tracking
- Distribution reports
- Duplicate-support prevention
- Approval workflows
- Evidence or document uploads
- Audit trails

## 6. Technology Direction

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- TanStack Query

### Backend

- Node.js
- Express.js
- TypeScript

### Database and Authentication

- PostgreSQL through Supabase
- Supabase Auth

### Initial Deployment

- Frontend: Vercel
- Backend: Render
- Database and Auth: Supabase

The application must remain portable so it can later move to AWS, Azure, Google Cloud, or another provider with minimal code changes.

## 7. Architecture Principles

- Modular architecture
- Role-based access control
- Clean separation between frontend, backend, and database
- Environment-based configuration
- No hardcoded secrets
- API-first design
- Auditability
- Responsive design
- Accessibility
- Secure data handling
- Cloud portability

## 8. MVP Scope

The first usable version should include:

- Authentication
- User and role management
- Student registration
- Parent or guardian registration
- Teacher registration
- Class and section management
- Subject assignment
- Attendance
- Homework
- Student performance notes
- Examination and marks entry
- Basic parent and student portals
- Ration beneficiary management
- Ration distribution
- Uniform, books, and bag distribution
- Inventory
- Announcements
- Basic reports
- Audit logs

## 9. Future Scope

Possible future features include:

- WhatsApp integration
- SMS integration
- Biometric attendance
- Native mobile apps
- Donor portal
- Online donations
- AI analytics
- AI-generated reports
- Risk prediction
- Online examination
- Bank integration
- Multi-campus support
- Transportation
- Payroll
- Library management
- Learning management system
- Government reporting integrations

## 10. Success Criteria

The project will be considered successful when:

- Each user can access only permitted data and actions.
- School staff can manage core daily operations without spreadsheets.
- Teachers can record attendance and academic work efficiently.
- Parents can view their own children’s information.
- NGO staff can track welfare support accurately.
- Inventory and distributions are auditable.
- Reports can be generated using filters.
- The system works on desktop, tablet, and mobile browsers.
- The application can later migrate to another cloud provider without major redevelopment.
