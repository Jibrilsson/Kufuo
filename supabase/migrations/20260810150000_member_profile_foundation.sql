-- Member profile foundation that the core MVP migration extends.
-- Reconstructed from the columns the app reads and writes (app/lib/kufuo/types.ts).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  avatar_url text,
  headline text check (headline is null or char_length(headline) <= 160),
  bio text check (bio is null or char_length(bio) <= 2000),
  city text,
  country_code text not null default 'SA' check (char_length(country_code) = 2),
  role text,
  linkedin_url text check (linkedin_url is null or linkedin_url like 'https://%'),
  skills text[] not null default '{}',
  industries text[] not null default '{}',
  languages text[] not null default '{}',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Private contact details, readable only by the member themselves.
create table if not exists public.profile_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;

create policy "Members can create their own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "Members can update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Members manage their own contacts" on public.profile_contacts
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists set_profile_contacts_updated_at on public.profile_contacts;
create trigger set_profile_contacts_updated_at before update on public.profile_contacts
  for each row execute function public.set_updated_at();

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profile_contacts to authenticated;
