create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  path text not null check (path in ('idea', 'skill')),
  source text not null default 'landing_page',
  created_at timestamptz not null default timezone('utc', now()),
  constraint waitlist_email_unique unique (email),
  constraint waitlist_email_format check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

alter table public.waitlist enable row level security;
create policy "Visitors can join the Kufuo waitlist" on public.waitlist
  for insert to anon, authenticated
  with check (char_length(email) <= 320 and path in ('idea', 'skill'));

grant insert on public.waitlist to anon, authenticated;
