-- Migration: 20260808000000_phase_six_exams_results.sql
-- Description: Implement Phase 6 Exams, Exam Components, Student Results, RLS, and RBAC permissions.

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid not null references public.terms(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'ongoing', 'grading', 'approved', 'published', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_exam_dates check (end_date >= start_date)
);

create table if not exists public.exam_components (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  exam_date date not null,
  maximum_marks numeric(5,2) not null check (maximum_marks > 0),
  passing_marks numeric(5,2) not null check (passing_marks >= 0 and passing_marks <= maximum_marks),
  assessment_type text not null default 'written' check (assessment_type in ('written', 'oral', 'practical', 'assignment')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique index when section_id IS NOT NULL
create unique index if not exists exam_components_sec_idx 
  on public.exam_components (exam_id, class_id, section_id, subject_id) 
  where section_id is not null;

-- Partial unique index when section_id IS NULL
create unique index if not exists exam_components_nosec_idx 
  on public.exam_components (exam_id, class_id, subject_id) 
  where section_id is null;

create table if not exists public.student_results (
  id uuid primary key default gen_random_uuid(),
  exam_component_id uuid not null references public.exam_components(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks_obtained numeric(5,2) check (marks_obtained >= 0),
  grade text,
  descriptive_result text check (descriptive_result in ('PASSED', 'FAILED', 'ABSENT', 'EXCUSED')),
  remarks text,
  entered_by uuid references public.profiles(id) on delete set null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'submitted', 'approved', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_results_component_student_key unique (exam_component_id, student_id)
);

create trigger set_exams_updated_at
  before update on public.exams
  for each row execute function private.set_updated_at();

create trigger set_exam_components_updated_at
  before update on public.exam_components
  for each row execute function private.set_updated_at();

create trigger set_student_results_updated_at
  before update on public.student_results
  for each row execute function private.set_updated_at();

alter table public.exams enable row level security;
alter table public.exam_components enable row level security;
alter table public.student_results enable row level security;

revoke all on public.exams, public.exam_components, public.student_results from anon, authenticated;
grant all on public.exams, public.exam_components, public.student_results to service_role;

insert into public.permissions(key, description)
values
  ('exams.create', 'Create and schedule examinations'),
  ('exams.manage', 'Manage exam components and settings'),
  ('marks.enter', 'Enter and submit subject examination marks'),
  ('results.approve', 'Review and approve exam results'),
  ('results.publish', 'Publish exam results to parent portal')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_teacher_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;
  select id into v_teacher_role_id from public.roles where name = 'Teacher' and is_system = true limit 1;

  for v_key in select unnest(array['exams.create', 'exams.manage', 'marks.enter', 'results.approve', 'results.publish'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (v_admin_role_id, v_perm_id)
      on conflict do nothing;
    end if;
  end loop;

  select id into v_perm_id from public.permissions where key = 'marks.enter';
  if v_perm_id is not null and v_teacher_role_id is not null then
    insert into public.role_permissions (role_id, permission_id)
    values (v_teacher_role_id, v_perm_id)
    on conflict do nothing;
  end if;
end $$;
