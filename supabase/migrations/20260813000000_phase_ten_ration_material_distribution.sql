-- Migration: 20260813000000_phase_ten_ration_material_distribution.sql
-- Description: Forward-only migration for Phase 10 Ration Packages, Cycles, Allocations, Distributions, Student Material Issuance, atomic RPC functions, permissions, and RLS.

create table if not exists public.ration_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ration_package_items (
  id uuid primary key default gen_random_uuid(),
  ration_package_id uuid not null references public.ration_packages(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  constraint ration_package_item_unique unique (ration_package_id, inventory_item_id)
);

create table if not exists public.ration_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null check (period_year >= 2026),
  distribution_start date not null,
  distribution_end date not null,
  status text not null default 'draft' check (status in ('draft', 'generated', 'open', 'completed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ration_cycle_period_unique unique (period_year, period_month)
);

create table if not exists public.ration_allocations (
  id uuid primary key default gen_random_uuid(),
  ration_cycle_id uuid not null references public.ration_cycles(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  ration_package_id uuid not null references public.ration_packages(id) on delete restrict,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'issued', 'rejected')),
  approved_by uuid references public.profiles(id),
  eligibility_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ration_allocation_cycle_household_unique unique (ration_cycle_id, household_id)
);

create table if not exists public.ration_distributions (
  id uuid primary key default gen_random_uuid(),
  ration_allocation_id uuid not null unique references public.ration_allocations(id) on delete cascade,
  distribution_method text not null check (distribution_method in ('collection', 'home_delivery')),
  distribution_date timestamptz not null default now(),
  status text not null default 'issued' check (status in ('issued', 'reversed')),
  issued_by uuid not null references public.profiles(id),
  received_by_name text,
  acknowledgment_path text,
  non_issue_reason text,
  reversal_reason text,
  reversed_by uuid references public.profiles(id),
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_distributions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  distribution_type text not null check (distribution_type in ('uniform', 'shoes', 'textbooks', 'stationery', 'bag')),
  quantity integer not null default 1 check (quantity > 0),
  size_or_variant text,
  issue_date date not null default current_date,
  reason text,
  replacement_of_distribution_id uuid references public.student_distributions(id) on delete set null,
  approval_status text not null default 'issued' check (approval_status in ('pending_approval', 'approved', 'issued', 'rejected')),
  issued_by uuid not null references public.profiles(id),
  received_by_name text,
  acknowledgment_path text,
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ration_allocations_cycle on public.ration_allocations(ration_cycle_id);
create index if not exists idx_ration_allocations_household on public.ration_allocations(household_id);
create index if not exists idx_student_distributions_student on public.student_distributions(student_id);

insert into public.permissions (key, description)
values
  ('ration.manage', 'Manage ration packages and distribution cycles'),
  ('ration.approve', 'Approve household ration allocations'),
  ('ration.issue', 'Issue ration packages to verified recipients'),
  ('ration.reverse', 'Reverse issued ration package distributions'),
  ('material.distribute', 'Distribute uniforms, shoes, books, and materials to students'),
  ('material.approve_replacement', 'Approve replacement material requests'),
  ('material.reverse', 'Reverse student material distributions'),
  ('reports.read', 'View operational and executive system analytics reports'),
  ('reports.export', 'Export system reports to CSV format')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;

  for v_key in select unnest(array['ration.manage', 'ration.approve', 'ration.issue', 'ration.reverse', 'material.distribute', 'material.approve_replacement', 'material.reverse', 'reports.read', 'reports.export'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (v_admin_role_id, v_perm_id)
      on conflict do nothing;
    end if;
  end loop;
end $$;

alter table public.ration_packages enable row level security;
alter table public.ration_package_items enable row level security;
alter table public.ration_cycles enable row level security;
alter table public.ration_allocations enable row level security;
alter table public.ration_distributions enable row level security;
alter table public.student_distributions enable row level security;

revoke all on public.ration_packages from anon, authenticated;
revoke all on public.ration_package_items from anon, authenticated;
revoke all on public.ration_cycles from anon, authenticated;
revoke all on public.ration_allocations from anon, authenticated;
revoke all on public.ration_distributions from anon, authenticated;
revoke all on public.student_distributions from anon, authenticated;

grant all on public.ration_packages to service_role;
grant all on public.ration_package_items to service_role;
grant all on public.ration_cycles to service_role;
grant all on public.ration_allocations to service_role;
grant all on public.ration_distributions to service_role;
grant all on public.student_distributions to service_role;

-- ── Atomic PostgreSQL Stored Functions ───────────────────────────────────────

create or replace function public.rpc_issue_ration_allocation(
  p_allocation_id uuid,
  p_method text,
  p_received_name text,
  p_ack_path text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_alloc record;
  v_cycle record;
  v_pkg_item record;
  v_loc_id uuid;
  v_dist_id uuid;
begin
  select * into v_alloc from public.ration_allocations where id = p_allocation_id for update;
  if not found then
    raise exception 'ALLOCATION_NOT_FOUND: Allocation % does not exist', p_allocation_id;
  end if;

  if v_alloc.approval_status = 'issued' then
    raise exception 'ALREADY_ISSUED: Allocation % has already been issued', p_allocation_id;
  end if;

  select * into v_cycle from public.ration_cycles where id = v_alloc.ration_cycle_id;
  if v_cycle.status in ('completed', 'closed') then
    raise exception 'CYCLE_CLOSED: Cannot issue ration for completed/closed cycle %', v_cycle.name;
  end if;

  select id into v_loc_id from public.storage_locations limit 1;
  if v_loc_id is null then
    raise exception 'NO_STORAGE_LOCATION: No default storage location configured';
  end if;

  for v_pkg_item in
    select rpi.inventory_item_id, rpi.quantity, ii.name as item_name
    from public.ration_package_items rpi
    join public.inventory_items ii on ii.id = rpi.inventory_item_id
    where rpi.ration_package_id = v_alloc.ration_package_id
  loop
    perform public.rpc_record_stock_transaction(
      v_pkg_item.inventory_item_id,
      v_loc_id,
      'issue',
      v_pkg_item.quantity,
      null,
      'ration_allocation',
      p_allocation_id::text,
      p_actor_id,
      'Ration package issuance'
    );
  end loop;

  insert into public.ration_distributions (
    ration_allocation_id,
    distribution_method,
    distribution_date,
    status,
    issued_by,
    received_by_name,
    acknowledgment_path
  )
  values (
    p_allocation_id,
    p_method,
    now(),
    'issued',
    p_actor_id,
    p_received_name,
    p_ack_path
  )
  returning id into v_dist_id;

  update public.ration_allocations
  set approval_status = 'issued',
      updated_at = now()
  where id = p_allocation_id;

  return jsonb_build_object('success', true, 'distributionId', v_dist_id, 'allocationId', p_allocation_id);
end;
$$;

create or replace function public.rpc_reverse_ration_distribution(
  p_distribution_id uuid,
  p_reason text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_dist record;
  v_alloc record;
  v_pkg_item record;
  v_loc_id uuid;
begin
  select * into v_dist from public.ration_distributions where id = p_distribution_id for update;
  if not found then
    raise exception 'DISTRIBUTION_NOT_FOUND: Distribution % does not exist', p_distribution_id;
  end if;

  if v_dist.status = 'reversed' then
    raise exception 'ALREADY_REVERSED: Distribution % has already been reversed', p_distribution_id;
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'MISSING_REASON: Non-empty reversal reason must be provided';
  end if;

  select * into v_alloc from public.ration_allocations where id = v_dist.ration_allocation_id;
  select id into v_loc_id from public.storage_locations limit 1;

  for v_pkg_item in
    select rpi.inventory_item_id, rpi.quantity
    from public.ration_package_items rpi
    where rpi.ration_package_id = v_alloc.ration_package_id
  loop
    perform public.rpc_record_stock_transaction(
      v_pkg_item.inventory_item_id,
      v_loc_id,
      'receipt',
      v_pkg_item.quantity,
      null,
      'ration_reversal',
      p_distribution_id::text,
      p_actor_id,
      concat('Reversal: ', p_reason)
    );
  end loop;

  update public.ration_distributions
  set status = 'reversed',
      reversal_reason = p_reason,
      reversed_by = p_actor_id,
      reversed_at = now(),
      updated_at = now()
  where id = p_distribution_id;

  update public.ration_allocations
  set approval_status = 'approved',
      updated_at = now()
  where id = v_dist.ration_allocation_id;

  return jsonb_build_object('success', true, 'distributionId', p_distribution_id, 'status', 'reversed');
end;
$$;

create or replace function public.rpc_issue_student_material(
  p_student_id uuid,
  p_item_id uuid,
  p_location_id uuid,
  p_type text,
  p_quantity integer,
  p_size_variant text,
  p_reason text,
  p_received_name text,
  p_ack_path text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_dist_id uuid;
begin
  perform public.rpc_record_stock_transaction(
    p_item_id,
    p_location_id,
    'issue',
    p_quantity,
    null,
    'student_material',
    p_student_id::text,
    p_actor_id,
    concat('Student material issue: ', p_type)
  );

  insert into public.student_distributions (
    student_id,
    inventory_item_id,
    distribution_type,
    quantity,
    size_or_variant,
    issue_date,
    reason,
    approval_status,
    issued_by,
    received_by_name,
    acknowledgment_path
  )
  values (
    p_student_id,
    p_item_id,
    p_type,
    p_quantity,
    p_size_variant,
    current_date,
    p_reason,
    'issued',
    p_actor_id,
    p_received_name,
    p_ack_path
  )
  returning id into v_dist_id;

  return jsonb_build_object('success', true, 'distributionId', v_dist_id, 'studentId', p_student_id);
end;
$$;

grant execute on function public.rpc_issue_ration_allocation(uuid, text, text, text, uuid) to service_role;
grant execute on function public.rpc_reverse_ration_distribution(uuid, text, uuid) to service_role;
grant execute on function public.rpc_issue_student_material(uuid, uuid, uuid, text, integer, text, text, text, text, uuid) to service_role;
