-- Run against a disposable Supabase database: psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/tenant_isolation.sql
begin;

do $$
declare
  user_a uuid := gen_random_uuid(); user_b uuid := gen_random_uuid();
  org_a uuid := gen_random_uuid(); org_b uuid := gen_random_uuid();
  branch_a uuid := gen_random_uuid(); branch_a_2 uuid := gen_random_uuid(); branch_b uuid := gen_random_uuid(); member_a uuid;
  visible_count integer;
begin
  insert into auth.users(id, email, encrypted_password, aud, role) values
    (user_a, 'a@example.test', '', 'authenticated', 'authenticated'),
    (user_b, 'b@example.test', '', 'authenticated', 'authenticated');
  insert into public.organizations(id,name,created_by) values (org_a,'School A',user_a),(org_b,'School B',user_b);
  insert into public.organization_members(organization_id,user_id,role,status,all_branches,joined_at) values
    (org_a,user_a,'OWNER','ACTIVE',false,now()) returning id into member_a;
  insert into public.organization_members(organization_id,user_id,role,status,all_branches,joined_at) values
    (org_b,user_b,'OWNER','ACTIVE',true,now());
  insert into public.branches(id,organization_id,name,code) values (branch_a,org_a,'Main','MAIN'),(branch_a_2,org_a,'Second','SECOND'),(branch_b,org_b,'Main','MAIN');
  insert into public.member_branches(organization_id,member_id,branch_id) values(org_a,member_a,branch_a);
  insert into public.students(organization_id,branch_id,student_number,admission_number,first_name,last_name) values
    (org_a,branch_a,'A-1','A-1','Asha','A'),
    (org_a,branch_a_2,'A-2','A-2','Amina','A'),
    (org_b,branch_b,'B-1','B-1','Bakari','B');

  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into visible_count from public.students;
  if visible_count <> 1 then raise exception 'RLS failure: School A branch user saw % student rows', visible_count; end if;
  if exists(select 1 from public.students where organization_id = org_b) then raise exception 'RLS failure: cross-school read succeeded'; end if;
  if exists(select 1 from public.students where branch_id = branch_a_2) then raise exception 'RLS failure: cross-branch read succeeded'; end if;
  begin
    update public.students set first_name = 'Attacked' where organization_id = org_b;
    if found then raise exception 'RLS failure: cross-school update succeeded'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;

