-- Access-rule checks for the expert network schema. Runs inside one transaction
-- and always ends by raising an error that lists PASS/FAIL per check, so nothing
-- it creates is ever kept. Run against a project with the schema applied.

begin;
create temp table t_results (n serial, check_name text, ok boolean, detail text);
grant all on t_results to authenticated, anon;
grant usage on sequence t_results_n_seq to authenticated, anon;

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@test.local'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'expert@test.local'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'company@test.local'),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'other@test.local'),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'expert2@test.local');
insert into public.user_roles values ('11111111-1111-1111-1111-111111111111', 'admin');

do $$
declare
  admin uuid := '11111111-1111-1111-1111-111111111111';
  exp uuid := '22222222-2222-2222-2222-222222222222';
  comp uuid := '33333333-3333-3333-3333-333333333333';
  other uuid := '44444444-4444-4444-4444-444444444444';
  exp2 uuid := '55555555-5555-5555-5555-555555555555';
  company_id uuid; req_id uuid; booking_id uuid; entry_id uuid; n int; v text;
begin
  -- Expert applies
  perform set_config('request.jwt.claims', json_build_object('sub', exp, 'role', 'authenticated')::text, true); set local role authenticated;
  insert into public.experts (id, full_name, primary_specialty, status) values (exp, 'Test Expert', 'law', 'draft');
  update public.experts set status = 'submitted' where id = exp;
  begin
    update public.experts set status = 'accepted' where id = exp;
    insert into t_results(check_name, ok) values ('expert cannot self-accept', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('expert cannot self-accept', true, sqlerrm); end;
  begin
    update public.experts set level = 'principal' where id = exp;
    insert into t_results(check_name, ok) values ('expert cannot set own level', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('expert cannot set own level', true, sqlerrm); end;
  select role::text into v from public.user_roles where user_id = exp;
  insert into t_results(check_name, ok, detail) values ('expert role granted on apply', v = 'expert', v);
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', exp2, 'role', 'authenticated')::text, true); set local role authenticated;
  insert into public.experts (id, full_name, status) values (exp2, 'Other Expert', 'submitted');
  reset role;

  -- Company signs up
  perform set_config('request.jwt.claims', json_build_object('sub', comp, 'role', 'authenticated')::text, true); set local role authenticated;
  company_id := public.create_company('Test Co');
  insert into public.company_requests (company_id, created_by, specialty, description)
    values (company_id, comp, 'law', 'Need an Arabic legal reviewer') returning id into req_id;
  select count(*) into n from public.experts;
  insert into t_results(check_name, ok, detail) values ('company sees no experts before matching', n = 0, n::text);
  begin
    update public.company_requests set status = 'filled' where id = req_id;
    insert into t_results(check_name, ok) values ('company cannot mark request filled', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('company cannot mark request filled', true, sqlerrm); end;
  begin
    insert into public.experts (id, full_name) values (comp, 'Company Person');
    insert into t_results(check_name, ok) values ('company account cannot become expert', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('company account cannot become expert', true, sqlerrm); end;
  reset role;

  -- Admin accepts expert, proposes candidate, creates booking with split terms
  perform set_config('request.jwt.claims', json_build_object('sub', admin, 'role', 'authenticated')::text, true); set local role authenticated;
  update public.experts set status = 'accepted', level = 'senior' where id = exp;
  insert into public.request_candidates (request_id, expert_id, hourly_price_usd, proposed_by) values (req_id, exp, 50, admin);
  insert into public.bookings (company_id, expert_id, request_id, title, weekly_hours_cap, starts_on, created_by)
    values (company_id, exp, req_id, 'Legal review', 10, current_date - 7, admin) returning id into booking_id;
  insert into public.booking_company_terms values (booking_id, 50);
  insert into public.booking_expert_terms values (booking_id, 35);
  reset role;

  -- Company view
  perform set_config('request.jwt.claims', json_build_object('sub', comp, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from public.experts;
  insert into t_results(check_name, ok, detail) values ('company sees its candidate expert only', n = 1, n::text);
  select count(*) into n from public.booking_expert_terms;
  insert into t_results(check_name, ok, detail) values ('company cannot see expert pay', n = 0, n::text);
  select count(*) into n from public.booking_company_terms;
  insert into t_results(check_name, ok, detail) values ('company sees its own price', n = 1, n::text);
  update public.request_candidates set status = 'shortlisted' where request_id = req_id and expert_id = exp;
  begin
    update public.request_candidates set hourly_price_usd = 1 where request_id = req_id and expert_id = exp;
    insert into t_results(check_name, ok) values ('company cannot change candidate price', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('company cannot change candidate price', true, sqlerrm); end;
  select count(*) into n from public.interviews;
  insert into t_results(check_name, ok, detail) values ('company cannot see interviews', n = 0, n::text);
  reset role;

  -- Expert view and booking response
  perform set_config('request.jwt.claims', json_build_object('sub', exp, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from public.booking_company_terms;
  insert into t_results(check_name, ok, detail) values ('expert cannot see company price', n = 0, n::text);
  select count(*) into n from public.booking_expert_terms;
  insert into t_results(check_name, ok, detail) values ('expert sees own pay', n = 1, n::text);
  begin
    insert into public.time_entries (booking_id, expert_id, work_date, hours, description) values (booking_id, exp, current_date, 2, 'Reviewed contracts');
    insert into t_results(check_name, ok) values ('no hours before accepting booking', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('no hours before accepting booking', true, sqlerrm); end;
  begin
    update public.bookings set status = 'active', weekly_hours_cap = 100 where id = booking_id;
    insert into t_results(check_name, ok) values ('expert cannot raise hours cap', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('expert cannot raise hours cap', true, sqlerrm); end;
  update public.bookings set status = 'active' where id = booking_id;
  insert into public.time_entries (booking_id, expert_id, work_date, hours, description)
    values (booking_id, exp, current_date, 6, 'Reviewed contracts') returning id into entry_id;
  begin
    insert into public.time_entries (booking_id, expert_id, work_date, hours, description) values (booking_id, exp, current_date, 5, 'More work');
    insert into t_results(check_name, ok) values ('weekly cap enforced', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('weekly cap enforced', true, sqlerrm); end;
  begin
    update public.time_entries set status = 'approved' where id = entry_id;
    insert into t_results(check_name, ok) values ('expert cannot approve own hours', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('expert cannot approve own hours', true, sqlerrm); end;
  reset role;

  -- Another expert can't log on this booking
  perform set_config('request.jwt.claims', json_build_object('sub', exp2, 'role', 'authenticated')::text, true); set local role authenticated;
  begin
    insert into public.time_entries (booking_id, expert_id, work_date, hours, description) values (booking_id, exp2, current_date, 1, 'Sneaky');
    insert into t_results(check_name, ok) values ('other expert cannot log on booking', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('other expert cannot log on booking', true, sqlerrm); end;
  select count(*) into n from public.bookings;
  insert into t_results(check_name, ok, detail) values ('other expert sees no bookings', n = 0, n::text);
  reset role;

  -- Company approves
  perform set_config('request.jwt.claims', json_build_object('sub', comp, 'role', 'authenticated')::text, true); set local role authenticated;
  begin
    update public.time_entries set hours = 1 where id = entry_id;
    insert into t_results(check_name, ok) values ('company cannot edit hours', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('company cannot edit hours', true, sqlerrm); end;
  update public.time_entries set status = 'approved' where id = entry_id;
  select status::text into v from public.time_entries where id = entry_id;
  insert into t_results(check_name, ok, detail) values ('company approves hours', v = 'approved', v);
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', exp, 'role', 'authenticated')::text, true); set local role authenticated;
  begin
    update public.time_entries set hours = 8 where id = entry_id;
    insert into t_results(check_name, ok) values ('approved hours locked', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('approved hours locked', true, sqlerrm); end;
  reset role;

  -- Outsider
  perform set_config('request.jwt.claims', json_build_object('sub', other, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from public.companies;
  insert into t_results(check_name, ok, detail) values ('outsider sees no companies', n = 0, n::text);
  select count(*) into n from public.time_entries;
  insert into t_results(check_name, ok, detail) values ('outsider sees no hours', n = 0, n::text);
  select count(*) into n from public.audit_log;
  insert into t_results(check_name, ok, detail) values ('outsider cannot read audit log', n = 0, n::text);
  begin
    insert into public.user_roles values (other, 'admin');
    insert into t_results(check_name, ok) values ('cannot grant self admin', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('cannot grant self admin', true, sqlerrm); end;
  reset role;

  -- Anonymous lead
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true); set local role anon;
  insert into public.company_leads (contact_name, email, company_name, need) values ('Sara', 'sara@example.com', 'Acme', 'Need Arabic medical reviewers');
  insert into t_results(check_name, ok) values ('anon can submit request-an-expert form', true);
  begin
    perform 1 from public.company_leads;
    insert into t_results(check_name, ok) values ('anon cannot read leads', false);
  exception when others then insert into t_results(check_name, ok, detail) values ('anon cannot read leads', true, sqlerrm); end;
  reset role;

  -- Admin audit
  perform set_config('request.jwt.claims', json_build_object('sub', admin, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from public.audit_log;
  insert into t_results(check_name, ok, detail) values ('audit log recorded changes', n > 5, n::text);
  reset role;
end $$;

do $$ declare r text; begin
  select string_agg(n || '. ' || case when ok then 'PASS' else 'FAIL' end || ' ' || check_name || coalesce(' — ' || left(detail, 70), ''), E'\n' order by n) into r from t_results;
  raise exception E'TEST RESULTS (rolled back)\n%', r;
end $$;
