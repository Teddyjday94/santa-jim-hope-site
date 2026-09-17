# Santa Booking Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Santa Jim Hope free-form date/time inquiry with a request-and-approval scheduler backed by Supabase, while routing all development notifications to the existing business email.

**Architecture:** Keep `InquiryForm` as the public entry point, but move availability decisions into a pure scheduler rules module that is testable without React. Persist services, season settings, day rules, and booking requests in Supabase with RLS; use Supabase Auth for the private admin screen. Google Calendar remains an adapter seam for the next integration step, so the core scheduler does not depend on OAuth.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node test runner, Supabase Postgres/Auth/Data API, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-16-santa-booking-scheduler-design.md`

## Global Constraints

- Keep the existing Santa Jim Hope visual language and existing request section.
- Development/test notifications must go to `thomasdbiz26@gmail.com`, not the client.
- Public users may never list booking rows or customer PII.
- Admin access must require Supabase authentication plus site/admin authorization.
- Never expose a Supabase secret/service-role key to browser code.
- Date modes are exactly `normal`, `photos_only`, `blocked`, and `custom`.
- Booking states are exactly `pending`, `confirmed`, `declined`, `cancelled`, and `expired`.
- Pending and confirmed requests block overlapping slots; declined/cancelled/expired requests do not.
- Season dates, hours, durations, buffers, and hold duration are editable settings rather than guessed constants.

---

### Task 1: Pure scheduler rules

**Files:**
- Create: `lib/santa-scheduler.mjs`
- Create: `lib/santa-scheduler.d.mts`
- Create: `tests/santa-scheduler.test.mjs`

**Interfaces:**
- Produces `getAllowedServicesForDate`, `buildAvailableSlots`, `intervalsOverlap`, and `validateRequestedSlot`.
- Slot inputs use local `YYYY-MM-DD` dates and `HH:mm` times; outputs keep those calendar values stable and do not rely on browser timezone parsing.

- [ ] Write failing tests proving blocked days return no slots, photos-only dates allow only `photo-session`, custom days honor configured windows/services, season bounds are enforced, and active booking intervals remove overlapping slots.
- [ ] Run `node --test tests/santa-scheduler.test.mjs`; expected failure is missing scheduler exports.
- [ ] Implement only the pure scheduling functions needed for those cases.
- [ ] Re-run the scheduler test and existing `node --test tests/*.test.mjs`; expected all pass.
- [ ] Commit as `feat: add Santa scheduling rules`.

### Task 2: Scheduler-controlled customer form

**Files:**
- Modify: `components/santa/inquiry-form.tsx`
- Modify: `lib/booking-validation.mjs`
- Modify: `lib/booking-validation.d.mts`
- Modify: `tests/booking-validation.test.mjs`
- Modify: `tests/inquiry-form.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Customer form keeps `eventType`, `preferredDate`, `startTime`, and derived `endTime` in its submitted payload.
- Date/time choices come from scheduler availability rather than free-form time inputs.

- [ ] Update tests first to require a scheduler-style experience/date/time flow and to remove the requirement for customer-entered `endTime`.
- [ ] Run affected tests and confirm they fail against the current form/validator.
- [ ] Replace the free-form start/end inputs with service, eligible date, and available-time controls, while retaining name/email/phone/location/guest count/notes fields.
- [ ] Add theme-matched scheduler cards, selected states, availability messaging, and responsive mobile layout to `globals.css`.
- [ ] Re-run all Node tests.
- [ ] Commit as `feat: add smart booking request flow`.

### Task 3: Supabase scheduler schema and Santa site registration

**Database:** Side Quest Client Portal project `taskvfzqgpqxpdifmxru`.

**Interfaces:**
- Creates `santa_services`, `santa_schedule_settings`, `santa_day_rules`, and `santa_booking_requests` keyed by `site_id`.
- Registers a `Santa Jim Hope` client/site if absent and grants the existing agency admin account site membership.

- [ ] Apply one migration that creates constrained tables, indexes, RLS policies, minimal grants, and overlap protection.
- [ ] Seed Santa services and a Santa client/site by slug using generated UUIDs and conflict-safe inserts.
- [ ] Add the existing agency admin user to `site_members` for the Santa site.
- [ ] Query back the site, settings, services, and policies to verify the schema.
- [ ] Run Supabase security and performance advisors and fix scheduler-related findings before continuing.

### Task 4: Supabase client/auth and data APIs

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/supabase-browser.ts`
- Create: `lib/santa-booking-api.ts`
- Create: `app/api/santa/availability/route.ts`
- Create: `app/api/santa/bookings/route.ts`
- Create: `app/api/santa/admin/bookings/route.ts`
- Create: `app/api/santa/admin/day-rules/route.ts`
- Create: `tests/santa-api-contract.test.mjs`

**Interfaces:**
- `GET /api/santa/availability?service=<slug>&date=<YYYY-MM-DD>` returns verified slots and derived end times.
- `POST /api/santa/bookings` revalidates availability server-side and creates a pending request; it then sends the existing FormSubmit notification to `thomasdbiz26@gmail.com`.
- Admin endpoints require a valid Supabase bearer token and authorized membership/admin role.

- [ ] Write contract tests that inspect routes/source for required validation and authorization boundaries before adding route implementations.
- [ ] Implement browser Supabase client using only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Implement server route handlers using the Data API with publishable-key/RLS semantics and authenticated bearer tokens for admin operations.
- [ ] Revalidate each requested slot immediately before insertion and return HTTP 409 when a slot is stale.
- [ ] Keep FormSubmit notification recipient fixed to the business test email during development.
- [ ] Run all Node tests.
- [ ] Commit as `feat: persist Santa booking requests`.

### Task 5: Private Santa admin scheduler

**Files:**
- Create: `app/santa-admin/page.tsx`
- Create: `components/santa/admin-dashboard.tsx`
- Modify: `app/globals.css`
- Create: `tests/santa-admin.test.mjs`

**Interfaces:**
- Magic-link login uses the same Supabase Auth account as the Side Quest admin.
- Dashboard lists pending requests and supports Accept/Decline.
- Calendar/day editor supports Normal, Photos Only, Blocked, and Custom modes.

- [ ] Write source/contract tests for protected admin behavior and all four day modes.
- [ ] Build the magic-link sign-in state and authenticated admin dashboard.
- [ ] Add request cards with Accept/Decline and an availability/day-rule editor.
- [ ] Ensure only authenticated authorized users receive booking PII from admin APIs.
- [ ] Run all Node tests.
- [ ] Commit as `feat: add Santa booking admin dashboard`.

### Task 6: Vercel configuration and preview verification

**Configuration:**
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Preview/Production on the Santa Jim Vercel project.
- Keep any client-facing notification destination unchanged until the user explicitly switches from the test business email.

- [ ] Push the completed feature branch and allow/create a Vercel preview deployment.
- [ ] Inspect build output for TypeScript/Next.js failures and fix any issues.
- [ ] Verify public booking UI on desktop/mobile preview, including Photos Only and Blocked behavior.
- [ ] Verify a test request produces a pending database row and routes notification only to `thomasdbiz26@gmail.com`.
- [ ] Verify admin login, Accept, Decline, and day-mode changes against the preview.
- [ ] Re-run full available verification and document the Google Calendar OAuth step as the next integration checkpoint.
