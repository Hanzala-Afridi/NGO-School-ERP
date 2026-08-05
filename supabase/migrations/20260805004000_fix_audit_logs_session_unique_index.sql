-- audit_logs_authenticated_session_once_idx was created as a UNIQUE index on
-- (action, session_id) with the intent of preventing duplicate security events.
-- However, auth.session.accepted is written on every authenticated request, so
-- the same (action='auth.session.accepted', session_id) pair appears legitimately
-- on every second and subsequent request within the same session.  The uniqueness
-- constraint causes a database unique-violation on the second authenticated
-- request in any session, surfacing as an unhandled 500 to the caller.
--
-- Fix: drop the unique index and replace it with an equivalent non-unique partial
-- index so queries that filter audit events by session_id retain their performance
-- characteristics without enforcing a cardinality that is incorrect for this data.

drop index if exists public.audit_logs_authenticated_session_once_idx;

create index audit_logs_session_id_idx
  on public.audit_logs(session_id, created_at desc)
  where session_id is not null;
