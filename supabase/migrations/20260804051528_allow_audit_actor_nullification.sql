-- Permit only the nested ON DELETE SET NULL operation from profiles while
-- preserving immutability for direct audit-log updates and deletes.
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
