-- Kufuo core product schema.
-- Extends the existing private member profile foundation with the MVP social graph.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.profiles
  add column if not exists profile_type text not null default 'both',
  add column if not exists availability text,
  add column if not exists commitment text,
  add column if not exists startup_stage text,
  add column if not exists looking_for text,
  add column if not exists working_style text,
  add column if not exists decision_style text,
  add column if not exists equity_approach text,
  add column if not exists is_visible boolean not null default true,
  add column if not exists profile_strength integer not null default 20;

do $$ begin
  alter table public.profiles add constraint profiles_profile_type_check
    check (profile_type in ('idea', 'skill', 'both'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles add constraint profiles_strength_check
    check (profile_strength between 0 and 100);
exception when duplicate_object then null; end $$;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  summary text not null check (char_length(summary) between 10 and 1200),
  stage text not null default 'discovery',
  city text,
  skills_needed text[] not null default '{}',
  industries text[] not null default '{}',
  status text not null default 'open' check (status in ('draft', 'open', 'paused', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, profile_id),
  check (user_id <> profile_id)
);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 800),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (requester_id <> recipient_id)
);

create unique index if not exists connection_requests_one_pending_pair
  on public.connection_requests (least(requester_id, recipient_id), greatest(requester_id, recipient_id))
  where status = 'pending';

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  connection_request_id uuid not null unique references public.connection_requests(id) on delete cascade,
  participant_a uuid not null references auth.users(id) on delete cascade,
  participant_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  check (participant_a <> participant_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'update' check (kind in ('update', 'idea', 'help', 'opportunity', 'community')),
  title text check (title is null or char_length(title) <= 160),
  body text not null check (char_length(body) between 1 and 3000),
  visibility text not null default 'community' check (visibility in ('community', 'connections')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'useful' check (kind in ('useful', 'like')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table if not exists public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.member_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  match_notifications boolean not null default true,
  introduction_notifications boolean not null default true,
  community_notifications boolean not null default false,
  profile_visible boolean not null default true,
  city_visible boolean not null default true,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  check (reported_user_id is not null or post_id is not null)
);

create index if not exists ideas_owner_idx on public.ideas(owner_id);
create index if not exists ideas_discovery_idx on public.ideas(status, created_at desc);
create index if not exists connection_requests_recipient_idx on public.connection_requests(recipient_id, status, created_at desc);
create index if not exists connection_requests_requester_idx on public.connection_requests(requester_id, status, created_at desc);
create index if not exists conversations_participant_a_idx on public.conversations(participant_a);
create index if not exists conversations_participant_b_idx on public.conversations(participant_b);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists notifications_user_idx on public.notifications(user_id, read_at, created_at desc);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'ideas', 'saved_profiles', 'connection_requests', 'conversations', 'messages',
    'posts', 'post_reactions', 'saved_posts', 'comments', 'notifications',
    'member_settings', 'blocks', 'reports'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "Authenticated members can discover profiles" on public.profiles;
create policy "Members can discover visible complete profiles"
  on public.profiles for select to authenticated
  using (
    (select auth.uid()) = id
    or (is_visible and onboarding_complete and not exists (
      select 1 from public.blocks
      where (blocker_id = (select auth.uid()) and blocked_id = profiles.id)
         or (blocker_id = profiles.id and blocked_id = (select auth.uid()))
    ))
  );

create policy "Members can discover open ideas" on public.ideas
  for select to authenticated
  using (owner_id = (select auth.uid()) or status = 'open');
create policy "Members can create their own ideas" on public.ideas
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Members can update their own ideas" on public.ideas
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Members can delete their own ideas" on public.ideas
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Members manage their saved profiles" on public.saved_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Request participants can read requests" on public.connection_requests
  for select to authenticated
  using ((select auth.uid()) in (requester_id, recipient_id));
create policy "Members can send introduction requests" on public.connection_requests
  for insert to authenticated
  with check (requester_id = (select auth.uid()) and recipient_id <> (select auth.uid()));
create policy "Request participants can update requests" on public.connection_requests
  for update to authenticated
  using ((select auth.uid()) in (requester_id, recipient_id))
  with check ((select auth.uid()) in (requester_id, recipient_id));

create policy "Participants can read conversations" on public.conversations
  for select to authenticated
  using ((select auth.uid()) in (participant_a, participant_b));

create policy "Participants can read messages" on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.participant_a, c.participant_b)
  ));
create policy "Participants can send messages" on public.messages
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (select auth.uid()) in (c.participant_a, c.participant_b)
    )
  );
create policy "Recipients can mark messages read" on public.messages
  for update to authenticated
  using (author_id <> (select auth.uid()) and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.participant_a, c.participant_b)
  ))
  with check (author_id <> (select auth.uid()));

create policy "Members can read community posts" on public.posts
  for select to authenticated using (true);
create policy "Members can publish posts" on public.posts
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "Members can update their posts" on public.posts
  for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Members can delete their posts" on public.posts
  for delete to authenticated using (author_id = (select auth.uid()));

create policy "Members can read reactions" on public.post_reactions
  for select to authenticated using (true);
create policy "Members manage their reactions" on public.post_reactions
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Members manage saved posts" on public.saved_posts
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Members can read comments" on public.comments
  for select to authenticated using (true);
create policy "Members can publish comments" on public.comments
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "Members can update their comments" on public.comments
  for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Members can delete their comments" on public.comments
  for delete to authenticated using (author_id = (select auth.uid()));

create policy "Members read their notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members update their notifications" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Members manage their settings" on public.member_settings
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Members manage their blocks" on public.blocks
  for all to authenticated using (blocker_id = (select auth.uid())) with check (blocker_id = (select auth.uid()));
create policy "Members can create reports" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "Members can read their reports" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));

create or replace function private.on_connection_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, kind, title, body, href, actor_id)
    values (new.recipient_id, 'introduction_request', 'New introduction request', new.message, '/connections', new.requester_id);
  elsif old.status is distinct from new.status and new.status = 'accepted' then
    new.responded_at := coalesce(new.responded_at, timezone('utc', now()));
    insert into public.conversations (connection_request_id, participant_a, participant_b)
    values (new.id, new.requester_id, new.recipient_id)
    on conflict (connection_request_id) do nothing;
    insert into public.notifications (user_id, kind, title, body, href, actor_id)
    values (new.requester_id, 'introduction_accepted', 'Your introduction was accepted', 'You can now start a private conversation.', '/messages', new.recipient_id);
  end if;
  return new;
end;
$$;
revoke all on function private.on_connection_request_change() from public, anon, authenticated;

create or replace function private.on_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare recipient uuid;
begin
  select case when c.participant_a = new.author_id then c.participant_b else c.participant_a end
  into recipient
  from public.conversations c
  where c.id = new.conversation_id;

  if recipient is not null then
    insert into public.notifications (user_id, kind, title, body, href, actor_id)
    values (recipient, 'new_message', 'New message', left(new.body, 180), '/messages', new.author_id);
  end if;
  return new;
end;
$$;
revoke all on function private.on_new_message() from public, anon, authenticated;

drop trigger if exists notify_connection_request_change on public.connection_requests;
create trigger notify_connection_request_change
  before insert or update on public.connection_requests
  for each row execute function private.on_connection_request_change();

drop trigger if exists notify_new_message on public.messages;
create trigger notify_new_message
  after insert on public.messages
  for each row execute function private.on_new_message();

do $$
declare table_name text;
begin
  foreach table_name in array array['ideas', 'connection_requests', 'posts', 'comments', 'member_settings'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.profile_contacts to authenticated;
grant select, insert, update, delete on public.ideas to authenticated;
grant select, insert, delete on public.saved_profiles to authenticated;
grant select, insert, update on public.connection_requests to authenticated;
grant select on public.conversations to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.post_reactions to authenticated;
grant select, insert, delete on public.saved_posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, update, delete on public.member_settings to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant select, insert on public.reports to authenticated;

alter publication supabase_realtime add table public.messages;
