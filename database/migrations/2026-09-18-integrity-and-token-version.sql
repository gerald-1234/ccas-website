-- Apply this migration to an existing CareConnect database.
-- It adds the booking integrity guards, the atomic availability function and
-- the token_version column used to invalidate JWTs after a password change.

create extension if not exists btree_gist;

alter table public.users
  add column if not exists token_version integer not null default 0;

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
