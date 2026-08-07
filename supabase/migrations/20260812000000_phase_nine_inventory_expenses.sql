-- Migration: 20260812000000_phase_nine_inventory_expenses.sql
-- Description: Forward-only migration for Phase 9 Inventory & Expenses, stock ledger, atomic stock transactions, expense voiding, and permissions.

create table if not exists public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.inventory_categories(id) on delete restrict,
  sku text not null unique,
  name text not null,
  unit text not null default 'piece',
  size text,
  class_level text,
  gender_variant text,
  minimum_stock integer not null default 10 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storage_locations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  storage_location_id uuid not null references public.storage_locations(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('receipt', 'issue', 'adjustment', 'damage', 'loss')),
  quantity integer not null check (quantity > 0),
  unit_cost numeric(10,2),
  reference_type text,
  reference_id text,
  performed_by uuid not null references public.profiles(id),
  transaction_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  expense_date date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  payee text not null,
  payment_method text not null,
  description text not null,
  receipt_path text,
  reference_type text,
  reference_id text,
  status text not null default 'active' check (status in ('active', 'voided')),
  created_by uuid not null references public.profiles(id),
  voided_by uuid references public.profiles(id),
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inventory_items_sku on public.inventory_items(sku);
create index if not exists idx_stock_tx_item_loc on public.stock_transactions(item_id, storage_location_id);
create index if not exists idx_expenses_category_date on public.expenses(category_id, expense_date);

insert into public.permissions (key, description)
values
  ('inventory.manage', 'Manage inventory categories, items, and storage locations'),
  ('inventory.transact', 'Perform stock receipts, issues, adjustments, and write-offs'),
  ('expenses.create', 'Create and log financial operational expense records'),
  ('expenses.void', 'Void existing financial operational expense records')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;

  for v_key in select unnest(array['inventory.manage', 'inventory.transact', 'expenses.create', 'expenses.void'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (v_admin_role_id, v_perm_id)
      on conflict do nothing;
    end if;
  end loop;
end $$;

alter table public.inventory_categories enable row level security;
alter table public.inventory_items enable row level security;
alter table public.storage_locations enable row level security;
alter table public.suppliers enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;

revoke all on public.inventory_categories from anon, authenticated;
revoke all on public.inventory_items from anon, authenticated;
revoke all on public.storage_locations from anon, authenticated;
revoke all on public.suppliers from anon, authenticated;
revoke all on public.stock_transactions from anon, authenticated;
revoke all on public.expense_categories from anon, authenticated;
revoke all on public.expenses from anon, authenticated;

grant all on public.inventory_categories to service_role;
grant all on public.inventory_items to service_role;
grant all on public.storage_locations to service_role;
grant all on public.suppliers to service_role;
grant all on public.stock_transactions to service_role;
grant all on public.expense_categories to service_role;
grant all on public.expenses to service_role;

-- ── Atomic PostgreSQL Functions ──────────────────────────────────────────────

create or replace function public.rpc_record_stock_transaction(
  p_item_id uuid,
  p_location_id uuid,
  p_type text,
  p_quantity integer,
  p_unit_cost numeric,
  p_ref_type text,
  p_ref_id text,
  p_actor_id uuid,
  p_notes text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_item record;
  v_location record;
  v_current_balance integer := 0;
  v_tx_id uuid;
begin
  select * into v_item from public.inventory_items where id = p_item_id for update;
  if not found then
    raise exception 'INVENTORY_ITEM_NOT_FOUND: Item % does not exist', p_item_id;
  end if;

  select * into v_location from public.storage_locations where id = p_location_id;
  if not found then
    raise exception 'STORAGE_LOCATION_NOT_FOUND: Storage location % does not exist', p_location_id;
  end if;

  if p_quantity <= 0 then
    raise exception 'INVALID_QUANTITY: Stock quantity must be greater than zero';
  end if;

  select coalesce(sum(case when transaction_type in ('receipt', 'adjustment') then quantity else -quantity end), 0)
  into v_current_balance
  from public.stock_transactions
  where item_id = p_item_id and storage_location_id = p_location_id;

  if p_type in ('issue', 'damage', 'loss') then
    if v_current_balance < p_quantity then
      raise exception 'INSUFFICIENT_STOCK: Required quantity (%) exceeds current available stock balance (%) for item % in location %', p_quantity, v_current_balance, v_item.name, v_location.name;
    end if;
  end if;

  insert into public.stock_transactions (
    item_id,
    storage_location_id,
    transaction_type,
    quantity,
    unit_cost,
    reference_type,
    reference_id,
    performed_by,
    transaction_date,
    notes
  )
  values (
    p_item_id,
    p_location_id,
    p_type,
    p_quantity,
    p_unit_cost,
    p_ref_type,
    p_ref_id,
    p_actor_id,
    now(),
    p_notes
  )
  returning id into v_tx_id;

  return jsonb_build_object(
    'success', true,
    'transactionId', v_tx_id,
    'itemId', p_item_id,
    'newBalance', (case when p_type in ('receipt', 'adjustment') then v_current_balance + p_quantity else v_current_balance - p_quantity end)
  );
end;
$$;

create or replace function public.rpc_void_expense(
  p_expense_id uuid,
  p_actor_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_expense record;
begin
  select * into v_expense from public.expenses where id = p_expense_id for update;
  if not found then
    raise exception 'EXPENSE_NOT_FOUND: Expense record % does not exist', p_expense_id;
  end if;

  if v_expense.status = 'voided' then
    raise exception 'ALREADY_VOIDED: Expense record % has already been voided', p_expense_id;
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'MISSING_VOID_REASON: Non-empty void reason must be provided';
  end if;

  update public.expenses
  set status = 'voided',
      voided_by = p_actor_id,
      voided_at = now(),
      void_reason = trim(p_reason),
      updated_at = now()
  where id = p_expense_id;

  return jsonb_build_object('success', true, 'expenseId', p_expense_id, 'status', 'voided');
end;
$$;

grant execute on function public.rpc_record_stock_transaction(uuid, uuid, text, integer, numeric, text, text, uuid, text) to service_role;
grant execute on function public.rpc_void_expense(uuid, uuid, text) to service_role;
