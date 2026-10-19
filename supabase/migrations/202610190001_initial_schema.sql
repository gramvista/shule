-- Shule Connect initial multi-tenant schema
-- Apply with the Supabase CLI. All tenant isolation is enforced by RLS.

create extension if not exists pgcrypto;

create type public.member_role as enum ('OWNER','SCHOOL_ADMIN','HEAD_TEACHER','ACADEMIC_TEACHER','CLASS_TEACHER','TEACHER','BURSAR','ACCOUNTANT','RECEPTIONIST','STAFF','VIEWER');
create type public.membership_status as enum ('INVITED','ACTIVE','SUSPENDED','REVOKED');
create type public.student_status as enum ('ACTIVE','GRADUATED','TRANSFERRED','SUSPENDED','WITHDRAWN','ARCHIVED');
create type public.attendance_status as enum ('PRESENT','ABSENT','LATE','EXCUSED','SICK','OTHER');
create type public.payment_method as enum ('CASH','MOBILE_MONEY','BANK','CARD','OTHER');
create type public.subscription_status as enum ('TRIAL','ACTIVE','GRACE_PERIOD','EXPIRED','SUSPENDED','CANCELLED');
create type public.message_status as enum ('QUEUED','SUBMITTED','DELIVERED','FAILED','REJECTED');
create type public.custom_field_type as enum ('TEXT','NUMBER','DATE','SELECT','BOOLEAN');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone_e164 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  registration_number text,
  phone_e164 text,
  email text,
  region text,
  district text,
  ward text,
  physical_address text,
  school_type text,
  school_level text,
  ownership_type text,
  logo_path text,
  default_currency char(3) not null default 'TZS',
  timezone text not null default 'Africa/Dar_es_Salaam',
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  status public.membership_status not null default 'ACTIVE',
  all_branches boolean not null default false,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  location text,
  phone_e164 text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.member_branches (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid not null references public.organization_members(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  primary key (member_id, branch_id)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (organization_id, name)
);
create unique index academic_years_one_active on public.academic_years(organization_id) where is_active;

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (academic_year_id, name)
);
create unique index terms_one_active on public.terms(organization_id) where is_active;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  level_order smallint,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.streams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (branch_id, class_id, name)
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  secondary_phone_e164 text check (secondary_phone_e164 is null or secondary_phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  address text,
  occupation text,
  sms_consent boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guardians_org_phone_idx on public.guardians(organization_id, phone_e164);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  student_number text not null,
  admission_number text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  gender text,
  date_of_birth date,
  photo_path text,
  admission_date date not null default current_date,
  status public.student_status not null default 'ACTIVE',
  nationality text,
  address text,
  medical_notes text,
  previous_school text,
  special_notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, student_number),
  unique (organization_id, admission_number)
);
create index students_org_name_idx on public.students(organization_id, lower(last_name), lower(first_name));
create index students_branch_status_idx on public.students(organization_id, branch_id, status);

create table public.student_guardians (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  relationship text not null,
  is_primary boolean not null default false,
  can_collect boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (student_id, guardian_id)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id),
  branch_id uuid not null references public.branches(id),
  academic_year_id uuid not null references public.academic_years(id),
  class_id uuid not null references public.classes(id),
  stream_id uuid references public.streams(id),
  enrolled_on date not null default current_date,
  ended_on date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (student_id, academic_year_id)
);
create index enrollments_class_idx on public.enrollments(organization_id, academic_year_id, class_id, stream_id);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id),
  user_id uuid references auth.users(id),
  employee_number text not null,
  full_name text not null,
  phone_e164 text,
  email text,
  job_title text,
  employment_status text not null default 'ACTIVE',
  joining_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, employee_number)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean not null default true,
  unique (organization_id, code)
);

create table public.teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id),
  staff_id uuid not null references public.staff(id),
  class_id uuid not null references public.classes(id),
  stream_id uuid references public.streams(id),
  subject_id uuid not null references public.subjects(id),
  unique (academic_year_id, staff_id, class_id, stream_id, subject_id)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  student_id uuid not null references public.students(id),
  enrollment_id uuid not null references public.enrollments(id),
  academic_year_id uuid not null references public.academic_years(id),
  term_id uuid not null references public.terms(id),
  attendance_date date not null,
  status public.attendance_status not null,
  notes text,
  recorded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date, enrollment_id)
);
create index attendance_org_date_idx on public.attendance_records(organization_id, attendance_date, branch_id);

create table public.fee_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  active boolean not null default true,
  unique (organization_id, code)
);

create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id),
  academic_year_id uuid not null references public.academic_years(id),
  term_id uuid references public.terms(id),
  class_id uuid references public.classes(id),
  fee_item_id uuid not null references public.fee_items(id),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'TZS',
  mandatory boolean not null default true,
  due_on date,
  created_at timestamptz not null default now()
);

create table public.student_charges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id),
  enrollment_id uuid not null references public.enrollments(id),
  fee_structure_id uuid references public.fee_structures(id),
  description text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  adjustment_minor bigint not null default 0,
  due_on date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check (amount_minor + adjustment_minor >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  student_id uuid not null references public.students(id),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null default 'TZS',
  paid_on date not null,
  payment_method public.payment_method not null,
  reference_number text,
  receipt_number text not null,
  idempotency_key uuid not null,
  notes text,
  recorded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references auth.users(id),
  void_reason text,
  unique (organization_id, receipt_number),
  unique (organization_id, idempotency_key)
);
create index payments_org_date_idx on public.payments(organization_id, paid_on desc, branch_id);

create table public.payment_allocations (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  student_charge_id uuid not null references public.student_charges(id),
  amount_minor bigint not null check (amount_minor > 0),
  created_at timestamptz not null default now(),
  primary key (payment_id, student_charge_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  academic_year_id uuid not null references public.academic_years(id),
  term_id uuid not null references public.terms(id),
  class_id uuid not null references public.classes(id),
  stream_id uuid references public.streams(id),
  subject_id uuid not null references public.subjects(id),
  assessment_type text not null,
  name text not null,
  assessment_date date,
  maximum_marks numeric(7,2) not null check (maximum_marks > 0),
  weight numeric(6,3) not null default 1 check (weight > 0),
  published_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id),
  score numeric(7,2) not null check (score >= 0),
  teacher_comment text,
  entered_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, student_id)
);

create table public.grading_scales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  unique (organization_id, name)
);
create table public.grade_ranges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  grading_scale_id uuid not null references public.grading_scales(id) on delete cascade,
  grade text not null,
  minimum numeric(7,2) not null,
  maximum numeric(7,2) not null,
  points numeric(6,2),
  remarks text,
  check (minimum <= maximum),
  unique (grading_scale_id, grade)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id),
  title text not null,
  message text not null,
  audience_type text not null,
  audience_filter jsonb not null default '{}'::jsonb,
  priority text not null default 'NORMAL',
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Credentials are intentionally service-role only. User-facing settings live separately.
create table public.sms_provider_credentials (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  provider text not null default 'GRAMVISTA_SMS',
  encrypted_api_key text not null,
  key_version smallint not null default 1,
  updated_at timestamptz not null default now()
);
create table public.sms_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  sender_id text,
  daily_limit integer not null default 0 check (daily_limit >= 0),
  enabled boolean not null default false,
  automatic_absence_alerts boolean not null default false,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
create table public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id),
  message_type text not null,
  body text not null,
  status public.message_status not null default 'QUEUED',
  idempotency_key uuid not null,
  provider_message_id text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (organization_id, idempotency_key)
);
create table public.sms_recipients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sms_message_id uuid not null references public.sms_messages(id) on delete cascade,
  guardian_id uuid references public.guardians(id),
  phone_e164 text not null,
  status public.message_status not null default 'QUEUED',
  provider_message_id text,
  failure_code text,
  created_at timestamptz not null default now(),
  unique (sms_message_id, phone_e164)
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  limits jsonb not null default '{}'::jsonb,
  active boolean not null default true
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id),
  status public.subscription_status not null default 'TRIAL',
  starts_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index subscriptions_one_current on public.subscriptions(organization_id) where status in ('TRIAL','ACTIVE','GRACE_PERIOD','SUSPENDED');

create table public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('STUDENT')),
  label text not null,
  field_key text not null,
  field_type public.custom_field_type not null,
  options jsonb,
  sensitive boolean not null default false,
  required boolean not null default false,
  active boolean not null default true,
  unique (organization_id, entity_type, field_key)
);
create table public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  custom_field_id uuid not null references public.custom_fields(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  unique (custom_field_id, student_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index audit_logs_org_time_idx on public.audit_logs(organization_id, created_at desc);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.member_role not null,
  branch_ids uuid[] not null default '{}',
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Defense in depth: tenant references must belong to the same organization.
create or replace function public.validate_student_tenant_links()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from public.branches b where b.id = new.branch_id and b.organization_id = new.organization_id) then raise exception 'invalid branch'; end if;
  return new;
end $$;
create trigger students_validate_tenant before insert or update on public.students for each row execute function public.validate_student_tenant_links();

create or replace function public.validate_enrollment_tenant_links()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from public.students x where x.id=new.student_id and x.organization_id=new.organization_id) then raise exception 'invalid student'; end if;
  if not exists(select 1 from public.branches x where x.id=new.branch_id and x.organization_id=new.organization_id) then raise exception 'invalid branch'; end if;
  if not exists(select 1 from public.academic_years x where x.id=new.academic_year_id and x.organization_id=new.organization_id) then raise exception 'invalid academic year'; end if;
  if not exists(select 1 from public.classes x where x.id=new.class_id and x.organization_id=new.organization_id) then raise exception 'invalid class'; end if;
  if new.stream_id is not null and not exists(select 1 from public.streams x where x.id=new.stream_id and x.organization_id=new.organization_id and x.class_id=new.class_id and x.branch_id=new.branch_id) then raise exception 'invalid stream'; end if;
  return new;
end $$;
create trigger enrollments_validate_tenant before insert or update on public.enrollments for each row execute function public.validate_enrollment_tenant_links();

create or replace function public.validate_guardian_link_tenant()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from public.students x where x.id=new.student_id and x.organization_id=new.organization_id) then raise exception 'invalid student'; end if;
  if not exists(select 1 from public.guardians x where x.id=new.guardian_id and x.organization_id=new.organization_id) then raise exception 'invalid guardian'; end if;
  return new;
end $$;
create trigger student_guardians_validate_tenant before insert or update on public.student_guardians for each row execute function public.validate_guardian_link_tenant();

create or replace function public.validate_attendance_tenant_links()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from public.students x where x.id=new.student_id and x.organization_id=new.organization_id and x.branch_id=new.branch_id) then raise exception 'invalid student'; end if;
  if not exists(select 1 from public.enrollments x where x.id=new.enrollment_id and x.organization_id=new.organization_id and x.student_id=new.student_id) then raise exception 'invalid enrollment'; end if;
  if not exists(select 1 from public.academic_years x where x.id=new.academic_year_id and x.organization_id=new.organization_id) then raise exception 'invalid academic year'; end if;
  if not exists(select 1 from public.terms x where x.id=new.term_id and x.organization_id=new.organization_id and x.academic_year_id=new.academic_year_id) then raise exception 'invalid term'; end if;
  return new;
end $$;
create trigger attendance_validate_tenant before insert or update on public.attendance_records for each row execute function public.validate_attendance_tenant_links();

create or replace function public.validate_payment_tenant_links()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists(select 1 from public.students x where x.id=new.student_id and x.organization_id=new.organization_id and x.branch_id=new.branch_id) then raise exception 'invalid student'; end if;
  return new;
end $$;
create trigger payments_validate_tenant before insert or update on public.payments for each row execute function public.validate_payment_tenant_links();

create or replace function public.validate_result_score()
returns trigger language plpgsql set search_path = public as $$
declare max_score numeric(7,2);
begin
  select maximum_marks into max_score from public.assessments where id=new.assessment_id and organization_id=new.organization_id;
  if max_score is null then raise exception 'invalid assessment'; end if;
  if not exists(select 1 from public.students x where x.id=new.student_id and x.organization_id=new.organization_id) then raise exception 'invalid student'; end if;
  if new.score > max_score then raise exception 'score exceeds maximum marks'; end if;
  return new;
end $$;
create trigger assessment_results_validate before insert or update on public.assessment_results for each row execute function public.validate_result_score();

create or replace function public.current_membership(p_organization_id uuid)
returns public.organization_members
language sql stable security definer set search_path = public
as $$ select m.* from public.organization_members m where m.organization_id = p_organization_id and m.user_id = auth.uid() and m.status = 'ACTIVE' limit 1 $$;

create or replace function public.can_access_organization(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organization_members m where m.organization_id = p_organization_id and m.user_id = auth.uid() and m.status = 'ACTIVE') $$;

create or replace function public.can_access_branch(p_organization_id uuid, p_branch_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organization_members m where m.organization_id = p_organization_id and m.user_id = auth.uid() and m.status = 'ACTIVE' and (m.all_branches or exists(select 1 from public.member_branches mb where mb.member_id = m.id and mb.branch_id = p_branch_id and mb.organization_id = p_organization_id))) $$;

create or replace function public.has_permission(p_organization_id uuid, p_permission text)
returns boolean language plpgsql stable security definer set search_path = public
as $$
declare r public.member_role;
begin
  select role into r from public.organization_members where organization_id = p_organization_id and user_id = auth.uid() and status = 'ACTIVE';
  if r is null then return false; end if;
  if r in ('OWNER','SCHOOL_ADMIN') then return true; end if;
  return case p_permission
    when 'students.view' then r in ('HEAD_TEACHER','ACADEMIC_TEACHER','CLASS_TEACHER','TEACHER','BURSAR','ACCOUNTANT','RECEPTIONIST','STAFF','VIEWER')
    when 'students.manage' then r in ('HEAD_TEACHER','ACADEMIC_TEACHER','CLASS_TEACHER','RECEPTIONIST')
    when 'attendance.manage' then r in ('HEAD_TEACHER','ACADEMIC_TEACHER','CLASS_TEACHER','TEACHER')
    when 'fees.view' then r in ('HEAD_TEACHER','BURSAR','ACCOUNTANT','VIEWER')
    when 'fees.manage' then r in ('BURSAR','ACCOUNTANT')
    when 'results.manage' then r in ('HEAD_TEACHER','ACADEMIC_TEACHER','CLASS_TEACHER','TEACHER')
    when 'reports.view' then r in ('HEAD_TEACHER','ACADEMIC_TEACHER','BURSAR','ACCOUNTANT','VIEWER')
    when 'sms.send' then r in ('HEAD_TEACHER','RECEPTIONIST')
    else false end;
end $$;

create or replace function public.onboard_school(
  p_name text, p_registration_number text, p_phone_e164 text, p_email text,
  p_region text, p_district text, p_ward text, p_physical_address text,
  p_school_level text, p_ownership_type text, p_branch_name text,
  p_academic_year_name text, p_year_starts_on date, p_year_ends_on date,
  p_term_name text, p_term_starts_on date, p_term_ends_on date
) returns uuid language plpgsql security definer set search_path = public
as $$
declare v_org uuid; v_year uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if exists(select 1 from public.organization_members where user_id = auth.uid() and status = 'ACTIVE') then raise exception 'user already belongs to an organization'; end if;
  insert into public.organizations(name, registration_number, phone_e164, email, region, district, ward, physical_address, school_level, ownership_type, created_by)
  values (trim(p_name), nullif(trim(p_registration_number),''), p_phone_e164, lower(p_email), p_region, p_district, p_ward, p_physical_address, p_school_level, p_ownership_type, auth.uid()) returning id into v_org;
  insert into public.organization_members(organization_id,user_id,role,status,all_branches,joined_at) values(v_org,auth.uid(),'OWNER','ACTIVE',true,now());
  insert into public.branches(organization_id,name,code,active) values(v_org,coalesce(nullif(trim(p_branch_name),''),'Main Campus'),'MAIN',true);
  insert into public.academic_years(organization_id,name,starts_on,ends_on,is_active) values(v_org,p_academic_year_name,p_year_starts_on,p_year_ends_on,true) returning id into v_year;
  insert into public.terms(organization_id,academic_year_id,name,starts_on,ends_on,is_active) values(v_org,v_year,p_term_name,p_term_starts_on,p_term_ends_on,true);
  insert into public.subscriptions(organization_id,status,trial_ends_at) values(v_org,'TRIAL',now()+interval '30 days');
  insert into public.audit_logs(organization_id,actor_user_id,action,entity_type,entity_id) values(v_org,auth.uid(),'organization.created','organization',v_org::text);
  return v_org;
end $$;

-- RLS: every browser-accessible tenant table is organization scoped.
do $$
declare t text;
begin
  foreach t in array array['organization_members','branches','member_branches','academic_years','terms','classes','streams','guardians','students','student_guardians','enrollments','staff','subjects','teaching_assignments','attendance_records','fee_items','fee_structures','student_charges','payments','payment_allocations','assessments','assessment_results','grading_scales','grade_ranges','announcements','sms_settings','sms_messages','sms_recipients','subscriptions','custom_fields','custom_field_values','notifications','audit_logs','invitations'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy %I on public.%I for select using (public.can_access_organization(organization_id))', t || '_tenant_select', t);
  end loop;
end $$;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
create policy organizations_tenant_select on public.organizations for select using (public.can_access_organization(id));
create policy organizations_admin_update on public.organizations for update using (public.has_permission(id,'settings.manage')) with check (public.has_permission(id,'settings.manage'));

alter table public.profiles enable row level security;
create policy profiles_self_select on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

alter table public.sms_provider_credentials enable row level security;
alter table public.sms_provider_credentials force row level security;
-- No user policy: only trusted server/Edge Function service-role code can read credentials.

create policy students_manage on public.students for all using (public.has_permission(organization_id,'students.manage') and public.can_access_branch(organization_id,branch_id)) with check (public.has_permission(organization_id,'students.manage') and public.can_access_branch(organization_id,branch_id));
create policy guardians_manage on public.guardians for all using (public.has_permission(organization_id,'students.manage')) with check (public.has_permission(organization_id,'students.manage'));
create policy student_guardians_manage on public.student_guardians for all using (public.has_permission(organization_id,'students.manage')) with check (public.has_permission(organization_id,'students.manage'));
create policy enrollments_manage on public.enrollments for all using (public.has_permission(organization_id,'students.manage') and public.can_access_branch(organization_id,branch_id)) with check (public.has_permission(organization_id,'students.manage') and public.can_access_branch(organization_id,branch_id));
create policy attendance_manage on public.attendance_records for all using (public.has_permission(organization_id,'attendance.manage') and public.can_access_branch(organization_id,branch_id)) with check (public.has_permission(organization_id,'attendance.manage') and public.can_access_branch(organization_id,branch_id));
create policy payments_manage on public.payments for insert with check (public.has_permission(organization_id,'fees.manage') and public.can_access_branch(organization_id,branch_id) and recorded_by = auth.uid());
create policy charges_manage on public.student_charges for all using (public.has_permission(organization_id,'fees.manage')) with check (public.has_permission(organization_id,'fees.manage'));
create policy assessments_manage on public.assessments for all using (public.has_permission(organization_id,'results.manage') and public.can_access_branch(organization_id,branch_id)) with check (public.has_permission(organization_id,'results.manage') and public.can_access_branch(organization_id,branch_id));
create policy results_manage on public.assessment_results for all using (public.has_permission(organization_id,'results.manage')) with check (public.has_permission(organization_id,'results.manage'));
create policy notifications_self_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Replace broad organization reads with branch- or user-scoped policies where required.
drop policy students_tenant_select on public.students;
create policy students_branch_select on public.students for select using (public.can_access_branch(organization_id, branch_id));
drop policy enrollments_tenant_select on public.enrollments;
create policy enrollments_branch_select on public.enrollments for select using (public.can_access_branch(organization_id, branch_id));
drop policy attendance_records_tenant_select on public.attendance_records;
create policy attendance_branch_select on public.attendance_records for select using (public.can_access_branch(organization_id, branch_id));
drop policy payments_tenant_select on public.payments;
create policy payments_branch_select on public.payments for select using (public.has_permission(organization_id,'fees.view') and public.can_access_branch(organization_id, branch_id));
drop policy assessments_tenant_select on public.assessments;
create policy assessments_branch_select on public.assessments for select using (public.can_access_branch(organization_id, branch_id));
drop policy guardians_tenant_select on public.guardians;
create policy guardians_branch_select on public.guardians for select using (
  exists(select 1 from public.student_guardians sg join public.students s on s.id = sg.student_id where sg.guardian_id = guardians.id and public.can_access_branch(s.organization_id, s.branch_id))
);
drop policy student_guardians_tenant_select on public.student_guardians;
create policy student_guardians_branch_select on public.student_guardians for select using (
  exists(select 1 from public.students s where s.id = student_guardians.student_id and public.can_access_branch(s.organization_id, s.branch_id))
);
drop policy assessment_results_tenant_select on public.assessment_results;
create policy results_branch_select on public.assessment_results for select using (
  exists(select 1 from public.assessments a where a.id = assessment_results.assessment_id and public.can_access_branch(a.organization_id, a.branch_id))
);
drop policy payment_allocations_tenant_select on public.payment_allocations;
create policy allocations_branch_select on public.payment_allocations for select using (
  exists(select 1 from public.payments p where p.id = payment_allocations.payment_id and public.can_access_branch(p.organization_id, p.branch_id))
);
drop policy notifications_tenant_select on public.notifications;
create policy notifications_self_select on public.notifications for select using (user_id = auth.uid());
drop policy audit_logs_tenant_select on public.audit_logs;
create policy audit_logs_admin_select on public.audit_logs for select using (public.has_permission(organization_id,'settings.manage'));
create policy audit_logs_append on public.audit_logs for insert with check (actor_user_id = auth.uid() and public.can_access_organization(organization_id));

-- Organization owners and school administrators maintain school configuration.
do $$
declare t text;
begin
  foreach t in array array['branches','member_branches','academic_years','terms','classes','streams','staff','subjects','teaching_assignments','fee_items','fee_structures','grading_scales','grade_ranges','custom_fields','custom_field_values','invitations'] loop
    execute format('create policy %I on public.%I for all using (public.has_permission(organization_id,''settings.manage'')) with check (public.has_permission(organization_id,''settings.manage''))', t || '_admin_manage', t);
  end loop;
end $$;

create policy announcements_manage on public.announcements for all using (public.has_permission(organization_id,'sms.send')) with check (public.has_permission(organization_id,'sms.send'));
create policy sms_settings_admin_update on public.sms_settings for update using (public.has_permission(organization_id,'settings.manage')) with check (public.has_permission(organization_id,'settings.manage') and updated_by = auth.uid());
create policy sms_messages_send on public.sms_messages for insert with check (public.has_permission(organization_id,'sms.send') and created_by = auth.uid());
create policy organization_members_admin_manage on public.organization_members for all using (public.has_permission(organization_id,'team.manage')) with check (public.has_permission(organization_id,'team.manage'));

alter table public.subscription_plans enable row level security;
create policy subscription_plans_read on public.subscription_plans for select to authenticated using (active);

-- Platform administrators are deliberately separate from school membership.
create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('PLATFORM_ADMIN','SUPPORT_READONLY')),
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
alter table public.platform_admins force row level security;
create policy platform_admin_self on public.platform_admins for select using (user_id = auth.uid());

-- Private storage buckets and ownership-safe object paths.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('school-assets','school-assets',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.safe_uuid(value text)
returns uuid language plpgsql immutable as $$
begin return value::uuid; exception when invalid_text_representation then return null; end $$;

create policy school_assets_select on storage.objects for select to authenticated
using (bucket_id = 'school-assets' and public.can_access_organization(public.safe_uuid((storage.foldername(name))[1])));
create policy school_assets_insert on storage.objects for insert to authenticated
with check (bucket_id = 'school-assets' and public.can_access_organization(public.safe_uuid((storage.foldername(name))[1])));
create policy school_assets_update on storage.objects for update to authenticated
using (bucket_id = 'school-assets' and public.can_access_organization(public.safe_uuid((storage.foldername(name))[1])))
with check (bucket_id = 'school-assets' and public.can_access_organization(public.safe_uuid((storage.foldername(name))[1])));

-- Common indexes for tenant-scoped pagination.
create index organization_members_user_idx on public.organization_members(user_id, status);
create index branches_org_active_idx on public.branches(organization_id, active);
create index staff_org_branch_idx on public.staff(organization_id, branch_id);
create index assessments_context_idx on public.assessments(organization_id, academic_year_id, term_id, class_id, subject_id);
create index sms_messages_org_time_idx on public.sms_messages(organization_id, created_at desc);

revoke all on function public.onboard_school(text,text,text,text,text,text,text,text,text,text,text,text,date,date,text,date,date) from public;
grant execute on function public.onboard_school(text,text,text,text,text,text,text,text,text,text,text,text,date,date,text,date,date) to authenticated;

