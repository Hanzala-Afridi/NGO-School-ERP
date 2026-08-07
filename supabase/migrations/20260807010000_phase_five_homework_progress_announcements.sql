-- Migration: 20260807010000_phase_five_homework_progress_announcements.sql
-- Description: Implement Phase 5 Homework, Progress, and Announcements module tables, triggers, RLS, and RBAC permissions.

create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  teacher_assignment_id uuid not null references public.teacher_assignments(id) on delete cascade,
  title text not null,
  instructions text not null,
  assigned_date date not null,
  due_date date not null,
  attachment_path text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid not null references public.terms(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  category_id uuid not null references public.progress_categories(id) on delete cascade,
  rating text not null,
  note text,
  visibility_status text not null default 'draft' check (visibility_status in ('draft', 'published')),
  recorded_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.announcement_targets (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  target_type text not null check (target_type in ('role', 'class', 'all')),
  target_id uuid
);

create trigger set_homework_updated_at
  before update on public.homework
  for each row execute function private.set_updated_at();

alter table public.homework             enable row level security;
alter table public.progress_categories     enable row level security;
alter table public.student_progress        enable row level security;
alter table public.announcements           enable row level security;
alter table public.announcement_targets    enable row level security;

revoke all on public.homework, public.progress_categories, public.student_progress, public.announcements, public.announcement_targets from anon, authenticated;
grant all on public.homework, public.progress_categories, public.student_progress, public.announcements, public.announcement_targets to service_role;

insert into public.progress_categories (school_id, name, description)
select id, 'Reading & Literacy', 'Reading comprehension, vocabulary, and phonetic fluency' from public.schools
union all
select id, 'Writing & Penmanship', 'Handwriting, spelling, sentence structure, and clarity' from public.schools
union all
select id, 'Numeracy & Mathematics', 'Number recognition, basic operations, and problem solving' from public.schools
union all
select id, 'Classroom Behavior', 'Focus, discipline, respect, and emotional regulation' from public.schools
union all
select id, 'Active Participation', 'Engagement in group activities and oral response' from public.schools
on conflict do nothing;

insert into public.permissions(key, description)
values
  ('homework.create',      'Create, edit, and publish homework assignments'),
  ('progress.create',      'Record student progress entries and publish summaries'),
  ('announcements.create', 'Create and edit school announcements'),
  ('announcements.publish','Publish announcements to target audiences')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Admin'
  and p.key in ('homework.create', 'progress.create', 'announcements.create', 'announcements.publish')
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Teacher'
  and p.key in ('homework.create', 'progress.create')
on conflict (role_id, permission_id) do nothing;
