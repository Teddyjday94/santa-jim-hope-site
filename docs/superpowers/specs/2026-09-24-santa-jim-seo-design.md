# Santa Jim of Baton Rouge SEO Design

## Objective

Build a staging-safe local SEO system for the existing Santa Jim of Baton Rouge Next.js site without changing the approved visual design, removing existing booking/scheduler functionality, or exposing private admin routes to search engines.

Success means the public site clearly communicates to search engines that Santa Jim is a Baton Rouge-area Santa entertainer available for home visits, photo sessions, corporate events, schools/groups, community celebrations, and seasonal birthday appearances, while the temporary Vercel deployment remains non-indexable until the real client domain is connected.

## Current Site Context

The project is a Next.js 16 App Router site with existing routes for:

- `/`
- `/meet`
- `/experiences`
- `/gallery`
- `/faq`
- `/invite`
- Santa admin and API routes under private/admin paths

The site already has basic per-page `Metadata`, good descriptive image alt text, and strong visual content. The main SEO gaps are:

- no central canonical/base URL strategy
- no staging-versus-production indexing switch
- no generated sitemap/robots architecture
- no shared structured-data layer for the Santa business/entity
- no dedicated search landing pages for the main appearance types
- limited local-search wording around Baton Rouge and nearby service intent
- no regression tests protecting SEO behavior

## Scope

### In scope

1. Central SEO configuration.
2. Canonical URLs and `metadataBase`.
3. Staging-safe robots behavior.
4. XML sitemap generation.
5. Public-route metadata upgrades.
6. JSON-LD structured data.
7. Dedicated experience landing pages.
8. Homepage local-search improvements that preserve the current design.
9. Internal-link improvements.
10. Explicit noindex behavior for private/admin routes.
11. SEO regression tests and build verification.
12. Domain-launch procedure for switching from the Vercel hostname to the client domain.

### Out of scope

- changing the booking workflow or scheduler behavior
- redesigning the site
- changing Supabase data structures
- inventing certifications, insurance, background checks, reviews, awards, years of experience, or service areas that Jim has not confirmed
- buying or transferring a domain
- creating Google Business Profile, Search Console, or paid advertising accounts without a separate request
- generating dozens of thin location pages

## SEO Configuration Architecture

Create a small shared SEO configuration module, for example `lib/seo.ts`, as the single source of truth for:

- business name: `Santa Jim of Baton Rouge`
- default temporary site URL: `https://santa-jim-hope-site.vercel.app`
- environment-driven production site URL
- indexing enabled/disabled flag
- primary locale: `en_US`
- primary geography: Baton Rouge, Louisiana
- default social image
- public route list
- private/noindex route prefixes

Environment behavior:

```text
SITE_URL=https://santa-jim-hope-site.vercel.app
SEO_INDEX=false
```

When the real client domain is connected:

```text
SITE_URL=https://<client-domain>
SEO_INDEX=true
```

The implementation must also support Vercel environment variables safely when these values are not explicitly set. Temporary preview/staging deployments must not become indexable by accident.

## Metadata Strategy

Update root metadata to use a `metadataBase` built from the central SEO config. Every public page should receive:

- unique title
- unique meta description
- canonical URL
- Open Graph title/description/url/image
- Twitter card metadata
- locale information where supported
- robots behavior derived from the environment switch

Primary homepage intent:

- Santa for hire in Baton Rouge, Louisiana
- Santa Claus visits in Baton Rouge
- professional Santa appearances in Baton Rouge

The visible brand-forward hero wording can remain. Search relevance should be strengthened through supporting copy and metadata instead of replacing the site with keyword-heavy text.

## Public Route Indexing

Public/searchable routes:

- `/`
- `/meet`
- `/experiences`
- `/experiences/home-visits`
- `/experiences/birthday-surprises`
- `/experiences/corporate-events`
- `/experiences/schools-groups`
- `/experiences/community-celebrations`
- `/experiences/photo-sessions`
- `/gallery`
- `/faq`
- `/invite`

These routes should be included in the sitemap when indexing is enabled.

## Private Route Protection

Search engines must not index administrative or internal routes. At minimum, private behavior must cover:

- `/santa-admin`
- `/admin` if present
- `/invite` child/admin utility routes if any are introduced later
- `/api/*`
- authentication/invite utility routes that are not customer-facing landing pages

The public customer inquiry page `/invite` remains indexable. Internal admin routes must use explicit noindex metadata and should also be blocked in `robots.txt` when appropriate.

## Sitemap and Robots

Create App Router-native `app/sitemap.ts` and `app/robots.ts`.

### Staging behavior

When `SEO_INDEX=false`:

- `robots.txt` disallows all crawling
- page metadata emits `noindex, nofollow`
- sitemap may still be generated for verification but must not be advertised to crawlers from robots

### Production behavior

When `SEO_INDEX=true`:

- public routes are allowed
- private/admin/API paths are disallowed
- sitemap URL points to the production domain
- public page metadata emits index/follow directives

## Structured Data

Create reusable JSON-LD helpers/components rather than embedding unrelated schema separately on every page.

### Organization/business entity

Use a suitable combination of `Person`, `LocalBusiness`, and/or `ProfessionalService`-style schema based on what Schema.org supports cleanly for this use case. Do not claim a storefront address unless one is confirmed and publicly appropriate.

Include only verified attributes:

- `name`: Santa Jim of Baton Rouge
- `url`
- `image`
- `areaServed`: Baton Rouge, Louisiana
- service/appearance types derived from the existing site content

### WebSite/WebPage

Public pages should have consistent WebSite/WebPage references and stable IDs based on the canonical production URL.

### Service structured data

Dedicated experience routes should include `Service` structured data with Santa Jim as provider and Baton Rouge as the primary area served.

### Breadcrumbs

Experience detail pages should include `BreadcrumbList` schema:

Home → Experiences → Experience name

### FAQ schema

The existing FAQ content can be emitted as `FAQPage` structured data on `/faq`, using exactly the visible questions and answers rendered on that page.

## Experience Landing Pages

Generate dedicated experience pages from the existing experience content rather than duplicating hard-coded data in six separate files where possible.

Target routes:

- `/experiences/home-visits`
- `/experiences/birthday-surprises`
- `/experiences/corporate-events`
- `/experiences/schools-groups`
- `/experiences/community-celebrations`
- `/experiences/photo-sessions`

Each page should contain:

- unique page title and meta description
- one clear H1 tied to the experience type
- Baton Rouge service wording that reads naturally
- the existing relevant photo
- a concise explanation of the appearance type
- planning details visitors should provide
- links to `/invite`
- links back to `/experiences`
- links to one or two related experience pages
- Service schema
- BreadcrumbList schema

Example intent mapping:

- Home visits → `Santa home visits Baton Rouge`
- Birthday surprises → `Santa birthday appearance Baton Rouge`
- Corporate events → `corporate Santa Baton Rouge`
- Schools & groups → `Santa for schools Baton Rouge`
- Community celebrations → `Santa for community events Baton Rouge`
- Photo sessions → `Santa photo sessions Baton Rouge`

These pages must be genuinely useful and unique. They must not be thin copies where only the keyword changes.

## Homepage Improvements

Preserve the existing visual hero headline and photography.

Strengthen the homepage through:

- metadata focused on hiring Santa in Baton Rouge
- one concise supporting statement that explicitly describes professional Santa appearances in Baton Rouge
- stronger internal links to the six experience pages
- a local-service section that explains what kinds of Baton Rouge-area celebrations Santa Jim serves
- a natural call to action to the existing inquiry flow

Do not overload the page with repeated city names.

## Existing Page Improvements

### `/meet`

Focus on the person/brand behind the service while retaining local relevance. Use metadata such as “Meet Santa Jim of Baton Rouge” and link naturally to experience pages and `/invite`.

### `/experiences`

Convert the existing overview into the parent hub for all six dedicated landing pages. Existing cards should link to their detail routes rather than only acting as static content blocks.

### `/gallery`

Use descriptive metadata emphasizing real Santa appearances and photo moments in the Baton Rouge area. Existing alt text should be preserved unless inaccurate.

### `/faq`

Keep visible FAQ content and add FAQPage schema. Ensure questions cover booking, timing, travel/service area, personalization, photo sessions, and event types using the content Jim actually offers.

### `/invite`

Use conversion-focused metadata such as “Book Santa Jim in Baton Rouge” while preserving the existing booking/inquiry UI and logic.

## Internal Linking

The public site should form a clear crawl structure:

- Home links to Experiences hub and selected experience details.
- Experiences hub links to all six detail pages.
- Detail pages link back to the hub, to `/invite`, and to related experience pages.
- Meet, FAQ, and Gallery link naturally to `/invite` where contextually appropriate.
- Footer/navigation behavior should remain visually consistent with the existing site.

## Image SEO

Preserve the strong existing descriptive alt text. Add or improve alt text only where images are missing meaningful descriptions.

Use Next.js Image behavior already present in the project. Do not add keyword stuffing to alt text.

The primary social image should use a strong existing Santa Jim portrait, preferably `/images/jim-hope-throne.webp` unless a better approved image is identified during implementation.

## Testing and Verification

Add SEO-focused automated verification covering at least:

1. central SITE_URL behavior
2. indexing disabled by default on the temporary Vercel domain
3. indexing enabled only when explicitly configured
4. sitemap contains all public routes and excludes private/admin/API routes
5. robots staging mode disallows all
6. robots production mode allows public routes while blocking private/admin/API paths
7. all six experience landing pages have unique titles/descriptions
8. canonical URLs use the configured site URL
9. private/admin pages emit noindex
10. FAQ page emits FAQ structured data
11. experience pages emit Service and Breadcrumb structured data
12. production build succeeds without changing scheduler/API behavior

The existing project test and lint commands must continue to pass:

```text
npm test
npm run lint
npm run build
```

## Deployment Strategy

Implementation should occur on a feature branch and be tested in a Vercel preview deployment before merging.

During preview and while using the Vercel staging hostname:

- keep `SEO_INDEX=false`
- verify noindex response/page metadata
- verify canonical URLs
- verify sitemap output
- verify robots output
- visually confirm the homepage, experiences, detail pages, FAQ, and invite flow still render correctly

Merge only after the preview build and SEO checks pass.

## Real Domain Launch

When the real client domain is connected later:

1. Set `SITE_URL` to the canonical client domain.
2. Set `SEO_INDEX=true` for production only.
3. Redeploy.
4. Verify canonical URLs use the client domain.
5. Verify public pages are index/follow.
6. Verify private/admin/API routes remain blocked/noindex.
7. Verify `robots.txt` references the production sitemap.
8. Verify sitemap URLs use the client domain.
9. Submit the sitemap in Google Search Console when account access is available.
10. Track non-brand queries such as Santa for hire Baton Rouge, Santa home visits Baton Rouge, corporate Santa Baton Rouge, and Santa photo sessions Baton Rouge.

## Constraints

- Preserve the approved design language and page structure wherever possible.
- Preserve the existing scheduler, inquiry form, admin flows, Supabase integration, and API behavior.
- Do not add em dashes to new client-facing copy.
- Do not add generic AI-sounding filler copy.
- Do not create unsupported business claims.
- Do not expose private/admin functionality to indexing.
- Do not enable indexing on the temporary Vercel deployment.
- Do not create or incur any paid services or domain charges.

## Acceptance Criteria

The SEO implementation is complete when:

- every public page has unique, production-ready metadata and canonicals
- staging remains noindex by default
- production indexing can be enabled with environment variables only
- sitemap and robots behavior change correctly by environment
- all six experience detail pages exist and are internally linked
- structured data validates logically and contains only verified claims
- FAQ schema matches visible FAQ content
- private/admin/API routes are protected from indexing
- current visual design and booking flows remain functional
- automated SEO checks pass
- the Vercel preview build passes before merge
