-- Phase 2: Teacher Assignments and Timetable Foundation
-- Creates teacher_assignments and timetable_entries tables.
-- Defines Phase 2 permission keys (teachers.assign, timetable.read, timetable.create, timetable.update, timetable.delete) and assigns them to Admin role.

-- ─── Tables ─────────────────────────────────────────────────────────────────

create table public.teacher_assignments (
  id               uuid primary key default gen_random_uuid(),
  teacher_id       uuid not null references public.profiles(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id         uuid not null references public.classes(id) on delete cascade,
  section_id       uuid references public.sections(id) on delete cascade,
  subject_id       uuid references public.subjects(id) on delete cascade,
  is_class_teacher boolean not null default false,
  status           text not null default 'active'
                     check (status in ('active', 'inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.timetable_entries (
  id               uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id         uuid not null references public.classes(id) on delete cascade,
  section_id       uuid references public.sections(id) on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  teacher_id       uuid references public.profiles(id) on delete set null,
  weekday          integer not null check (weekday between 1 and 7),
  start_time       time not null,
  end_time         time not null,
  room             text,
  status           text not null default 'active'
                     check (status in ('active', 'inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint timetable_entries_time_check check (end_time > start_time)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index teacher_assignments_teacher_id_idx on public.teacher_assignments(teacher_id);
create index teacher_assignments_academic_year_id_idx on public.teacher_assignments(academic_year_id);
create index teacher_assignments_class_id_idx on public.teacher_assignments(class_id);
create index teacher_assignments_section_id_idx on public.teacher_assignments(section_id);
create index teacher_assignments_subject_id_idx on public.teacher_assignments(subject_id);
create index teacher_assignments_status_idx on public.teacher_assignments(status);

create index timetable_entries_academic_year_id_idx on public.timetable_entries(academic_year_id);
create index timetable_entries_class_id_idx on public.timetable_entries(class_id);
create index timetable_entries_section_id_idx on public.timetable_entries(section_id);
create index timetable_entries_subject_id_idx on public.timetable_entries(subject_id);
create index timetable_entries_teacher_id_idx on public.timetable_entries(teacher_id);
create index timetable_entries_weekday_idx on public.timetable_entries(weekday);
create index timetable_entries_status_idx on public.timetable_entries(status);

-- ─── updated_at triggers ─────────────────────────────────────────────────────

create trigger teacher_assignments_set_updated_at
before update on public.teacher_assignments
for each row execute function private.set_updated_at();

create trigger timetable_entries_set_updated_at
before update on public.timetable_entries
for each row execute function private.set_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────────────────────

alter table public.teacher_assignments enable row level security;
alter table public.timetable_entries   enable row level security;

revoke all on public.teacher_assignments, public.timetable_entries
  from anon, authenticated;

grant all on public.teacher_assignments, public.timetable_entries
  to service_role;

-- ─── Permissions ─────────────────────────────────────────────────────────────

insert into public.permissions(key, description)
values
  ('teachers.assign',   'Assign teachers to classes, sections, or subjects'),
  ('timetable.read',     'Read timetable entries'),
  ('timetable.create',   'Create timetable entries'),
  ('timetable.update',   'Update timetable entries'),
  ('timetable.delete',   'Delete timetable entries')
on conflict (key) do update set description = excluded.description;

-- Assign permissions to Admin
insert into public.role_permissions(role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.name = 'Admin'
  and permissions.key in (
    'teachers.assign',
    'timetable.read',
    'timetable.create',
    'timetable.update',
    'timetable.delete'
  )
on conflict do nothing;
