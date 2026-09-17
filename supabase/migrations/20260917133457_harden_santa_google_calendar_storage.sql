create index if not exists santa_google_calendar_connections_connected_by_idx
  on public.santa_google_calendar_connections(connected_by);

create index if not exists santa_google_oauth_states_site_id_idx
  on public.santa_google_oauth_states(site_id);

create index if not exists santa_google_oauth_states_user_id_idx
  on public.santa_google_oauth_states(user_id);

create policy "Santa Calendar service access"
on public.santa_google_calendar_connections
for all
to service_role
using (true)
with check (true);

create policy "Santa OAuth state service access"
on public.santa_google_oauth_states
for all
to service_role
using (true)
with check (true);
