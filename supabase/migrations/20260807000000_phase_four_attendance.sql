-- Migration: 20260807000000_phase_four_attendance.sql
-- Description: Implement Phase 4 Attendance module tables, triggers, indexes, RLS, and RBAC permissions.

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  attendance_date date not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'locked')),
  marked_by uuid references public.profiles(id) on delete set null,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists attendance_sessions_sec_idx
  on public.attendance_sessions (academic_year_id, class_id, section_id, attendance_date)
  where section_id is not null;

create unique index if not exists attendance_sessions_nosec_idx
  on public.attendance_sessions (academic_year_id, class_id, attendance_date)
  where section_id is null;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  attendance_session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_status text not null check (attendance_status in ('present', 'absent', 'late', 'leave', 'excused')),
  remarks text,
  marked_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint attendance_records_session_student_key unique (attendance_session_id, student_id)
);

create table if not exists public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  old_status text not null check (old_status in ('present', 'absent', 'late', 'leave', 'excused')),
  requested_status text not null check (requested_status in ('present', 'absent', 'late', 'leave', 'excused')),
  reason text not null,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create trigger set_attendance_sessions_updated_at
  before update on public.attendance_sessions
  for each row execute function private.set_updated_at();

alter table public.attendance_sessions   enable row level security;
alter table public.attendance_records    enable row level security;
alter table public.attendance_corrections enable row level security;

revoke all on public.attendance_sessions, public.attendance_records, public.attendance_corrections from anon, authenticated;
grant all on public.attendance_sessions, public.attendance_records, public.attendance_corrections to service_role;

insert into public.permissions(key, description)
values
  ('attendance.mark',    'Mark and submit class attendance'),
  ('attendance.correct', 'Request or approve attendance status corrections'),
  ('attendance.lock',    'Lock or unlock attendance sessions')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Admin'
  and p.key in ('attendance.mark', 'attendance.correct', 'attendance.lock')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Teacher'
  and p.key in ('attendance.mark', 'attendance.correct')
on conflict (role_id, permission_id) do nothing;
