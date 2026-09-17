-- CareConnect Clinic Appointment System
-- Run this file in the Supabase SQL Editor before starting the backend.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- Login accounts and roles
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  role varchar(20) not null check (
    role in ('patient', 'receptionist', 'doctor', 'nurse', 'manager', 'admin')
  ),
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  phone varchar(30),
  is_active boolean not null default true,
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  token_version integer not null default 0,
  created_at timestamptz not null default now()
);

-- Patient personal information
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  gender varchar(30) not null,
  date_of_birth date not null check (date_of_birth <= current_date),
  phone varchar(30) not null,
  email varchar(255),
  residential_address text not null,
  blood_group varchar(5) not null check (
    blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  emergency_contact_name varchar(160) not null,
  emergency_contact_phone varchar(30) not null,
  registration_date date not null default current_date
);

-- Doctor professional information
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  first_name varchar(80) not null,
  last_name varchar(80) not null,
  specialization varchar(120) not null,
  phone varchar(30),
  email varchar(255) unique not null,
  consultation_room varchar(40),
  availability_status varchar(20) not null default 'available' check (
    availability_status in ('available', 'unavailable', 'on_leave')
  )
);

-- day_of_week: 1 = Monday, 7 = Sunday
create table if not exists public.doctor_availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer not null default 30 check (
    slot_duration_minutes between 10 and 240
  ),
  check (end_time > start_time)
);

-- Appointment date and time are separate to match the project report.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.doctors(id),
  appointment_date date not null,
  appointment_time time not null,
  duration_minutes integer not null default 30 check (
    duration_minutes between 10 and 240
  ),
  reason_for_visit text not null,
  status varchar(20) not null default 'scheduled' check (
    status in ('scheduled', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  created_by uuid references public.users(id),
  cancellation_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.vital_signs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique not null references public.appointments(id) on delete cascade,
  recorded_by uuid not null references public.users(id),
  temperature_c numeric(4,1),
  systolic_bp integer,
  diastolic_bp integer,
  pulse_rate integer,
  respiratory_rate integer,
  oxygen_saturation integer check (
    oxygen_saturation is null or oxygen_saturation between 0 and 100
  ),
  weight_kg numeric(6,2),
  height_cm numeric(6,2),
  observations text,
  recorded_at timestamptz not null default now()
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique not null references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id),
  doctor_id uuid not null references public.doctors(id),
  diagnosis text not null,
  treatment text,
  prescription text,
  doctor_notes text,
  visit_date date not null default current_date
);

-- Notifications are shown inside the frontend application.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  notification_type varchar(30) not null,
  title varchar(160) not null,
  message text not null,
  show_at timestamptz not null default now(),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action varchar(100) not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_index
  on public.appointments (appointment_date);
create index if not exists appointments_doctor_index
  on public.appointments (doctor_id);
create index if not exists appointments_patient_index
  on public.appointments (patient_id);
create index if not exists medical_records_patient_index
  on public.medical_records (patient_id);

-- Database-level booking guards. The application still checks for conflicts to
-- return a friendly message, but these constraints close the check-then-insert
-- race so two concurrent requests can never double-book the same doctor or
-- patient for overlapping active appointments.
alter table public.appointments
  drop constraint if exists appointments_no_doctor_overlap;
alter table public.appointments
  add constraint appointments_no_doctor_overlap
  exclude using gist (
    doctor_id with =,
    tsrange(
      appointment_date + appointment_time,
      appointment_date + appointment_time + make_interval(mins => duration_minutes),
      '[)'
    ) with &&
  )
  where (status in ('scheduled', 'checked_in'));

alter table public.appointments
  drop constraint if exists appointments_no_patient_overlap;
alter table public.appointments
  add constraint appointments_no_patient_overlap
  exclude using gist (
    patient_id with =,
    tsrange(
      appointment_date + appointment_time,
      appointment_date + appointment_time + make_interval(mins => duration_minutes),
      '[)'
    ) with &&
  )
  where (status in ('scheduled', 'checked_in'));

-- The frontend must use the Express API. It must not query these tables directly.
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_availability enable row level security;
alter table public.appointments enable row level security;
alter table public.vital_signs enable row level security;
alter table public.medical_records enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Replace a doctor's availability atomically: the delete and insert run inside
-- the same transaction, so a failure can never leave the doctor with no slots.
create or replace function public.set_doctor_availability(
  p_doctor_id uuid,
  p_periods jsonb
)
returns setof public.doctor_availability
language plpgsql
as $$
begin
  delete from public.doctor_availability where doctor_id = p_doctor_id;

  return query
    insert into public.doctor_availability (
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      slot_duration_minutes
    )
    select
      p_doctor_id,
      (period ->> 'day_of_week')::integer,
      (period ->> 'start_time')::time,
      (period ->> 'end_time')::time,
      coalesce((period ->> 'slot_duration_minutes')::integer, 30)
    from jsonb_array_elements(p_periods) as period
    returning *;
end;
$$;
