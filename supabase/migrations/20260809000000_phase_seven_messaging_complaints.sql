-- Migration: 20260809000000_phase_seven_messaging_complaints.sql
-- Description: Implement Phase 7 Conversations, Messages, Read Receipts, Complaints, Timeline Updates, RLS, and RBAC permissions.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  conversation_type text not null default 'parent_teacher' check (conversation_type in ('parent_teacher', 'parent_admin')),
  student_id uuid not null references public.students(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists active_conversations_key 
  on public.conversations (conversation_type, student_id, created_by) 
  where status = 'active';

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  attachment_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_read_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  assigned_teacher_id uuid references public.teachers(id) on delete set null,
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  category text not null,
  subject text not null,
  description text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  actor_profile_id uuid not null references public.profiles(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function private.set_updated_at();

create trigger set_complaints_updated_at
  before update on public.complaints
  for each row execute function private.set_updated_at();

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_read_receipts enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;

revoke all on public.conversations, public.conversation_participants, public.messages, public.message_read_receipts, public.complaints, public.complaint_updates from anon, authenticated;
grant all on public.conversations, public.conversation_participants, public.messages, public.message_read_receipts, public.complaints, public.complaint_updates to service_role;

insert into public.permissions(key, description)
values
  ('messages.send', 'Send messages in authorized conversations'),
  ('complaints.submit', 'Submit parent complaints'),
  ('complaints.resolve', 'Assign and resolve parent complaints')
on conflict (key) do nothing;

do $$
declare
  v_admin_role_id uuid;
  v_teacher_role_id uuid;
  v_parent_role_id uuid;
  v_perm_id uuid;
  v_key text;
begin
  select id into v_admin_role_id from public.roles where name = 'Admin' and is_system = true limit 1;
  select id into v_teacher_role_id from public.roles where name = 'Teacher' and is_system = true limit 1;
  select id into v_parent_role_id from public.roles where name = 'Parent' and is_system = true limit 1;

  for v_key in select unnest(array['messages.send', 'complaints.resolve'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_admin_role_id is not null then
      insert into public.role_permissions (role_id, permission_id) values (v_admin_role_id, v_perm_id) on conflict do nothing;
    end if;
  end loop;

  for v_key in select unnest(array['messages.send', 'complaints.resolve'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_teacher_role_id is not null then
      insert into public.role_permissions (role_id, permission_id) values (v_teacher_role_id, v_perm_id) on conflict do nothing;
    end if;
  end loop;

  for v_key in select unnest(array['messages.send', 'complaints.submit'])
  loop
    select id into v_perm_id from public.permissions where key = v_key;
    if v_perm_id is not null and v_parent_role_id is not null then
      insert into public.role_permissions (role_id, permission_id) values (v_parent_role_id, v_perm_id) on conflict do nothing;
    end if;
  end loop;
end $$;
