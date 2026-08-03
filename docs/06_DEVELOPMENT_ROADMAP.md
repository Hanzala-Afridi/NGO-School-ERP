# Development Roadmap and Codex Execution Guide

## 1. Repository Structure

```text
ngo-school-erp/
├── docs/
│   ├── 01_PROJECT_BRIEF.md
│   ├── 02_SRS_REQUIREMENTS.md
│   ├── 03_ROLES_AND_PERMISSIONS.md
│   ├── 04_DATABASE_ARCHITECTURE.md
│   ├── 05_API_SPECIFICATION.md
│   └── 06_DEVELOPMENT_ROADMAP.md
├── frontend/
├── backend/
├── .github/
├── README.md
├── .gitignore
└── docker-compose.yml
```

## 2. Phase Plan

### Phase 0 — Foundation

Set up Next.js, Express, TypeScript, Tailwind, Shadcn UI, linting, formatting, environment templates, health endpoint, logging, error handling, GitHub Actions, README, and migration strategy.

### Phase 1 — Authentication and RBAC

Implement Supabase Auth, profiles, Admin/Teacher/Parent roles, permissions, backend token verification, protected routes, default-deny authorization, and audit events.

### Phase 2 — Academic Setup

Implement school profile, default campus, academic years, terms, dynamic classes, KG 1 to Class 3 seed data, sections, subjects, teacher assignments, and timetable foundation.

### Phase 3 — Students, Parents, and Teachers

Implement registration, parent-child and sibling links, enrollment, class assignment, search, filters, documents, and profile pages.

### Phase 4 — Attendance

Implement bulk attendance, history, locking, correction workflow, parent view, and daily/monthly reports.

### Phase 5 — Homework, Progress, and Announcements

Implement homework, attachments, early-grade progress indicators, monthly summaries, parent publication, and targeted announcements.

### Phase 6 — Exams, Results, and Timetable

Implement exams, marks, descriptive assessment, approval, publication, report cards, and timetable.

### Phase 7 — Messaging and Complaints

Implement controlled parent-teacher messaging, parent-admin complaints, priority, assignment, escalation, resolution, and read status.

### Phase 8 — Welfare

Implement households, members, eligibility, verification, documents, assessment, approval, review dates, restricted fields, and support history.

### Phase 9 — Inventory and Expenses

Implement inventory categories, items, suppliers, stock receipts, issues, adjustments, damage, loss, stock ledger, low-stock alerts, expenses, and receipts.

### Phase 10 — Ration and Material Distribution

Implement ration packages, monthly cycles, allocation, approval, collection/home delivery, acknowledgment, duplicate prevention, reversal, stock deduction, uniforms, shoes, books, stationery, bags, and replacement workflow.

### Phase 11 — Dashboards and Reports

Implement Admin, Teacher, and Parent dashboards; daily, monthly, term, and yearly reporting; CSV export; and printable views.

### Phase 12 — Security and Quality

Review authorization, privacy, validation, indexes, performance, accessibility, responsive behavior, error states, audit completeness, dependencies, and backup planning.

### Phase 13 — Free Demo Deployment

- Next.js frontend on Vercel
- Express backend on Render
- PostgreSQL and Auth on Supabase
- Synthetic data only
- Environment variables configured in dashboards
- CORS restricted to the frontend domain
- Migrations and seed scripts executed

Render free services can sleep after inactivity, so warm the backend before a live demonstration.

### Phase 14 — NGO Review and Production Planning

Provide role-based demo accounts, collect feedback, convert changes into GitHub issues, approve final scope, then compare AWS, Azure, Google Cloud, managed VPS, Supabase paid plans, and managed PostgreSQL.

## 3. GitHub Upload

1. Open the GitHub repository.
2. Create a `docs` folder if it does not exist.
3. Upload all six Markdown files into `docs`.
4. Commit with:

```text
docs: replace project documentation with Version 1 requirements
```

5. Confirm the files are on the `main` branch.

## 4. Connect Repository to Codex

1. Open Codex.
2. Select the connected GitHub repository.
3. Select the `main` branch.
4. Start with a documentation-reading task.
5. Do not permit code changes until Codex summarizes all six files correctly.
6. Create a separate GitHub issue for each phase or feature.
7. Ask Codex to implement only one issue at a time.
8. Review diffs and tests before merging.

## 5. First Codex Prompt

```text
Read every Markdown file inside the /docs directory in numeric order.

Do not write, edit, or delete code yet.
Treat /docs as the single source of truth.

Provide:
1. Your understanding of the NGO School Management ERP.
2. The Version 1 portals and roles.
3. Features excluded from Version 1.
4. Academic workflows.
5. Welfare, ration, inventory, and expense workflows.
6. Proposed repository architecture.
7. Database migration strategy.
8. Authentication and authorization design.
9. Ten major security and privacy risks.
10. Missing, ambiguous, or conflicting requirements.
11. A phased implementation plan.
12. The recommended first coding task.

Wait for my approval before making repository changes.
```

## 6. Verification Prompt

```text
Confirm that you read all six files.
For each file, state the exact filename, summarize it in five points, list conflicts or missing requirements, and mention its dependencies on other documents.
Do not write code.
```

## 7. First Coding Prompt

```text
Implement Phase 0 only from docs/06_DEVELOPMENT_ROADMAP.md.

Before changing files:
- Show the planned repository structure.
- List every file you will create or modify.
- Explain frontend and backend setup.
- Explain environment-variable handling.
- Explain linting, formatting, type checking, and the health endpoint.

Then implement Phase 0 only.
After implementation, run available checks, summarize changed files, provide local commands, update documentation where needed, and do not begin Phase 1.
```

## 8. Codex Working Rules

For every task, Codex must:

- Read relevant docs first
- Restate the requirement
- Identify changed files
- Identify database, API, UI, permission, and privacy effects
- Implement the smallest complete change
- Add or update tests
- Run linting and type checks
- Summarize the diff
- Stop when the requested task is complete
