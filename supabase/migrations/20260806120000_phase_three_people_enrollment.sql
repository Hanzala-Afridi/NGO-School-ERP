-- Phase 3: Students, Parents, Teachers, Links, Enrollments, and Documents
-- Forward-only migration creating Phase 3 domain tables, Phase 2 FK data transition, RLS, and seed permissions.

-- ─── 1. Generic Attachments Table (if not exists) ───────────────────────────

create table if not exists public.attachments (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid not null,
  file_name   text not null,
  storage_path text not null,
  mime_type   text not null,
  size_bytes  bigint not null check (size_bytes > 0),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists attachments_entity_idx on public.attachments(entity_type, entity_id);

-- ─── 2. Students Table ───────────────────────────────────────────────────────

create table public.students (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references public.schools(id) on delete cascade,
  student_number    text not null unique check (student_number ~ '^[A-Z0-9_-]{1,30}$'),
  full_name         text not null check (char_length(full_name) between 1 and 200),
  date_of_birth     date not null,
  gender            text not null check (gender in ('male', 'female', 'other')),
  admission_date    date not null default current_date,
  profile_image_url text,
  address           text,
  emergency_notes   text,
  status            text not null default 'active' check (status in ('active', 'inactive', 'archived', 'transferred', 'withdrawn')),
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index students_school_id_idx on public.students(school_id);
create index students_status_idx on public.students(status);
create index students_full_name_idx on public.students(full_name);
create index students_student_number_idx on public.students(student_number);

-- ─── 3. Parents Table ────────────────────────────────────────────────────────

create table public.parents (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  full_name  text not null check (char_length(full_name) between 1 and 200),
  phone      text,
  email      text,
  occupation text,
  address    text,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parents_profile_id_idx on public.parents(profile_id);
create index parents_full_name_idx on public.parents(full_name);
create index parents_phone_idx on public.parents(phone);

-- ─── 4. Student Parents Junction Table ──────────────────────────────────────

create table public.student_parents (
  student_id             uuid not null references public.students(id) on delete cascade,
  parent_id              uuid not null references public.parents(id) on delete cascade,
  relationship           text not null check (relationship in ('father', 'mother', 'guardian', 'other')),
  is_primary             boolean not null default false,
  receives_notifications boolean not null default true,
  portal_access_enabled  boolean not null default true,
  created_at             timestamptz not null default now(),
  primary key (student_id, parent_id)
);

create index student_parents_parent_id_idx on public.student_parents(parent_id);

-- ─── 5. Student Siblings Junction Table ─────────────────────────────────────

create table public.student_siblings (
  student_id_a uuid not null references public.students(id) on delete cascade,
  student_id_b uuid not null references public.students(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (student_id_a, student_id_b),
  constraint check_sibling_distinct check (student_id_a <> student_id_b)
);

create index student_siblings_student_b_idx on public.student_siblings(student_id_b);

-- ─── 6. Teachers Table ───────────────────────────────────────────────────────

create table public.teachers (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null unique references public.profiles(id) on delete cascade,
  employee_number   text not null unique check (employee_number ~ '^[A-Z0-9_-]{1,30}$'),
  qualification     text,
  joining_date      date not null default current_date,
  employment_status text not null default 'active' check (employment_status in ('active', 'inactive', 'on_leave', 'resigned', 'terminated')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index teachers_profile_id_idx on public.teachers(profile_id);
create index teachers_employee_number_idx on public.teachers(employee_number);

-- ─── 7. Enrollments Table ───────────────────────────────────────────────────

create table public.enrollments (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id         uuid not null references public.classes(id) on delete cascade,
  section_id       uuid references public.sections(id) on delete cascade,
  roll_number      integer check (roll_number >= 1),
  status           text not null default 'active' check (status in ('active', 'promoted', 'transferred', 'withdrawn', 'completed')),
  start_date       date not null default current_date,
  end_date         date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index enrollments_student_id_idx on public.enrollments(student_id);
create index enrollments_academic_year_id_idx on public.enrollments(academic_year_id);
create index enrollments_class_id_idx on public.enrollments(class_id);
create index enrollments_section_id_idx on public.enrollments(section_id);
create index enrollments_status_idx on public.enrollments(status);

-- Partial Unique Index: Prevent multiple active enrollments for same student & academic year
create unique index enrollments_active_student_year_idx 
on public.enrollments(student_id, academic_year_id) 
where (status = 'active');

-- ─── 8. Triggers for updated_at ─────────────────────────────────────────────

create trigger students_set_updated_at
before update on public.students
for each row execute function private.set_updated_at();

create trigger parents_set_updated_at
before update on public.parents
for each row execute function private.set_updated_at();

create trigger teachers_set_updated_at
before update on public.teachers
for each row execute function private.set_updated_at();

create trigger enrollments_set_updated_at
before update on public.enrollments
for each row execute function private.set_updated_at();

-- ─── 9. Data Backfill & Phase 2 FK Transition for Teachers ───────────────────

-- Step A: Auto-create teachers records for all profiles referenced in teacher_assignments/timetable_entries
insert into public.teachers (profile_id, employee_number, joining_date, employment_status)
select distinct
  p.id as profile_id,
  'EMP-' || upper(substring(p.id::text from 1 for 8)) as employee_number,
  current_date as joining_date,
  'active' as employment_status
from public.profiles p
where p.id in (
  select teacher_id from public.teacher_assignments
  union
  select teacher_id from public.timetable_entries where teacher_id is not null
)
on conflict (profile_id) do nothing;

-- Step B: Update teacher_assignments.teacher_id to reference teachers(id)
alter table public.teacher_assignments drop constraint if exists teacher_assignments_teacher_id_fkey;

update public.teacher_assignments ta
set teacher_id = t.id
from public.teachers t
where ta.teacher_id = t.profile_id;

alter table public.teacher_assignments
  add constraint teacher_assignments_teacher_id_fkey
  foreign key (teacher_id) references public.teachers(id) on delete cascade;

-- Step C: Update timetable_entries.teacher_id to reference teachers(id)
alter table public.timetable_entries drop constraint if exists timetable_entries_teacher_id_fkey;

update public.timetable_entries te
set teacher_id = t.id
from public.teachers t
where te.teacher_id = t.profile_id;

alter table public.timetable_entries
  add constraint timetable_entries_teacher_id_fkey
  foreign key (teacher_id) references public.teachers(id) on delete set null;

-- ─── 10. Row-Level Security ──────────────────────────────────────────────────

alter table public.attachments      enable row level security;
alter table public.students         enable row level security;
alter table public.parents          enable row level security;
alter table public.student_parents  enable row level security;
alter table public.student_siblings enable row level security;
alter table public.teachers         enable row level security;
alter table public.enrollments      enable row level security;

revoke all on public.attachments, public.students, public.parents, public.student_parents, public.student_siblings, public.teachers, public.enrollments
  from anon, authenticated;

grant all on public.attachments, public.students, public.parents, public.student_parents, public.student_siblings, public.teachers, public.enrollments
  to service_role;

-- ─── 11. Storage Bucket Setup ────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

-- ─── 12. Seed Phase 3 Permissions ───────────────────────────────────────────

insert into public.permissions(key, description)
values
  ('students.create',      'Create student profiles'),
  ('students.read',        'Read student profiles'),
  ('students.update',      'Update student profiles'),
  ('students.archive',     'Archive student profiles'),
  ('parents.create',       'Create parent profiles'),
  ('parents.read',         'Read parent profiles'),
  ('parents.update',       'Update parent profiles'),
  ('parents.link_student', 'Link parents to students'),
  ('teachers.create',      'Create teacher profiles'),
  ('teachers.read',        'Read teacher profiles'),
  ('teachers.update',      'Update teacher profiles'),
  ('enrollments.create',   'Create student enrollments'),
  ('enrollments.read',     'Read student enrollments'),
  ('enrollments.update',   'Update student enrollments'),
  ('enrollments.promote',  'Promote student enrollments'),
  ('enrollments.transfer', 'Transfer student enrollments'),
  ('enrollments.withdraw', 'Withdraw student enrollments')
on conflict (key) do update set description = excluded.description;

-- Assign all Phase 3 permissions to Admin role
insert into public.role_permissions(role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.name = 'Admin'
  and permissions.key in (
    'students.create',
    'students.read',
    'students.update',
    'students.archive',
    'parents.create',
    'parents.read',
    'parents.update',
    'parents.link_student',
    'teachers.create',
    'teachers.read',
    'teachers.update',
    'enrollments.create',
    'enrollments.read',
    'enrollments.update',
    'enrollments.promote',
    'enrollments.transfer',
    'enrollments.withdraw'
  )
on conflict do nothing;
