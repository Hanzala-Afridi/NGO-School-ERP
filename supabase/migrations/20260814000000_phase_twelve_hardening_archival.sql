-- Migration: 20260814000000_phase_twelve_hardening_archival.sql
-- Description: Forward-only migration for Phase 12 Academic Year Archival, Audit Index Optimization, Atomic Archival RPC, Permissions, and RLS.

create table if not exists public.academic_year_archives (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null unique references public.academic_years(id) on delete restrict,
  archive_name text not null,
  notes text,
  archived_at timestamptz not null default now(),
  archived_by uuid not null references public.profiles(id),
  summary_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_entity on public.audit_logs(created_at desc, entity_type);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_profile_id);

insert into public.permissions (key, description)
values
  ('audit.read', 'View system security audit logs'),
  ('audit.export', 'Export system security audit logs'),
  ('system.diagnostics', 'View system health, database latency, and performance diagnostics'),
  ('archival.manage', 'Archive and freeze completed historical academic years')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;

  for v_key in select unnest(array['audit.read', 'audit.export', 'system.diagnostics', 'archival.manage'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id)
      values (v_admin_role_id, v_perm_id)
      on conflict do nothing;
    end if;
  end loop;
end $$;

alter table public.academic_year_archives enable row level security;
revoke all on public.academic_year_archives from anon, authenticated;
grant all on public.academic_year_archives to service_role;

-- ── Atomic PostgreSQL Stored Function: rpc_archive_academic_year ─────────────

create or replace function public.rpc_archive_academic_year(
  p_academic_year_id uuid,
  p_notes text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_year record;
  v_archive_id uuid;
  v_terms_count integer;
  v_classes_count integer;
  v_students_count integer;
begin
  select * into v_year from public.academic_years where id = p_academic_year_id for update;
  if not found then
    raise exception 'YEAR_NOT_FOUND: Academic year % does not exist', p_academic_year_id;
  end if;

  if v_year.is_current = true then
    raise exception 'CANNOT_ARCHIVE_ACTIVE_YEAR: Current active academic year % cannot be archived', v_year.name;
  end if;

  if v_year.status <> 'closed' and v_year.status <> 'completed' then
    raise exception 'YEAR_NOT_CLOSED: Academic year % must be closed/completed before archiving', v_year.name;
  end if;

  if exists (select 1 from public.academic_year_archives where academic_year_id = p_academic_year_id) then
    raise exception 'ALREADY_ARCHIVED: Academic year % has already been archived', v_year.name;
  end if;

  select count(*) into v_terms_count from public.terms where academic_year_id = p_academic_year_id;
  select count(*) into v_classes_count from public.classes where academic_year_id = p_academic_year_id;

  insert into public.academic_year_archives (
    academic_year_id,
    archive_name,
    notes,
    archived_at,
    archived_by,
    summary_json
  )
  values (
    p_academic_year_id,
    concat('Archive of ', v_year.name),
    p_notes,
    now(),
    p_actor_id,
    jsonb_build_object(
      'academicYearName', v_year.name,
      'startDate', v_year.start_date,
      'endDate', v_year.end_date,
      'termsCount', v_terms_count,
      'classesCount', v_classes_count,
      'archivedTimestamp', now()
    )
  )
  returning id into v_archive_id;

  update public.academic_years
  set status = 'archived',
      updated_at = now()
  where id = p_academic_year_id;

  return jsonb_build_object('success', true, 'archiveId', v_archive_id, 'academicYearId', p_academic_year_id);
end;
$$;

grant execute on function public.rpc_archive_academic_year(uuid, text, uuid) to service_role;
