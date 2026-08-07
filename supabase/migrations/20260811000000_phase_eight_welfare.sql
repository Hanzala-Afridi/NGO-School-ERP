-- Migration: 20260811000000_phase_eight_welfare.sql
-- Description: Forward-only migration for Phase 8 Household and Welfare Management schema, permissions, indexes, and security.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  household_code text unique not null,
  primary_parent_id uuid references public.parents(id) on delete set null,
  address text not null,
  household_size integer not null default 1 check (household_size > 0),
  income_category text not null check (income_category in ('extremely_low', 'low', 'moderate', 'above_threshold')),
  housing_status text not null check (housing_status in ('owned', 'rented', 'temporary', 'homeless')),
  eligibility_status text not null default 'under_review' check (eligibility_status in ('eligible', 'under_review', 'ineligible', 'suspended')),
  verification_status text not null default 'unverified' check (verification_status in ('verified', 'unverified', 'rejected')),
  last_verified_at timestamptz,
  next_review_at timestamptz,
  restricted_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  date_of_birth date,
  occupation text,
  student_id uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.welfare_assessments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  assessment_date date not null default current_date,
  assessed_by uuid not null references public.profiles(id),
  vulnerability_level text not null check (vulnerability_level in ('low', 'medium', 'high', 'critical')),
  recommendation text not null,
  status text not null default 'pending_approval' check (status in ('draft', 'pending_approval', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.welfare_documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_households_code on public.households(household_code);
create index if not exists idx_households_parent on public.households(primary_parent_id);
create index if not exists idx_household_members_household on public.household_members(household_id);
create index if not exists idx_welfare_assessments_household on public.welfare_assessments(household_id);
create index if not exists idx_welfare_documents_household on public.welfare_documents(household_id);

insert into public.permissions (key, description)
values
  ('welfare.read', 'View household and welfare assessment records'),
  ('welfare.create', 'Create household and welfare assessment records'),
  ('welfare.update', 'Update household welfare profiles'),
  ('welfare.assess', 'Perform vulnerability welfare assessments'),
  ('welfare.approve', 'Approve or reject welfare vulnerability assessments'),
  ('welfare.read_restricted', 'Access restricted socio-economic social worker notes')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;

  for v_key in select unnest(array['welfare.read', 'welfare.create', 'welfare.update', 'welfare.assess', 'welfare.approve', 'welfare.read_restricted'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (v_admin_role_id, v_perm_id)
      on conflict do nothing;
    end if;
  end loop;
end $$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.welfare_assessments enable row level security;
alter table public.welfare_documents enable row level security;

revoke all on public.households from anon, authenticated;
revoke all on public.household_members from anon, authenticated;
revoke all on public.welfare_assessments from anon, authenticated;
revoke all on public.welfare_documents from anon, authenticated;

grant all on public.households to service_role;
grant all on public.household_members to service_role;
grant all on public.welfare_assessments to service_role;
grant all on public.welfare_documents to service_role;
