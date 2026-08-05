begin;
select plan(21);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'roles', 'roles exists');
select has_table('public', 'permissions', 'permissions exists');
select has_table('public', 'user_roles', 'user_roles exists');
select has_table('public', 'role_permissions', 'role_permissions exists');
select has_table('public', 'audit_logs', 'audit_logs exists');
select is((select count(*)::integer from public.roles where is_system), 3, 'three system roles');
select is((select count(*)::integer from public.permissions), 11, 'Phase One permission catalog');
select is(
  (select count(*)::integer from public.role_permissions rp join public.roles r on r.id = rp.role_id where r.name = 'Admin'),
  11,
  'Admin receives all Phase One permissions'
);
select policies_are('public', 'profiles', array['profiles_read_self'], 'profiles has self-only RLS');
select is((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), true, 'profiles RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.roles'::regclass), true, 'roles RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.permissions'::regclass), true, 'permissions RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass), true, 'user_roles RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.role_permissions'::regclass), true, 'role_permissions RLS enabled');
select is((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), true, 'audit_logs RLS enabled');
select has_function(
  'public',
  'is_auth_session_active',
  array['uuid', 'uuid'],
  'active-session validator exists'
);
select function_privs_are(
  'public',
  'is_auth_session_active',
  array['uuid', 'uuid'],
  'service_role',
  array['EXECUTE'],
  'only service role can validate Auth sessions'
);
select function_privs_are(
  'public',
  'replace_user_roles',
  array['uuid', 'uuid[]', 'uuid'],
  'service_role',
  array['EXECUTE'],
  'only service role can execute role replacement'
);
insert into public.audit_logs(action, outcome) values ('test.audit', 'success');
select throws_ok(
  $$update public.audit_logs set action = 'changed'$$,
  'audit logs are immutable',
  'audit rows cannot be updated'
);
select throws_ok(
  $$delete from public.audit_logs$$,
  'audit logs are immutable',
  'audit rows cannot be deleted'
);

select * from finish();
rollback;
