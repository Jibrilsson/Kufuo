-- Tie introduction requests to a specific idea so Kufuo can support a real
-- opportunity -> application -> conversation workflow.

alter table public.connection_requests
  add column if not exists idea_id uuid references public.ideas(id) on delete cascade;

drop index if exists public.connection_requests_one_pending_pair;

create unique index if not exists connection_requests_one_pending_idea
  on public.connection_requests (requester_id, idea_id)
  where status = 'pending' and idea_id is not null;

create unique index if not exists connection_requests_one_pending_founder_pair
  on public.connection_requests (least(requester_id, recipient_id), greatest(requester_id, recipient_id))
  where status = 'pending' and idea_id is null;

create index if not exists connection_requests_idea_idx
  on public.connection_requests (idea_id, status, created_at desc);

create or replace function private.on_connection_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  idea_title text;
  idea_owner uuid;
  idea_status text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    if old.status <> 'pending' then
      raise exception 'Only pending requests can change status';
    end if;
    if new.status in ('accepted', 'declined') and (select auth.uid()) <> old.recipient_id then
      raise exception 'Only the recipient can accept or decline a request';
    end if;
    if new.status = 'cancelled' and (select auth.uid()) <> old.requester_id then
      raise exception 'Only the requester can cancel a request';
    end if;
  end if;

  if new.idea_id is not null then
    select i.title, i.owner_id, i.status
    into idea_title, idea_owner, idea_status
    from public.ideas i
    where i.id = new.idea_id;

    if idea_owner is null or idea_owner <> new.recipient_id then
      raise exception 'The recipient must own the selected idea';
    end if;
    if idea_status <> 'open' then
      raise exception 'Applications are only available for open ideas';
    end if;
  end if;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, kind, title, body, href, actor_id)
    values (
      new.recipient_id,
      case when new.idea_id is null then 'introduction_request' else 'idea_application' end,
      case when new.idea_id is null then 'New introduction request' else 'New application for ' || coalesce(idea_title, 'your idea') end,
      new.message,
      '/connections',
      new.requester_id
    );
  elsif old.status is distinct from new.status and new.status = 'accepted' then
    new.responded_at := coalesce(new.responded_at, timezone('utc', now()));
    insert into public.conversations (connection_request_id, participant_a, participant_b)
    values (new.id, new.requester_id, new.recipient_id)
    on conflict (connection_request_id) do nothing;
    insert into public.notifications (user_id, kind, title, body, href, actor_id)
    values (
      new.requester_id,
      case when new.idea_id is null then 'introduction_accepted' else 'idea_application_accepted' end,
      case when new.idea_id is null then 'Your introduction was accepted' else 'Your application was accepted' end,
      'You can now start a private conversation.',
      '/messages',
      new.recipient_id
    );
  end if;
  return new;
end;
$$;

revoke all on function private.on_connection_request_change() from public, anon, authenticated;

grant select, insert on public.connection_requests to authenticated;
revoke update on table public.connection_requests from authenticated;
grant update (status, responded_at) on table public.connection_requests to authenticated;
