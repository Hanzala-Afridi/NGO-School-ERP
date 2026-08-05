create schema if not exists private;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text not null,
  phone text,
  profile_image_url text,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name ~ '^[A-Za-z][A-Za-z0-9 _-]{1,99}$'),
  description text not null default '',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  outcome text not null check (outcome in ('success', 'failure', 'denied')),
  reason_code text,
  entity_type text,
  entity_id uuid,
  old_values_json jsonb,
  new_values_json jsonb,
  request_id text,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles(status);
create index user_roles_role_id_idx on public.user_roles(role_id);
create index user_roles_assigned_by_idx on public.user_roles(assigned_by);
create index role_permissions_permission_id_idx on public.role_permissions(permission_id);
create index audit_logs_actor_profile_id_created_at_idx
  on public.audit_logs(actor_profile_id, created_at desc);
create index audit_logs_action_created_at_idx
  on public.audit_logs(action, created_at desc);
create unique index audit_logs_authenticated_session_once_idx
  on public.audit_logs(action, session_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger roles_set_updated_at
before update on public.roles
for each row execute function private.set_updated_at();

create or replace function private.protect_system_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_system and (new.name is distinct from old.name or not new.is_system) then
    raise exception 'system role identity cannot be changed';
  end if;
  return new;
end;
$$;

create trigger roles_protect_system_identity
before update on public.roles
for each row execute function private.protect_system_role();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(auth_user_id, full_name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, new.id::text), '@', 1)
    ),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.reject_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and pg_trigger_depth() > 1
    and old.actor_profile_id is not null
    and new.actor_profile_id is null
    and (to_jsonb(new) - 'actor_profile_id') = (to_jsonb(old) - 'actor_profile_id')
  then
    return new;
  end if;

  raise exception 'audit logs are immutable';
end;
$$;

create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row execute function private.reject_audit_mutation();

insert into public.roles(name, description, is_system)
values
  ('Admin', 'School-wide identity and role administration', true),
  ('Teacher', 'Assignment-scoped teaching access', true),
  ('Parent', 'Relationship-scoped parent access', true)
on conflict (name) do update
set description = excluded.description, is_system = true;

insert into public.permissions(key, description)
values
  ('profiles.read_self', 'Read the authenticated user profile'),
  ('users.create', 'Invite an application user'),
  ('users.read', 'Read application users'),
  ('users.update', 'Update application user profiles'),
  ('users.manage_status', 'Activate or deactivate application users'),
  ('users.assign_roles', 'Replace application user role assignments'),
  ('roles.create', 'Create custom roles'),
  ('roles.read', 'Read roles'),
  ('roles.update', 'Update custom roles'),
  ('roles.manage_permissions', 'Replace permissions assigned to custom roles'),
  ('permissions.read', 'Read the permission catalog')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions(role_id, permission_id)
select roles.id, permissions.id
from public.roles
cross join public.permissions
where roles.name = 'Admin'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select roles.id, permissions.id
from public.roles
join public.permissions on permissions.key = 'profiles.read_self'
where roles.name in ('Teacher', 'Parent')
on conflict do nothing;

create or replace function public.replace_user_roles(
  target_user_id uuid,
  replacement_role_ids uuid[],
  actor_user_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  admin_role_id uuid;
  target_has_admin boolean;
  replacement_has_admin boolean;
  admin_count bigint;
begin
  lock table public.user_roles in share row exclusive mode;

  select id into admin_role_id from public.roles where name = 'Admin' and is_system;
  select exists(
    select 1 from public.user_roles
    where user_id = target_user_id and role_id = admin_role_id
  ) into target_has_admin;
  replacement_has_admin := admin_role_id = any(coalesce(replacement_role_ids, array[]::uuid[]));

  if target_has_admin and not replacement_has_admin then
    select count(distinct user_id) into admin_count
    from public.user_roles
    where role_id = admin_role_id;
    if admin_count <= 1 then
      raise exception 'cannot remove the final Admin assignment';
    end if;
  end if;

  if exists (
    select 1 from unnest(coalesce(replacement_role_ids, array[]::uuid[])) role_id
    where not exists (select 1 from public.roles where id = role_id)
  ) then
    raise exception 'one or more roles do not exist';
  end if;

  delete from public.user_roles where user_id = target_user_id;
  insert into public.user_roles(user_id, role_id, assigned_by)
  select target_user_id, role_id, actor_user_id
  from unnest(coalesce(replacement_role_ids, array[]::uuid[])) role_id
  on conflict do nothing;
end;
$$;

create or replace function public.replace_role_permissions(
  target_role_id uuid,
  replacement_permission_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (select 1 from public.roles where id = target_role_id and is_system) then
    raise exception 'system role permissions cannot be changed';
  end if;
  if not exists (select 1 from public.roles where id = target_role_id) then
    raise exception 'role does not exist';
  end if;
  if exists (
    select 1 from unnest(coalesce(replacement_permission_ids, array[]::uuid[])) permission_id
    where not exists (select 1 from public.permissions where id = permission_id)
  ) then
    raise exception 'one or more permissions do not exist';
  end if;

  delete from public.role_permissions where role_id = target_role_id;
  insert into public.role_permissions(role_id, permission_id)
  select target_role_id, permission_id
  from unnest(coalesce(replacement_permission_ids, array[]::uuid[])) permission_id
  on conflict do nothing;
end;
$$;

create or replace function public.is_auth_session_active(
  target_session_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.sessions
    where id = target_session_id
      and user_id = target_user_id
  );
$$;

revoke all on function public.replace_user_roles(uuid, uuid[], uuid) from public, anon, authenticated;
revoke all on function public.replace_role_permissions(uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.is_auth_session_active(uuid, uuid) from public, anon, authenticated;
grant execute on function public.replace_user_roles(uuid, uuid[], uuid) to service_role;
grant execute on function public.replace_role_permissions(uuid, uuid[]) to service_role;
grant execute on function public.is_auth_session_active(uuid, uuid) to service_role;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read_self on public.profiles
for select to authenticated
using ((select auth.uid()) = auth_user_id);

revoke all on public.profiles, public.roles, public.permissions,
  public.user_roles, public.role_permissions, public.audit_logs from anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles, public.roles, public.permissions,
  public.user_roles, public.role_permissions, public.audit_logs to service_role;
