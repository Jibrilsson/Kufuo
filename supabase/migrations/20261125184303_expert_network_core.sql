-- Kufuo expert network: core schema for the MVP described in the PRD.
-- Kufuo vets Arab experts (AI interview + human review) and sells their hours
-- to companies. Kufuo's revenue is company rate minus expert rate per approved hour.
--
-- Access rules:
--   * Roles (expert / company / admin) are only ever granted server-side.
--   * Experts never see company rates or Kufuo's margin; companies never see
--     expert pay. Rates live in separate tables with their own RLS.
--   * Interview transcripts and summaries are admin-only.
--   * Every change to bookings, rates, time entries, invoices, payouts and
--     expert status is written to the audit log.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('expert', 'company', 'admin');

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function private.user_role()
returns public.app_role language sql stable security definer set search_path = '' as $$
  select role from public.user_roles where user_id = (select auth.uid());
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Experts and vetting
-- ---------------------------------------------------------------------------

create type public.expert_status as enum ('draft', 'submitted', 'interviewing', 'under_review', 'accepted', 'rejected', 'paused');
create type public.expert_level as enum ('associate', 'professional', 'senior', 'principal');

create table public.experts (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  headline text check (headline is null or char_length(headline) <= 160),
  bio text check (bio is null or char_length(bio) <= 3000),
  country_code text check (country_code is null or char_length(country_code) = 2),
  timezone text,
  languages text[] not null default '{}',
  primary_specialty text,
  specialties text[] not null default '{}',
  years_experience integer check (years_experience is null or years_experience between 0 and 60),
  linkedin_url text check (linkedin_url is null or linkedin_url like 'https://%'),
  cv_path text,
  weekly_hours_available integer check (weekly_hours_available is null or weekly_hours_available between 0 and 80),
  availability_notes text check (availability_notes is null or char_length(availability_notes) <= 500),
  -- Set by Kufuo only (no client update grant on these columns).
  status public.expert_status not null default 'draft',
  level public.expert_level,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Kufuo's default pay rate for an expert. Admin only; the per-booking rate is
-- what the expert actually sees.
create table public.expert_rates (
  expert_id uuid primary key references public.experts(id) on delete cascade,
  default_hourly_pay_usd numeric(8,2) not null check (default_hourly_pay_usd > 0),
  default_hourly_price_usd numeric(8,2) not null check (default_hourly_price_usd > 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

create type public.interview_status as enum ('invited', 'in_progress', 'completed', 'incomplete');

-- Written by the interviewer service (service role). Admin-only content.
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id) on delete cascade,
  language text not null default 'ar' check (language in ('ar', 'en')),
  specialty text,
  status public.interview_status not null default 'invited',
  attempt integer not null default 1 check (attempt between 1 and 3),
  duration_seconds integer,
  consent_given_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (expert_id, attempt)
);

-- Transcript, summary and scores: admin only.
create table public.interview_results (
  interview_id uuid primary key references public.interviews(id) on delete cascade,
  transcript jsonb,
  summary jsonb,
  criteria_scores jsonb,
  cost_usd numeric(8,4),
  created_at timestamptz not null default timezone('utc', now())
);

create type public.review_decision as enum ('accept', 'reject', 'needs_info');

create table public.expert_reviews (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id) on delete cascade,
  interview_id uuid references public.interviews(id) on delete set null,
  reviewer_id uuid references auth.users(id) on delete set null,
  decision public.review_decision not null,
  level public.expert_level,
  notes text check (notes is null or char_length(notes) <= 4000),
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Companies and requests
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  website text,
  billing_email text,
  billing_country_code text check (billing_country_code is null or char_length(billing_country_code) = 2),
  billing_address text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create type public.company_member_role as enum ('owner', 'member');

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (company_id, user_id)
);

create or replace function private.is_company_member(target_company uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members
    where company_id = target_company and user_id = (select auth.uid())
  );
$$;

-- Public "request an expert" form on the landing page (no account needed).
create table public.company_leads (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) <= 320 and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  company_name text not null check (char_length(company_name) between 2 and 160),
  need text not null check (char_length(need) between 10 and 2000),
  specialty text,
  language text check (language is null or language in ('ar', 'en', 'ar_en')),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create type public.request_status as enum ('open', 'matching', 'filled', 'closed');

create table public.company_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  specialty text not null check (char_length(specialty) between 2 and 120),
  language text not null default 'ar' check (language in ('ar', 'en', 'ar_en')),
  weekly_hours integer check (weekly_hours is null or weekly_hours between 1 and 80),
  duration_weeks integer check (duration_weeks is null or duration_weeks between 1 and 104),
  description text not null check (char_length(description) between 10 and 4000),
  status public.request_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create type public.candidate_status as enum ('proposed', 'shortlisted', 'declined_by_company', 'booked');

-- Experts Kufuo proposes for a request (manual matching in the MVP).
create table public.request_candidates (
  request_id uuid not null references public.company_requests(id) on delete cascade,
  expert_id uuid not null references public.experts(id) on delete cascade,
  hourly_price_usd numeric(8,2) check (hourly_price_usd is null or hourly_price_usd > 0),
  kufuo_note text check (kufuo_note is null or char_length(kufuo_note) <= 2000),
  status public.candidate_status not null default 'proposed',
  proposed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (request_id, expert_id)
);

-- ---------------------------------------------------------------------------
-- Bookings, hours, invoices, payouts
-- ---------------------------------------------------------------------------

create type public.booking_status as enum ('offered', 'active', 'declined', 'ended', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  expert_id uuid not null references public.experts(id) on delete restrict,
  request_id uuid references public.company_requests(id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  weekly_hours_cap numeric(5,2) check (weekly_hours_cap is null or weekly_hours_cap > 0),
  total_hours_cap numeric(7,2) check (total_hours_cap is null or total_hours_cap > 0),
  starts_on date not null,
  ends_on date,
  approval_window_days integer not null default 7 check (approval_window_days between 1 and 30),
  status public.booking_status not null default 'offered',
  responded_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_on is null or ends_on >= starts_on)
);

-- What the company pays per hour. Visible to the company and admins only.
create table public.booking_company_terms (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  hourly_price_usd numeric(8,2) not null check (hourly_price_usd > 0),
  updated_at timestamptz not null default timezone('utc', now())
);

-- What the expert earns per hour. Visible to the expert and admins only.
create table public.booking_expert_terms (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  hourly_pay_usd numeric(8,2) not null check (hourly_pay_usd > 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create type public.time_entry_status as enum ('submitted', 'approved', 'auto_approved', 'disputed', 'rejected');

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  expert_id uuid not null references public.experts(id) on delete restrict,
  work_date date not null,
  hours numeric(4,2) not null check (hours > 0 and hours <= 24),
  description text not null check (char_length(description) between 3 and 1000),
  status public.time_entry_status not null default 'submitted',
  dispute_reason text check (dispute_reason is null or char_length(dispute_reason) <= 1000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  invoice_id uuid,
  payout_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  number text unique,
  period_start date not null,
  period_end date not null,
  total_hours numeric(8,2) not null default 0,
  amount_usd numeric(10,2) not null default 0,
  status public.invoice_status not null default 'draft',
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end >= period_start)
);

create type public.payout_status as enum ('pending', 'sent', 'failed', 'cancelled');

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  total_hours numeric(8,2) not null default 0,
  amount_usd numeric(10,2) not null default 0,
  provider text,
  provider_reference text,
  status public.payout_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (period_end >= period_start)
);

alter table public.time_entries
  add constraint time_entries_invoice_fk foreign key (invoice_id) references public.invoices(id) on delete set null,
  add constraint time_entries_payout_fk foreign key (payout_id) references public.payouts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  table_name text not null,
  row_id text,
  action text not null,
  old_row jsonb,
  new_row jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function private.write_audit_log()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  row_key text;
begin
  row_key := coalesce(
    (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id',
    (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'booking_id',
    (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'expert_id',
    (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'user_id'
  );
  insert into public.audit_log (actor_id, table_name, row_id, action, old_row, new_row)
  values (
    (select auth.uid()),
    tg_table_name,
    row_key,
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- Workflow guards
-- ---------------------------------------------------------------------------

-- True when two versions of a row differ in any column outside `allowed`.
create or replace function private.changed_outside(old_row jsonb, new_row jsonb, allowed text[])
returns boolean language sql immutable set search_path = '' as $$
  select (old_row - allowed - 'updated_at') is distinct from (new_row - allowed - 'updated_at');
$$;

-- An expert application gives the user the expert role, unless they already
-- hold another role.
create or replace function private.on_expert_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  existing public.app_role;
begin
  select role into existing from public.user_roles where user_id = new.id;
  if existing is null then
    insert into public.user_roles (user_id, role) values (new.id, 'expert');
  elsif existing = 'company' then
    raise exception 'Company accounts cannot apply as experts';
  end if;
  return new;
end;
$$;

-- Experts can move their own application from draft to submitted; every
-- other status change is Kufuo's.
create or replace function private.guard_expert_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status and not private.is_admin()
     and (select auth.role()) <> 'service_role' then
    if not (old.status = 'draft' and new.status = 'submitted' and (select auth.uid()) = old.id) then
      raise exception 'Only Kufuo can change an expert''s status';
    end if;
  end if;
  if not private.is_admin() and (select auth.role()) <> 'service_role'
     and (new.level is distinct from old.level or new.accepted_at is distinct from old.accepted_at or new.id is distinct from old.id) then
    raise exception 'Only Kufuo can set an expert''s level';
  end if;
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.accepted_at := coalesce(new.accepted_at, timezone('utc', now()));
  end if;
  return new;
end;
$$;

-- Experts accept or decline offers; nothing else about a booking is theirs.
create or replace function private.guard_booking_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.is_admin() or (select auth.role()) = 'service_role' then
    return new;
  end if;
  if (select auth.uid()) <> old.expert_id then
    raise exception 'Not allowed to change this booking';
  end if;
  if private.changed_outside(to_jsonb(old), to_jsonb(new), array['status', 'responded_at']) then
    raise exception 'Experts can only accept or decline a booking';
  end if;
  if not (old.status = 'offered' and new.status in ('active', 'declined')) then
    raise exception 'Experts can only accept or decline an offered booking';
  end if;
  new.responded_at := timezone('utc', now());
  return new;
end;
$$;

-- Time entries: experts log hours on their active bookings within the caps;
-- company members approve or dispute submitted entries.
create or replace function private.guard_time_entry()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  b public.bookings;
  week_total numeric;
  grand_total numeric;
begin
  select * into b from public.bookings where id = new.booking_id;
  if b.id is null then
    raise exception 'Booking not found';
  end if;

  if tg_op = 'INSERT' then
    if b.expert_id <> new.expert_id then
      raise exception 'The booking belongs to another expert';
    end if;
    if b.status <> 'active' then
      raise exception 'Hours can only be logged on active bookings';
    end if;
    if new.work_date < b.starts_on or (b.ends_on is not null and new.work_date > b.ends_on) then
      raise exception 'Work date is outside the booking period';
    end if;
    if new.work_date > (timezone('utc', now()))::date + 1 then
      raise exception 'Hours cannot be logged in the future';
    end if;
    new.status := 'submitted';
  elsif tg_op = 'UPDATE' then
    if not private.is_admin() and (select auth.role()) <> 'service_role' then
      if (select auth.uid()) = old.expert_id then
        if old.status not in ('submitted', 'disputed') then
          raise exception 'Approved hours cannot be edited';
        end if;
        if private.changed_outside(to_jsonb(old), to_jsonb(new), array['work_date', 'hours', 'description', 'status', 'dispute_reason']) then
          raise exception 'Experts can only edit the date, hours and description';
        end if;
        if new.status is distinct from old.status then
          raise exception 'Experts cannot change approval status';
        end if;
        new.status := 'submitted';
        new.dispute_reason := null;
      elsif private.is_company_member(b.company_id) then
        if private.changed_outside(to_jsonb(old), to_jsonb(new), array['status', 'dispute_reason', 'reviewed_by', 'reviewed_at']) then
          raise exception 'Companies can only approve or dispute hours';
        end if;
        if old.status <> 'submitted' or new.status not in ('approved', 'disputed') then
          raise exception 'Only submitted hours can be approved or disputed';
        end if;
        if new.status = 'disputed' and coalesce(trim(new.dispute_reason), '') = '' then
          raise exception 'A dispute needs a reason';
        end if;
        new.reviewed_by := (select auth.uid());
        new.reviewed_at := timezone('utc', now());
      else
        raise exception 'Not allowed to change these hours';
      end if;
    end if;
  end if;

  if new.status in ('submitted', 'approved', 'auto_approved') then
    if b.weekly_hours_cap is not null then
      select coalesce(sum(hours), 0) into week_total from public.time_entries
      where booking_id = new.booking_id and id <> new.id
        and status in ('submitted', 'approved', 'auto_approved')
        and date_trunc('week', work_date) = date_trunc('week', new.work_date);
      if week_total + new.hours > b.weekly_hours_cap then
        raise exception 'This exceeds the weekly hours cap for the booking';
      end if;
    end if;
    if b.total_hours_cap is not null then
      select coalesce(sum(hours), 0) into grand_total from public.time_entries
      where booking_id = new.booking_id and id <> new.id
        and status in ('submitted', 'approved', 'auto_approved');
      if grand_total + new.hours > b.total_hours_cap then
        raise exception 'This exceeds the total hours cap for the booking';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Companies may only shortlist or decline a proposed candidate.
create or replace function private.guard_candidate_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.is_admin() or (select auth.role()) = 'service_role' then
    return new;
  end if;
  if private.changed_outside(to_jsonb(old), to_jsonb(new), array['status'])
     or new.status not in ('shortlisted', 'declined_by_company')
     or old.status = 'booked' then
    raise exception 'Companies can only shortlist or decline candidates';
  end if;
  return new;
end;
$$;

-- Company members may edit a request's details but not who owns it.
create or replace function private.guard_request_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.is_admin() or (select auth.role()) = 'service_role' then
    return new;
  end if;
  if new.company_id is distinct from old.company_id or new.created_by is distinct from old.created_by then
    raise exception 'A request cannot move between companies';
  end if;
  if new.status is distinct from old.status and new.status <> 'closed' then
    raise exception 'Companies can only close a request';
  end if;
  return new;
end;
$$;

-- Hours a company has not answered within the booking's approval window count
-- as approved. Run on a schedule (e.g. pg_cron daily) once it is enabled.
create or replace function private.auto_approve_time_entries()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  changed integer;
begin
  update public.time_entries t
  set status = 'auto_approved', reviewed_at = timezone('utc', now())
  from public.bookings b
  where t.booking_id = b.id
    and t.status = 'submitted'
    and t.created_at < timezone('utc', now()) - make_interval(days => b.approval_window_days);
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Companies sign up through this function: it creates the company, makes the
-- caller its owner and gives them the company role.
create or replace function public.create_company(company_name text, company_website text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  existing public.app_role;
  new_company uuid;
begin
  if uid is null then
    raise exception 'Sign in first';
  end if;
  select role into existing from public.user_roles where user_id = uid;
  if existing is not null and existing <> 'company' then
    raise exception 'This account already has the % role', existing;
  end if;
  insert into public.companies (name, website, created_by)
  values (company_name, company_website, uid)
  returning id into new_company;
  insert into public.company_members (company_id, user_id, role) values (new_company, uid, 'owner');
  insert into public.user_roles (user_id, role) values (uid, 'company') on conflict (user_id) do nothing;
  return new_company;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger on_expert_insert after insert on public.experts
  for each row execute function private.on_expert_insert();
create trigger guard_expert_update before update on public.experts
  for each row execute function private.guard_expert_update();
create trigger guard_booking_update before update on public.bookings
  for each row execute function private.guard_booking_update();
create trigger guard_candidate_update before update on public.request_candidates
  for each row execute function private.guard_candidate_update();
create trigger guard_request_update before update on public.company_requests
  for each row execute function private.guard_request_update();
create trigger guard_time_entry before insert or update on public.time_entries
  for each row execute function private.guard_time_entry();

do $$
declare t text;
begin
  foreach t in array array['experts', 'companies', 'company_requests', 'request_candidates', 'bookings',
                           'booking_company_terms', 'booking_expert_terms', 'time_entries', 'invoices',
                           'payouts', 'expert_rates'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', t, t);
  end loop;
  foreach t in array array['bookings', 'booking_company_terms', 'booking_expert_terms', 'time_entries',
                           'invoices', 'payouts', 'expert_rates', 'expert_reviews', 'user_roles'] loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function private.write_audit_log()', t, t);
  end loop;
end $$;

create trigger audit_experts_status after update on public.experts
  for each row when (old.status is distinct from new.status or old.level is distinct from new.level)
  execute function private.write_audit_log();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index experts_status_idx on public.experts(status, primary_specialty);
create index interview_results_created_idx on public.interview_results(created_at);
create index interviews_expert_idx on public.interviews(expert_id, created_at desc);
create index expert_reviews_expert_idx on public.expert_reviews(expert_id, created_at desc);
create index expert_reviews_interview_idx on public.expert_reviews(interview_id);
create index expert_reviews_reviewer_idx on public.expert_reviews(reviewer_id);
create index company_members_user_idx on public.company_members(user_id);
create index companies_created_by_idx on public.companies(created_by);
create index company_requests_company_idx on public.company_requests(company_id, status, created_at desc);
create index company_requests_created_by_idx on public.company_requests(created_by);
create index request_candidates_expert_idx on public.request_candidates(expert_id);
create index request_candidates_proposed_by_idx on public.request_candidates(proposed_by);
create index bookings_company_idx on public.bookings(company_id, status);
create index bookings_expert_idx on public.bookings(expert_id, status);
create index bookings_request_idx on public.bookings(request_id);
create index bookings_created_by_idx on public.bookings(created_by);
create index time_entries_booking_idx on public.time_entries(booking_id, work_date);
create index time_entries_expert_idx on public.time_entries(expert_id, status);
create index time_entries_status_idx on public.time_entries(status, created_at);
create index time_entries_invoice_idx on public.time_entries(invoice_id);
create index time_entries_payout_idx on public.time_entries(payout_id);
create index time_entries_reviewed_by_idx on public.time_entries(reviewed_by);
create index invoices_company_idx on public.invoices(company_id, period_start desc);
create index payouts_expert_idx on public.payouts(expert_id, period_start desc);
create index expert_rates_updated_by_idx on public.expert_rates(updated_by);
create index audit_log_row_idx on public.audit_log(table_name, row_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['user_roles', 'experts', 'expert_rates', 'interviews', 'interview_results', 'expert_reviews',
                           'companies', 'company_members', 'company_leads', 'company_requests',
                           'request_candidates', 'bookings', 'booking_company_terms',
                           'booking_expert_terms', 'time_entries', 'invoices', 'payouts', 'audit_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- user_roles: read your own role; admins read all. Writes are server-side only.
create policy "Read own role" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
grant select on public.user_roles to authenticated;

-- experts
create policy "Experts read own profile, admins read all" on public.experts for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_admin())
    or exists (
      select 1 from public.request_candidates rc
      join public.company_requests r on r.id = rc.request_id
      where rc.expert_id = experts.id and (select private.is_company_member(r.company_id))
    )
    or exists (
      select 1 from public.bookings b
      where b.expert_id = experts.id and (select private.is_company_member(b.company_id))
    )
  );
create policy "Users create their own expert profile" on public.experts for insert to authenticated
  with check (id = (select auth.uid()) and status in ('draft', 'submitted'));
create policy "Experts update own profile, admins update all" on public.experts for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));
grant select on public.experts to authenticated;
grant insert (id, full_name, headline, bio, country_code, timezone, languages, primary_specialty, specialties,
              years_experience, linkedin_url, cv_path, weekly_hours_available, availability_notes, status)
  on public.experts to authenticated;
grant update on public.experts to authenticated;

-- expert_rates, expert_reviews, interviews: admin only. The interviewer
-- service writes interviews with the service role.
create policy "Admins manage expert rates" on public.expert_rates for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins manage reviews" on public.expert_reviews for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins manage interviews" on public.interviews for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Experts see their own interview status" on public.interviews for select to authenticated
  using (expert_id = (select auth.uid()));
create policy "Admins manage interview results" on public.interview_results for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, insert, update, delete on public.expert_rates, public.expert_reviews,
  public.interviews, public.interview_results to authenticated;

-- companies and members
create policy "Members read their company" on public.companies for select to authenticated
  using ((select private.is_company_member(id)) or (select private.is_admin()));
create policy "Owners and admins update the company" on public.companies for update to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.company_members m
    where m.company_id = companies.id and m.user_id = (select auth.uid()) and m.role = 'owner'))
  with check ((select private.is_admin()) or (select private.is_company_member(id)));
grant select on public.companies to authenticated;
grant insert, update on public.companies to authenticated;
create policy "Admins create companies" on public.companies for insert to authenticated
  with check ((select private.is_admin()));

create policy "Members read their team" on public.company_members for select to authenticated
  using ((select private.is_company_member(company_id)) or (select private.is_admin()));
create policy "Admins manage company members" on public.company_members for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, insert, update, delete on public.company_members to authenticated;

-- company_leads: anyone can submit; admins read.
create policy "Anyone can request an expert" on public.company_leads for insert to anon, authenticated
  with check (status = 'new');
create policy "Admins manage leads" on public.company_leads for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant insert (contact_name, email, company_name, need, specialty, language) on public.company_leads to anon, authenticated;
grant select, update, delete on public.company_leads to authenticated;

-- company_requests
create policy "Members and admins read requests" on public.company_requests for select to authenticated
  using ((select private.is_company_member(company_id)) or (select private.is_admin()));
create policy "Members create requests" on public.company_requests for insert to authenticated
  with check ((select private.is_company_member(company_id)) and created_by = (select auth.uid()) and status = 'open');
create policy "Members and admins update requests" on public.company_requests for update to authenticated
  using ((select private.is_company_member(company_id)) or (select private.is_admin()))
  with check ((select private.is_company_member(company_id)) or (select private.is_admin()));
grant select, insert, update on public.company_requests to authenticated;

-- request_candidates: Kufuo proposes, the company shortlists or declines.
create policy "Company members and admins read candidates" on public.request_candidates for select to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.company_requests r
    where r.id = request_candidates.request_id and (select private.is_company_member(r.company_id))));
create policy "Admins manage candidates" on public.request_candidates for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Company members respond to candidates" on public.request_candidates for update to authenticated
  using (exists (
    select 1 from public.company_requests r
    where r.id = request_candidates.request_id and (select private.is_company_member(r.company_id))))
  with check (status in ('shortlisted', 'declined_by_company'));
grant select, insert, update, delete on public.request_candidates to authenticated;

-- bookings
create policy "Participants and admins read bookings" on public.bookings for select to authenticated
  using (expert_id = (select auth.uid()) or (select private.is_company_member(company_id)) or (select private.is_admin()));
create policy "Admins create bookings" on public.bookings for insert to authenticated
  with check ((select private.is_admin()));
create policy "Experts respond, admins manage bookings" on public.bookings for update to authenticated
  using (expert_id = (select auth.uid()) or (select private.is_admin()))
  with check (expert_id = (select auth.uid()) or (select private.is_admin()));
grant select, insert, update on public.bookings to authenticated;

create policy "Company and admins read company terms" on public.booking_company_terms for select to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.bookings b where b.id = booking_company_terms.booking_id and (select private.is_company_member(b.company_id))));
create policy "Admins manage company terms" on public.booking_company_terms for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Expert and admins read expert terms" on public.booking_expert_terms for select to authenticated
  using ((select private.is_admin()) or exists (
    select 1 from public.bookings b where b.id = booking_expert_terms.booking_id and b.expert_id = (select auth.uid())));
create policy "Admins manage expert terms" on public.booking_expert_terms for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, insert, update, delete on public.booking_company_terms, public.booking_expert_terms to authenticated;

-- time_entries
create policy "Participants and admins read hours" on public.time_entries for select to authenticated
  using (expert_id = (select auth.uid()) or (select private.is_admin()) or exists (
    select 1 from public.bookings b where b.id = time_entries.booking_id and (select private.is_company_member(b.company_id))));
create policy "Experts log their hours" on public.time_entries for insert to authenticated
  with check (expert_id = (select auth.uid()));
create policy "Participants and admins update hours" on public.time_entries for update to authenticated
  using (expert_id = (select auth.uid()) or (select private.is_admin()) or exists (
    select 1 from public.bookings b where b.id = time_entries.booking_id and (select private.is_company_member(b.company_id))))
  with check (true);
create policy "Experts delete unreviewed hours" on public.time_entries for delete to authenticated
  using ((expert_id = (select auth.uid()) and status = 'submitted') or (select private.is_admin()));
grant select, delete on public.time_entries to authenticated;
grant insert (booking_id, expert_id, work_date, hours, description) on public.time_entries to authenticated;
grant update on public.time_entries to authenticated;

-- invoices and payouts: Kufuo writes; the company / expert reads their own.
create policy "Company and admins read invoices" on public.invoices for select to authenticated
  using ((select private.is_company_member(company_id)) or (select private.is_admin()));
create policy "Admins manage invoices" on public.invoices for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Expert and admins read payouts" on public.payouts for select to authenticated
  using (expert_id = (select auth.uid()) or (select private.is_admin()));
create policy "Admins manage payouts" on public.payouts for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, insert, update, delete on public.invoices, public.payouts to authenticated;

-- audit_log: admins read; only triggers write.
create policy "Admins read the audit log" on public.audit_log for select to authenticated
  using ((select private.is_admin()));
grant select on public.audit_log to authenticated;

-- Function access
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_admin(), private.user_role(), private.is_company_member(uuid),
  private.changed_outside(jsonb, jsonb, text[]) to authenticated;
revoke all on function public.create_company(text, text) from public, anon;
grant execute on function public.create_company(text, text) to authenticated;
