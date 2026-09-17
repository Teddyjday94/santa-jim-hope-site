# Santa Jim Hope Booking Scheduler Design

## Goal

Turn the existing Santa Jim Hope inquiry form into a request-and-approval scheduler without redesigning the rest of the site. Customers should only be able to request services, dates, and times that Jim has made eligible, while Jim retains final approval over every booking.

## Customer flow

The existing request section remains the entry point and keeps the site's current Christmas styling.

1. Customer chooses an experience: Home Visit, Birthday Surprise, Corporate Event, School or Group, Community Celebration, or Photo Session.
2. The scheduler shows only eligible dates for that experience.
3. The customer chooses one available start time. End time is calculated from the service duration instead of typed manually.
4. The existing contact, location, guest-count, and notes fields remain part of the request.
5. Submission creates a `pending` booking request and temporarily reserves the requested time.
6. The success state clearly says the request is awaiting Santa Jim's approval rather than implying the booking is confirmed.

A pending request blocks overlapping requests until it is accepted, declined, cancelled, or expires under the configured hold policy.

## Availability model

Jim controls a default booking season and default daily operating hours. These values are settings, not hard-coded assumptions, because the current Santa Jim site does not contain confirmed season dates or hours.

Each calendar date has one of four modes:

- `normal`: all services enabled for that date may be requested.
- `photos_only`: only Photo Session may be requested for the date.
- `blocked`: no bookings may be requested.
- `custom`: Jim chooses the allowed services and one or more availability windows for that date.

Service definitions include a duration and optional buffer. Slot generation must reject any slot that extends beyond the day's availability window or overlaps a pending/confirmed booking, manual block, or future Google Calendar busy period.

## Owner/admin flow

A private admin area will provide two primary views.

### Booking requests

Jim can see pending, confirmed, and declined requests with customer contact information, service, date, time, location, guest count, and notes. Pending requests have Accept and Decline actions.

Accept changes the request to `confirmed`. Decline changes it to `declined` and immediately releases the held time.

### Availability calendar

Jim can select a day and set it to Normal, Photos Only, Blocked, or Custom. For custom days he can set allowed services and availability windows. He can also edit season-level defaults such as booking window, normal operating hours, service durations, buffers, and pending-hold length.

## Data model

Use Supabase as the persistent booking store, keyed to a site record so the design can fit the existing Side Quest Client Portal's multi-client model without mixing rows between clients.

### `santa_services`

- `id`
- `site_id`
- `slug`
- `name`
- `duration_minutes`
- `buffer_minutes`
- `active`
- `sort_order`

### `santa_schedule_settings`

One row per Santa site:

- `site_id`
- `season_start`
- `season_end`
- `default_start_time`
- `default_end_time`
- `pending_hold_minutes`
- `timezone`

### `santa_day_rules`

- `id`
- `site_id`
- `date`
- `mode` (`normal`, `photos_only`, `blocked`, `custom`)
- `allowed_service_slugs`
- `windows` as validated JSON time ranges

Unique on `(site_id, date)`.

### `santa_booking_requests`

- `id`
- `site_id`
- `service_slug`
- `customer_name`
- `customer_email`
- `customer_phone`
- `event_location`
- `guest_count`
- `notes`
- `starts_at`
- `ends_at`
- `status` (`pending`, `confirmed`, `declined`, `cancelled`, `expired`)
- `hold_expires_at`
- `google_event_id` nullable for later Calendar sync
- `created_at`
- `updated_at`

Database constraints and server-side checks must prevent active overlapping holds/confirmed bookings for the same site.

## Security

All exposed Supabase tables use Row Level Security and explicit grants.

The public site may read only the minimum schedule data needed to render availability and may create a booking request only through validated server-side code. Public users must never be able to list booking requests or read customer information.

Admin reads and mutations require an authenticated user who is authorized for the Santa site's `site_id` through the existing client/site membership model, with agency admins also allowed. Authorization must not rely on user-editable metadata.

No Supabase secret/service-role key may be shipped to the browser.

## Google Calendar integration

Calendar sync is an adapter behind the booking workflow rather than the source of truth for Santa-specific rules.

When connected later:

- Google free/busy periods are treated as conflicts during slot generation.
- Accepting a request creates a Calendar event and stores its event ID.
- Declining a pending request does not create a Calendar event.
- Cancelling a confirmed request can remove/cancel its linked Calendar event.
- Photos Only / Blocked / Custom rules continue to live in the scheduler database because Google Calendar does not express service eligibility.

The first scheduler implementation must keep these integration points clean but does not require customer-facing email copy or Calendar OAuth to be finalized before the booking UI and approval workflow are usable.

## Existing form changes

`components/santa/inquiry-form.tsx` remains the customer-facing entry point. The free-form Preferred Date, Start Time, and End Time inputs are replaced by scheduler-controlled date/time selection. Existing name, email, phone, location, guest count, notes, validation, loading, and success behavior are retained and adapted.

The current FormSubmit email delivery can remain as an additional notification during transition, but the database booking record becomes the authoritative request once the scheduler backend is connected.

## Error handling

- If availability cannot load, the form displays a clear retry state and does not accept an unverified time.
- Server-side submission revalidates the selected service/date/time immediately before insertion.
- If another request wins the slot first, the customer is told the time is no longer available and is returned to time selection.
- Admin Accept rechecks conflicts before confirmation.
- Calendar failures after approval are recorded and surfaced to the admin without silently losing the confirmed database booking.

## Testing

Use the repository's existing Node test suite and test-first workflow.

Required coverage includes:

- blocked dates return no slots;
- photos-only dates reject every non-photo service;
- custom dates expose only their configured services/windows;
- service duration plus buffer fits fully within a window;
- pending and confirmed intervals block overlapping slots;
- declined/expired requests release their slots;
- season bounds are enforced;
- server submission rejects stale or manipulated availability;
- existing inquiry fields and mobile layout continue to work;
- admin authorization prevents cross-site booking access.

## Delivery sequence

1. Add the pure scheduler rule engine and tests.
2. Upgrade the existing inquiry UI to service -> date -> time selection using those rules.
3. Add Supabase schema and secure server APIs for settings, availability, and pending requests.
4. Add the private admin booking/availability screens.
5. Verify mobile behavior and production build on a feature branch.
6. Connect Google Calendar and final email/SMS messaging as a follow-up integration without changing the core booking model.
