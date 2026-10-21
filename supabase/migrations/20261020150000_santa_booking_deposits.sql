-- Deposits: when Santa Jim accepts a request and a deposit amount is set,
-- the booking stays pending with deposit_status 'awaiting' until the family
-- pays through Stripe; the santa-deposit Edge Function then confirms it.
-- A deposit of 0 keeps the old accept-and-confirm behaviour.

alter table public.santa_schedule_settings
  add column if not exists deposit_cents integer not null default 0
    check (deposit_cents >= 0 and deposit_cents <= 100000),
  add column if not exists deposit_hold_hours integer not null default 48
    check (deposit_hold_hours >= 1 and deposit_hold_hours <= 336);

alter table public.santa_booking_requests
  add column if not exists deposit_status text not null default 'not_required'
    check (deposit_status in ('not_required', 'awaiting', 'paid')),
  add column if not exists deposit_amount_cents integer
    check (deposit_amount_cents is null or deposit_amount_cents > 0),
  add column if not exists deposit_token text,
  add column if not exists deposit_requested_at timestamptz,
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists santa_booking_requests_deposit_token_key
  on public.santa_booking_requests (deposit_token)
  where deposit_token is not null;

-- The table uses column-level grants. The portal (site members, limited by
-- RLS) reads deposit state and records a deposit request; only the
-- santa-deposit Edge Function (service role) marks a deposit paid.
-- anon gets nothing new, so deposit tokens are never publicly readable.
grant select (deposit_status, deposit_amount_cents, deposit_token, deposit_requested_at,
              deposit_paid_at, stripe_checkout_session_id, stripe_payment_intent_id)
  on public.santa_booking_requests to authenticated;
grant update (deposit_status, deposit_amount_cents, deposit_token, deposit_requested_at)
  on public.santa_booking_requests to authenticated;

-- The booking form tells families about the deposit up front.
grant select (deposit_cents, deposit_hold_hours) on public.santa_schedule_settings to anon, authenticated;
grant update (deposit_cents, deposit_hold_hours) on public.santa_schedule_settings to authenticated;
