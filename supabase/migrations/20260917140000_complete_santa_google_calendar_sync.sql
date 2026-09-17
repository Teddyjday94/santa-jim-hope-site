alter table public.santa_booking_requests
  add column if not exists google_event_id text,
  add column if not exists calendar_sync_status text not null default 'not_connected',
  add column if not exists calendar_sync_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'santa_booking_calendar_sync_status_check'
      and conrelid = 'public.santa_booking_requests'::regclass
  ) then
    alter table public.santa_booking_requests
      add constraint santa_booking_calendar_sync_status_check
      check (calendar_sync_status in ('not_connected', 'pending', 'synced', 'error'));
  end if;
end
$$;

create unique index if not exists santa_booking_google_event_id_unique
  on public.santa_booking_requests(site_id, google_event_id)
  where google_event_id is not null;
