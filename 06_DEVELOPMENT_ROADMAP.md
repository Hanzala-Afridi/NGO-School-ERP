# Development Roadmap

## 1. Delivery Strategy

The project will be built in controlled phases.

Codex must not attempt to build the entire ERP in one task.

Each phase should include:

- Planning
- Implementation
- Validation
- Tests
- Documentation update
- Review
- Commit

## 2. Phase 0 — Project Foundation

Deliverables:

- Monorepo or organized frontend and backend structure
- TypeScript configuration
- Linting and formatting
- Environment example files
- Shared coding conventions
- Basic README
- CI checks
- Error-handling pattern
- Logging pattern
- Database migration strategy

Recommended repository structure:

```text
ngo-school-erp/
  docs/
  frontend/
  backend/
  README.md
  .gitignore
```

## 3. Phase 1 — Authentication and Authorization

Deliverables:

- Supabase Auth integration
- Login
- Logout
- Password reset
- Profile table
- Roles
- Permissions
- Backend token verification
- Route protection
- Default-deny authorization
- Basic audit events

Acceptance criteria:

- Users cannot access unauthorized routes.
- Parent and student accounts cannot access admin APIs.
- Backend authorization works independently of frontend UI.

## 4. Phase 2 — Core User and Academic Setup

Deliverables:

- User management
- Student profiles
- Guardian profiles
- Teacher profiles
- Academic years
- Terms
- Classes
- Sections
- Subjects
- Teacher assignments
- Student enrollments

Acceptance criteria:

- A student can be enrolled in one active class-section for an academic year.
- Guardians can be linked to multiple children.
- Teachers see only assigned classes.

## 5. Phase 3 — Attendance

Deliverables:

- Attendance session creation
- Bulk attendance entry
- Teacher-scoped access
- Attendance history
- Locking
- Correction workflow
- Attendance reports
- Parent and student views

Acceptance criteria:

- Duplicate attendance is prevented.
- Locked records cannot be silently modified.
- Parents see only linked children.

## 6. Phase 4 — Homework and Announcements

Deliverables:

- Homework creation
- Class and subject targeting
- Due dates
- Attachments
- Teacher ownership
- Student and parent views
- Announcements
- Targeted publishing

## 7. Phase 5 — Performance and Examinations

Deliverables:

- Performance notes
- Approval and visibility
- Exams
- Exam subjects
- Marks entry
- Grade rules
- Result approval
- Result publication
- Report card

Acceptance criteria:

- Unpublished results are invisible to students and parents.
- Marks are validated against maximum marks.
- Result changes are audited.

## 8. Phase 6 — Household and Welfare

Deliverables:

- Household profiles
- Household members
- Income and vulnerability data
- Eligibility assessment
- Verification documents
- Recommendation workflow
- Approval workflow
- Review dates
- Welfare history

Acceptance criteria:

- Sensitive welfare data is limited to authorized roles.
- Eligibility decisions are auditable.
- A household cannot receive active duplicate assessments for the same cycle unless allowed.

## 9. Phase 7 — Inventory

Deliverables:

- Item categories
- Inventory items
- Warehouses
- Stock receipt
- Stock issue
- Stock transfer
- Stock adjustment
- Stock ledger
- Low-stock alerts
- Inventory reports

Acceptance criteria:

- Stock cannot become negative unless explicitly permitted.
- Every stock movement creates a ledger entry.
- Sensitive adjustments require permission or approval.

## 10. Phase 8 — Ration and Material Distribution

Deliverables:

- Ration package setup
- Distribution cycles
- Eligible household allocations
- Approval
- Ration issue
- Collection or delivery acknowledgment
- Missed distribution
- Uniform distribution
- Books distribution
- Bag distribution
- Replacement workflow
- Distribution reports

Acceptance criteria:

- Duplicate ration issuance for the same household and cycle is prevented.
- Issuance reduces inventory in a transaction.
- Reversal restores stock and creates an audit trail.
- Student material history is visible to authorized users.

## 11. Phase 9 — Dashboards and Reports

Deliverables:

- Admin dashboard
- Teacher dashboard
- Parent dashboard
- Student dashboard
- Welfare dashboard
- Inventory dashboard
- Filtered reports
- CSV export
- Printable views

## 12. Phase 10 — Hardening

Deliverables:

- Security review
- Permission review
- Input validation review
- Error handling review
- Performance review
- Database index review
- Accessibility review
- Responsive design review
- Audit log review
- Backup and recovery notes

## 13. Phase 11 — Free Demo Deployment

Frontend:

- Vercel

Backend:

- Render

Database and Auth:

- Supabase

Deployment requirements:

- Environment variables
- CORS configuration
- Health endpoint
- Migration command
- Seed command
- Demo users
- Demo data
- No real sensitive beneficiary data

## 14. Phase 12 — Client Review

Process:

- Give the NGO a demo URL.
- Provide test credentials by role.
- Collect feedback.
- Convert feedback into issues.
- Prioritize must-have changes.
- Update requirements before implementation.
- Obtain approval for production scope.

## 15. Phase 13 — Production Planning

Before production, compare:

- AWS
- Microsoft Azure
- Google Cloud
- Managed VPS providers
- Supabase paid plan
- Managed PostgreSQL options

Evaluate:

- Monthly cost
- Data residency
- Backups
- Availability
- Support
- Security
- Scaling
- Maintenance
- Migration effort

## 16. Codex Working Rules

For every development task, Codex must:

1. Read relevant files from `/docs`.
2. Restate the requirement.
3. Identify affected modules.
4. Propose an implementation plan.
5. Identify database changes.
6. Identify API changes.
7. Identify UI changes.
8. Identify security risks.
9. Implement in small steps.
10. Run linting, type checks, and tests.
11. Summarize changed files.
12. Update documentation.
13. Stop if requirements conflict.

## 17. First Codex Task

Use this prompt after connecting the repository:

```text
Read every Markdown file inside the /docs directory. Do not write code yet.

First provide:
1. Your understanding of the product.
2. The primary user roles.
3. The MVP modules.
4. The proposed repository architecture.
5. Major security risks.
6. Missing or conflicting requirements.
7. A phased implementation plan.

Treat /docs as the single source of truth.
```
