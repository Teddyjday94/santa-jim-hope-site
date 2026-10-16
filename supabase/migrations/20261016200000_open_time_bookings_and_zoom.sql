-- Photo sessions keep fixed-length slots inside Santa Jim's default hours.
-- Every other experience now stores the start and end time the family
-- chooses, with no service duration, buffer, window or slot alignment.
-- Also adds the Zoom call experience.

create or replace function private.santa_prepare_booking()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_settings public.santa_schedule_settings%rowtype;
  v_service public.santa_services%rowtype;
  v_rule public.santa_day_rules%rowtype;
  v_local_start timestamp;
  v_local_end timestamp;
  v_local_block_end timestamp;
  v_local_date date;
  v_local_time time;
  v_rule_mode text := 'normal';
  v_window jsonb;
  v_window_ok boolean := false;
  v_fixed_slot boolean;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pending' then
      raise exception 'New public booking requests must start as pending';
    end if;
    new.google_event_id := null;
    new.calendar_sync_status := 'not_connected';
    new.calendar_sync_error := null;
  end if;

  select * into v_settings from public.santa_schedule_settings where site_id = new.site_id;
  if not found then raise exception 'Schedule settings are not configured for this site'; end if;

  select * into v_service from public.santa_services
  where site_id = new.site_id and slug = new.service_slug and active = true;
  if not found then raise exception 'Selected service is unavailable'; end if;

  update public.santa_booking_requests
    set status = 'expired', updated_at = now()
  where site_id = new.site_id
    and status = 'pending'
    and hold_expires_at is not null
    and hold_expires_at <= now()
    and id <> coalesce(new.id, gen_random_uuid());

  v_local_start := new.starts_at at time zone v_settings.timezone;
  v_local_date := v_local_start::date;
  v_local_time := v_local_start::time;
  v_fixed_slot := new.service_slug = 'photo-session';

  if v_local_date < v_settings.season_start or v_local_date > v_settings.season_end then
    raise exception 'Selected date is outside the booking season';
  end if;

  select * into v_rule from public.santa_day_rules
  where site_id = new.site_id and date = v_local_date;
  if found then v_rule_mode := v_rule.mode; end if;

  if v_rule_mode = 'blocked' then raise exception 'Selected date is blocked'; end if;
  if v_rule_mode = 'photos_only' and new.service_slug <> 'photo-session' then
    raise exception 'Only photo sessions are available on this date';
  end if;
  if v_rule_mode = 'custom' and not exists (
    select 1 from jsonb_array_elements_text(v_rule.allowed_service_slugs) value
    where value = new.service_slug
  ) then
    raise exception 'Selected service is unavailable on this custom date';
  end if;

  if v_fixed_slot then
    new.ends_at := new.starts_at + make_interval(mins => v_service.duration_minutes);
    new.blocked_until := new.ends_at + make_interval(mins => v_service.buffer_minutes);
  else
    if new.ends_at is null or new.ends_at <= new.starts_at then
      raise exception 'End time must be after the start time';
    end if;
    new.blocked_until := new.ends_at;
  end if;
  new.hold_expires_at := case when new.status = 'pending' then now() + make_interval(mins => v_settings.pending_hold_minutes) else null end;
  new.updated_at := now();

  v_local_end := new.ends_at at time zone v_settings.timezone;
  v_local_block_end := new.blocked_until at time zone v_settings.timezone;
  new.local_date := v_local_date;
  new.local_start_time := v_local_time;
  new.local_end_time := v_local_end::time;
  new.local_blocked_until_time := v_local_block_end::time;

  if v_local_block_end::date <> v_local_date then
    raise exception 'Bookings must end on the same day they start';
  end if;

  if not v_fixed_slot then
    return new;
  end if;

  if v_rule_mode = 'custom' then
    for v_window in select * from jsonb_array_elements(v_rule.windows)
    loop
      if v_local_time >= (v_window->>'start')::time
         and v_local_block_end::time <= (v_window->>'end')::time then
        v_window_ok := true;
        exit;
      end if;
    end loop;
  else
    v_window_ok := v_local_time >= v_settings.default_start_time
      and v_local_block_end::time <= v_settings.default_end_time;
  end if;

  if not v_window_ok then raise exception 'Selected time does not fit inside an available window'; end if;

  if (extract(hour from v_local_start) * 60 + extract(minute from v_local_start))::integer % v_settings.slot_step_minutes <> 0 then
    raise exception 'Selected start time is not aligned to the booking interval';
  end if;

  return new;
end;
$function$;

drop function if exists public.create_santa_booking(uuid, text, date, time without time zone, text, text, text, text, integer, text);

create function public.create_santa_booking(
  p_site_id uuid,
  p_service_slug text,
  p_local_date date,
  p_local_start_time time without time zone,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text default ''::text,
  p_event_location text default ''::text,
  p_guest_count integer default null::integer,
  p_notes text default ''::text,
  p_local_end_time time without time zone default null
)
 returns void
 language plpgsql
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_settings public.santa_schedule_settings%rowtype;
  v_duration integer;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  select * into v_settings
  from public.santa_schedule_settings
  where site_id = p_site_id;

  if not found then
    raise exception 'Schedule settings are not configured for this site';
  end if;

  v_starts_at := (p_local_date + p_local_start_time) at time zone v_settings.timezone;

  if p_local_end_time is not null then
    v_ends_at := (p_local_date + p_local_end_time) at time zone v_settings.timezone;
  else
    -- Callers that do not send an end time (photo slots, older site builds)
    -- fall back to the service length; the trigger finalizes photo slots.
    select duration_minutes into v_duration
    from public.santa_services
    where site_id = p_site_id and slug = p_service_slug;
    v_ends_at := v_starts_at + make_interval(mins => coalesce(v_duration, 60));
  end if;

  insert into public.santa_booking_requests (
    site_id,
    service_slug,
    customer_name,
    customer_email,
    customer_phone,
    event_location,
    guest_count,
    notes,
    starts_at,
    ends_at,
    blocked_until,
    status
  ) values (
    p_site_id,
    p_service_slug,
    trim(p_customer_name),
    trim(p_customer_email),
    coalesce(trim(p_customer_phone), ''),
    trim(p_event_location),
    p_guest_count,
    coalesce(p_notes, ''),
    v_starts_at,
    v_ends_at,
    v_ends_at,
    'pending'
  );
end;
$function$;

grant execute on function public.create_santa_booking(uuid, text, date, time without time zone, text, text, text, text, integer, text, time without time zone) to anon, authenticated, service_role;

insert into public.santa_services (site_id, slug, name, duration_minutes, buffer_minutes, active, sort_order)
values ('a0d14a7f-7e08-4042-a6c9-0f83c03eefb3', 'zoom-call', 'Zoom call with Santa', 30, 0, true, 55)
on conflict do nothing;
