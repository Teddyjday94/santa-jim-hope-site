create table if not exists public.santa_google_calendar_connections (
  site_id uuid primary key references public.sites(id) on delete cascade,
  calendar_id text not null default 'primary',
  access_token text not null,
  refresh_token text,
  access_token_expires_at timestamptz,
  granted_scope text,
  connected_by uuid references auth.users(id) on delete set null,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.santa_google_oauth_states (
  state text primary key,
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.santa_google_calendar_connections enable row level security;
alter table public.santa_google_oauth_states enable row level security;

revoke all on table public.santa_google_calendar_connections from anon, authenticated;
revoke all on table public.santa_google_oauth_states from anon, authenticated;
grant select, insert, update, delete on table public.santa_google_calendar_connections to service_role;
grant select, insert, update, delete on table public.santa_google_oauth_states to service_role;

create index if not exists santa_google_oauth_states_expires_idx
  on public.santa_google_oauth_states(expires_at);
