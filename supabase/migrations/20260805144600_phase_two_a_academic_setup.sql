-- Phase 2A: Academic Setup Core
-- Creates schools, campuses, academic_years, terms, classes, sections, subjects.
-- Seeds one default school, one default campus, and the six initial classes.
-- Defines 19 Phase 2A permission keys and assigns them all to the Admin role.

-- ─── Tables ─────────────────────────────────────────────────────────────────

create table public.schools (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 200),
  code         text not null unique check (code ~ '^[A-Z0-9_-]{1,20}$'),
  address      text,
  phone        text,
  email        text,
  logo_url     text,
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.campuses (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 200),
  code         text not null check (code ~ '^[A-Z0-9_-]{1,20}$'),
  address      text,
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (school_id, code)
);

create table public.academic_years (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 100),
  start_date   date not null,
  end_date     date not null,
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint academic_years_dates_check check (end_date > start_date),
  unique (school_id, name)
);

create table public.terms (
  id               uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 100),
  start_date       date not null,
  end_date         date not null,
  status           text not null default 'active'
                     check (status in ('active', 'inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint terms_dates_check check (end_date > start_date),
  unique (academic_year_id, name)
);

create table public.classes (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 100),
  code         text not null check (code ~ '^[A-Z0-9_-]{1,20}$'),
  grade_order  integer not null check (grade_order >= 1),
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (school_id, code)
);

create table public.sections (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 100),
  capacity     integer check (capacity is null or capacity >= 1),
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (class_id, name)
);

create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 200),
  code         text not null check (code ~ '^[A-Z0-9_-]{1,20}$'),
  status       text not null default 'active'
                 check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (school_id, code)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index schools_status_idx on public.schools(status);
create index campuses_school_id_idx on public.campuses(school_id);
create index campuses_status_idx on public.campuses(status);
create index academic_years_school_id_idx on public.academic_years(school_id);
create index academic_years_status_idx on public.academic_years(status);
create index terms_academic_year_id_idx on public.terms(academic_year_id);
create index terms_status_idx on public.terms(status);
create index classes_school_id_idx on public.classes(school_id);
create index classes_grade_order_idx on public.classes(school_id, grade_order);
create index sections_class_id_idx on public.sections(class_id);
create index subjects_school_id_idx on public.subjects(school_id);

-- ─── updated_at triggers ─────────────────────────────────────────────────────

create trigger schools_set_updated_at
before update on public.schools
for each row execute function private.set_updated_at();

create trigger campuses_set_updated_at
before update on public.campuses
for each row execute function private.set_updated_at();

create trigger academic_years_set_updated_at
before update on public.academic_years
for each row execute function private.set_updated_at();

create trigger terms_set_updated_at
before update on public.terms
for each row execute function private.set_updated_at();

create trigger classes_set_updated_at
before update on public.classes
for each row execute function private.set_updated_at();

create trigger sections_set_updated_at
before update on public.sections
for each row execute function private.set_updated_at();

create trigger subjects_set_updated_at
before update on public.subjects
for each row execute function private.set_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────────────────────
-- All data access goes through the backend using the service-role client.
-- anon and authenticated roles are revoked from these tables; service_role
-- retains full access (default Supabase grant). No direct authenticated
-- client policies are needed for Phase 2A.

alter table public.schools       enable row level security;
alter table public.campuses      enable row level security;
alter table public.academic_years enable row level security;
alter table public.terms         enable row level security;
alter table public.classes       enable row level security;
alter table public.sections      enable row level security;
alter table public.subjects      enable row level security;

revoke all on public.schools, public.campuses, public.academic_years,
  public.terms, public.classes, public.sections, public.subjects
  from anon, authenticated;

grant all on public.schools, public.campuses, public.academic_years,
  public.terms, public.classes, public.sections, public.subjects
  to service_role;

-- ─── Phase 2A permissions ─────────────────────────────────────────────────────

insert into public.permissions(key, description)
values
  ('schools.read',               'Read school profile'),
  ('schools.update',             'Update school profile'),
  ('campuses.read',              'Read campuses'),
  ('campuses.update',            'Update campuses'),
  ('academic_years.create',      'Create academic years'),
  ('academic_years.read',        'Read academic years'),
  ('academic_years.update',      'Update academic years'),
  ('terms.create',               'Create terms'),
  ('terms.read',                 'Read terms'),
  ('terms.update',               'Update terms'),
  ('classes.create',             'Create classes'),
  ('classes.read',               'Read classes'),
  ('classes.update',             'Update classes'),
  ('sections.create',            'Create sections'),
  ('sections.read',              'Read sections'),
  ('sections.update',            'Update sections'),
  ('subjects.create',            'Create subjects'),
  ('subjects.read',              'Read subjects'),
  ('subjects.update',            'Update subjects')
on conflict (key) do update set description = excluded.description;

-- Assign all 19 Phase 2A permissions to Admin
insert into public.role_permissions(role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.name = 'Admin'
  and permissions.key in (
    'schools.read', 'schools.update',
    'campuses.read', 'campuses.update',
    'academic_years.create', 'academic_years.read', 'academic_years.update',
    'terms.create', 'terms.read', 'terms.update',
    'classes.create', 'classes.read', 'classes.update',
    'sections.create', 'sections.read', 'sections.update',
    'subjects.create', 'subjects.read', 'subjects.update'
  )
on conflict do nothing;

-- ─── Seed data ────────────────────────────────────────────────────────────────
-- Fixed UUIDs ensure idempotency; ON CONFLICT (id) DO NOTHING is safe to re-run.

insert into public.schools(id, name, code, status)
values ('a0000000-0000-4000-8000-000000000001', 'NGO School', 'NGO-001', 'active')
on conflict (id) do nothing;

insert into public.campuses(id, school_id, name, code, status)
values (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'Main Campus', 'MAIN', 'active'
)
on conflict (id) do nothing;

insert into public.classes(id, school_id, name, code, grade_order, status)
values
  ('a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'KG 1',     'KG1', 1, 'active'),
  ('a0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'KG 2',     'KG2', 2, 'active'),
  ('a0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'KG 3',     'KG3', 3, 'active'),
  ('a0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 'Class 1', 'CL1', 4, 'active'),
  ('a0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 'Class 2', 'CL2', 5, 'active'),
  ('a0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000001', 'Class 3', 'CL3', 6, 'active')
on conflict (id) do nothing;
