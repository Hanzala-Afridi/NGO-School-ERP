# NGO School Management ERP — Project Brief

## Product Scope

This project is a responsive, cloud-based management ERP for an NGO-operated free school. The school currently runs KG 1, KG 2, KG 3, Class 1, Class 2, and Class 3, with future expansion to additional grades.

The NGO provides free education and may also provide monthly ration, uniforms, shoes, books, notebooks, stationery, school bags, and other support to eligible students and families.

## Version 1 Portals

### Admin Portal

The Admin is the main operational user and can manage users, roles, students, parents, teachers, classes, attendance, homework, progress, examinations, inventory, ration, material distribution, expenses, messages, complaints, reports, settings, and audit logs.

### Teacher Portal

Teachers can access only assigned classes and students. They can mark attendance, create homework, record progress, enter marks, view class performance, use the timetable, read announcements, and communicate with linked parents.

### Parent Portal

Parents can access only their linked children. They can view attendance, homework, published progress and results, timetable, announcements, approved support history, and can send messages or complaints.

## Out of Scope for Version 1

- Student Portal
- Super Admin Portal
- Full multi-campus operation
- Native mobile apps
- Payroll
- Transport
- Library
- WhatsApp and SMS automation
- Biometric attendance
- Full accounting system

These may be added later. The architecture must remain ready for them.

## Core Modules

- Authentication and role-based authorization
- Student, parent, teacher, class, section, and subject management
- Attendance
- Homework
- Early-grade and subject-wise progress
- Examinations and report cards
- Timetable
- Parent communication and complaints
- Family and welfare profiles
- Monthly ration distribution
- Uniform, shoes, books, stationery, and bag distribution
- Inventory and stock ledger
- Basic operational expenses
- Dashboards and reports
- Audit logs and document storage

## Technology Stack

### Frontend

- Next.js App Router
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
- REST API

### Data and Authentication

- Supabase PostgreSQL
- Supabase Auth

### Demo Deployment

- Frontend: Vercel
- Backend: Render free web service
- Database and Auth: Supabase free plan

The demo environment must use synthetic data only. Production hosting will be selected after NGO approval.

## Architecture Principles

- Responsive web application
- Backend-enforced permissions
- Default-deny security
- Modular and provider-neutral architecture
- Environment variables for configuration
- SQL migrations under version control
- Audit trails for sensitive actions
- Child and family data minimization
- Docker-ready deployment
- Easy future migration to AWS, Azure, Google Cloud, or a VPS

## Success Criteria

Version 1 is successful when Admin can register and assign students, assigned teachers automatically see them, teachers can record attendance and progress, parents can see only their own children, NGO support is tracked without duplicate distribution, reports are available, and critical changes are auditable.
