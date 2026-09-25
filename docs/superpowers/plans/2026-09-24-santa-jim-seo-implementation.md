# Santa Jim of Baton Rouge SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a staging-safe, locally targeted SEO system for Santa Jim of Baton Rouge that adds canonical metadata, robots/sitemap controls, structured data, six useful experience landing pages, stronger internal linking, and automated verification without changing the approved design, scheduler, inquiry workflow, Supabase integration, or API behavior.

**Architecture:** Keep the existing Next.js 16 App Router application intact and add a small pure SEO layer under `lib/` that converts environment settings and existing Santa content into Next metadata, robots rules, sitemap entries, and JSON-LD. Experience detail pages will be generated from one extended data model so content, metadata, internal links, and schema share the same source of truth. Indexing remains disabled unless `SEO_INDEX=true`, and the temporary Vercel hostname remains the fallback canonical base until a real client domain is configured.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node 22 test runner, Vercel, existing CSS and Santa components.

**Spec:** `docs/superpowers/specs/2026-09-24-santa-jim-seo-design.md`

## Global Constraints

- Preserve the approved visual design and page structure wherever possible.
- Preserve the existing scheduler, inquiry form, admin flows, Supabase integration, and API behavior.
- Default temporary site URL is exactly `https://santa-jim-hope-site.vercel.app`.
- Indexing is disabled unless `SEO_INDEX` is exactly `true`.
- Do not enable indexing on the temporary Vercel deployment.
- Public customer inquiry route `/invite` remains indexable when production indexing is enabled.
- Private/admin/API routes remain blocked and noindex.
- Primary verified geography is Baton Rouge, Louisiana. Do not invent additional service cities.
- Do not invent certifications, insurance, background checks, reviews, awards, years of experience, or storefront addresses.
- Do not add em dashes to new client-facing copy.
- Do not add generic AI-sounding filler copy.
- Do not create thin city doorway pages.
- Do not incur paid services, domain charges, or account purchases.
- Existing commands must pass before merge: `npm test`, `npm run lint`, `npm run build`.

## File Structure

### Create

- `lib/seo.ts` — pure environment/config, metadata, robots, sitemap helpers.
- `lib/seo-schema.ts` — JSON-LD builders for Person, WebSite, WebPage, Service, BreadcrumbList, FAQPage.
- `components/santa/structured-data.tsx` — safe reusable JSON-LD renderer.
- `app/robots.ts` — App Router robots route using `lib/seo.ts`.
- `app/sitemap.ts` — App Router sitemap route using `lib/seo.ts`.
- `app/experiences/[slug]/page.tsx` — statically generated experience detail pages.
- `app/santa-admin/layout.tsx` — inherited private noindex metadata for the admin subtree.
- `tests/seo-config.test.mjs` — config, metadata, robots, sitemap, canonical tests.
- `tests/seo-schema.test.mjs` — structured data and FAQ parity tests.
- `tests/experience-seo.test.mjs` — experience slug/content/metadata uniqueness tests.

### Modify

- `next.config.ts` — staging/private `X-Robots-Tag` headers.
- `app/layout.tsx` — metadataBase, shared metadata defaults, root Person/WebSite schema.
- `app/page.tsx` — Baton Rouge support copy, selected experience detail links, page schema.
- `app/meet/page.tsx` — canonical metadata helper and relevant links/schema.
- `app/experiences/page.tsx` — parent hub links to six detail pages.
- `app/gallery/page.tsx` — canonical metadata helper and WebPage schema.
- `app/faq/page.tsx` — canonical metadata helper plus FAQPage schema matching visible FAQs.
- `app/invite/page.tsx` — conversion-focused canonical metadata while preserving form behavior.
- `components/santa/site-content.ts` — extend experience data with SEO/detail fields and verified Baton Rouge copy.
- `components/santa/site-shell.tsx` — add unobtrusive footer crawl links only if needed after hub/detail linking; do not redesign footer.
- `tests/jim-hope-content.test.mjs` — update stale branding/gallery assumptions to current approved content.
- `.github/workflows/verify.yml` — add lint verification before build.

## Review Focus

1. **Preview deployment with no env vars:** must remain noindex, use the temporary Vercel canonical base, disallow all crawling, and send `X-Robots-Tag: noindex, nofollow`.
2. **Production domain set but `SEO_INDEX` omitted/false:** must still remain noindex; setting only `SITE_URL` is not enough to expose the site.
3. **Unknown experience slug:** must return Next.js `notFound()` rather than a blank page, duplicate generic page, or scheduler error.
4. **Private/admin/API paths when production indexing is enabled:** must stay blocked/noindex while `/invite` remains public and indexable.
5. **FAQ/schema drift:** JSON-LD questions and answers must be built from the same `faqs` array rendered on `/faq` so schema cannot silently diverge from visible content.

---

### Task 1: Establish a trustworthy content and SEO test baseline

**Files:**
- Modify: `tests/jim-hope-content.test.mjs`
- Create: `tests/seo-config.test.mjs`
- Create: `lib/seo.ts`

**Interfaces:**
- Produces: `getSeoConfig(env?: NodeJS.ProcessEnv): SeoConfig`
- Produces: `absoluteUrl(path: string, config?: SeoConfig): string`
- Produces: `buildPublicMetadata(input: PublicMetadataInput, config?: SeoConfig): Metadata`
- Produces: `buildRobots(config?: SeoConfig): MetadataRoute.Robots`
- Produces: `buildSitemap(config?: SeoConfig): MetadataRoute.Sitemap`
- Produces: `PUBLIC_ROUTES: readonly string[]`
- Produces: `PRIVATE_ROUTE_PREFIXES: readonly string[]`

- [ ] **Step 1: Repair the stale public-content regression test**

Replace the old exact identity/gallery assumptions in `tests/jim-hope-content.test.mjs` with the current approved branding and a resilient gallery assertion:

```js
test("the public-facing Santa profile uses the approved Baton Rouge brand", () => {
  assert.deepEqual(santaProfile, {
    name: "Santa Jim of Baton Rouge",
    displayName: "Santa Jim of Baton Rouge",
    shortName: "Santa Jim",
  });
});

test("the gallery keeps supplied Santa Jim photography unique and descriptive", () => {
  assert.ok(galleryItems.length >= 17);
  assert.equal(new Set(galleryItems.map((item) => item.src)).size, galleryItems.length);
  assert.ok(galleryItems.every((item) => item.alt.trim().length > 20));
});

test("the hero motion has the approved still-image fallback and silent loop source", () => {
  assert.deepEqual(heroMedia, {
    posterSrc: "/images/jim-hope-throne.webp",
    videoSrc: "/videos/jim-hope-christmas-loop.mp4",
    alt: "Santa Jim of Baton Rouge seated on an ornate holiday throne",
  });
});
```

- [ ] **Step 2: Run the content test and establish the baseline**

Run:

```bash
node --test tests/jim-hope-content.test.mjs
```

Expected: PASS after aligning the stale test with the current approved site content.

- [ ] **Step 3: Write failing SEO config tests**

Create `tests/seo-config.test.mjs` with tests that directly exercise pure helpers:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_URL,
  PRIVATE_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  absoluteUrl,
  buildPublicMetadata,
  buildRobots,
  buildSitemap,
  getSeoConfig,
} from "../lib/seo.ts";

test("SEO defaults to the Vercel hostname with indexing disabled", () => {
  const config = getSeoConfig({});
  assert.equal(config.siteUrl.origin, DEFAULT_SITE_URL);
  assert.equal(config.indexingEnabled, false);
});

test("SEO_INDEX must be exactly true before indexing is enabled", () => {
  assert.equal(getSeoConfig({ SEO_INDEX: "false" }).indexingEnabled, false);
  assert.equal(getSeoConfig({ SEO_INDEX: "TRUE" }).indexingEnabled, false);
  assert.equal(getSeoConfig({ SEO_INDEX: "true" }).indexingEnabled, true);
});

test("SITE_URL changes canonical origin without implicitly enabling indexing", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example/" });
  assert.equal(config.siteUrl.origin, "https://santajim.example");
  assert.equal(config.indexingEnabled, false);
  assert.equal(absoluteUrl("/faq", config), "https://santajim.example/faq");
});

test("staging metadata is noindex and canonicalized", () => {
  const config = getSeoConfig({});
  const metadata = buildPublicMetadata({
    title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
    description: "Professional Santa appearances in Baton Rouge, Louisiana.",
    path: "/",
  }, config);
  assert.equal(metadata.alternates?.canonical, DEFAULT_SITE_URL + "/");
  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, false);
});

test("production robots allows public routes while blocking private routes", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const robots = buildRobots(config);
  assert.deepEqual(robots.rules, [{
    userAgent: "*",
    allow: "/",
    disallow: ["/santa-admin", "/api/"],
  }]);
  assert.equal(robots.sitemap, "https://santajim.example/sitemap.xml");
});

test("staging robots disallows everything and does not advertise a sitemap", () => {
  const robots = buildRobots(getSeoConfig({}));
  assert.deepEqual(robots.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal("sitemap" in robots, false);
});

test("sitemap contains public routes and excludes private routes", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const sitemap = buildSitemap(config);
  const urls = sitemap.map((entry) => new URL(entry.url).pathname);
  for (const route of PUBLIC_ROUTES) assert.ok(urls.includes(route));
  for (const prefix of PRIVATE_ROUTE_PREFIXES) assert.ok(urls.every((route) => !route.startsWith(prefix)));
});
```

Expected before `lib/seo.ts` exists: FAIL with module-not-found.

- [ ] **Step 4: Run the new SEO test to verify it fails**

Run:

```bash
node --test tests/seo-config.test.mjs
```

Expected: FAIL because `lib/seo.ts` does not exist.

- [ ] **Step 5: Implement the pure SEO configuration layer**

Create `lib/seo.ts` with this responsibility and signatures:

```ts
import type { Metadata, MetadataRoute } from "next";

export const DEFAULT_SITE_URL = "https://santa-jim-hope-site.vercel.app";
export const DEFAULT_SOCIAL_IMAGE = "/images/jim-hope-throne.webp";

export const PUBLIC_ROUTES = [
  "/",
  "/meet",
  "/experiences",
  "/experiences/home-visits",
  "/experiences/birthday-surprises",
  "/experiences/corporate-events",
  "/experiences/schools-groups",
  "/experiences/community-celebrations",
  "/experiences/photo-sessions",
  "/gallery",
  "/faq",
  "/invite",
] as const;

export const PRIVATE_ROUTE_PREFIXES = ["/santa-admin", "/api/"] as const;

export type SeoConfig = {
  siteUrl: URL;
  indexingEnabled: boolean;
  businessName: "Santa Jim of Baton Rouge";
  locale: "en_US";
  primaryArea: "Baton Rouge, Louisiana";
};

export type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function getSeoConfig(env: NodeJS.ProcessEnv = process.env): SeoConfig {
  const rawUrl = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  return {
    siteUrl: new URL(rawUrl),
    indexingEnabled: env.SEO_INDEX === "true",
    businessName: "Santa Jim of Baton Rouge",
    locale: "en_US",
    primaryArea: "Baton Rouge, Louisiana",
  };
}

export function absoluteUrl(path: string, config = getSeoConfig()) {
  return new URL(path, config.siteUrl).toString();
}

export function buildPublicMetadata(input: PublicMetadataInput, config = getSeoConfig()): Metadata {
  const canonical = absoluteUrl(input.path, config);
  const image = absoluteUrl(input.image ?? DEFAULT_SOCIAL_IMAGE, config);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: config.indexingEnabled
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: config.businessName,
      locale: config.locale,
      type: "website",
      images: [{ url: image, alt: "Santa Jim of Baton Rouge in a festive holiday setting" }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function buildRobots(config = getSeoConfig()): MetadataRoute.Robots {
  if (!config.indexingEnabled) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/santa-admin", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml", config),
    host: config.siteUrl.origin,
  };
}

export function buildSitemap(config = getSeoConfig()): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({ url: absoluteUrl(route, config) }));
}
```

- [ ] **Step 6: Run the SEO config tests**

Run:

```bash
node --test tests/seo-config.test.mjs tests/jim-hope-content.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/seo.ts tests/seo-config.test.mjs tests/jim-hope-content.test.mjs
git commit -m "test: establish Santa Jim SEO baseline"
```

---

### Task 2: Add staging-safe metadata, robots, sitemap, and response headers

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `app/layout.tsx`
- Modify: `next.config.ts`
- Test: `tests/seo-config.test.mjs`

**Interfaces:**
- Consumes: `getSeoConfig`, `buildRobots`, `buildSitemap`, `buildPublicMetadata`, `absoluteUrl` from `lib/seo.ts`.
- Produces: App Router `/robots.txt` and `/sitemap.xml`.
- Produces: staging/private `X-Robots-Tag` response protection from Next config.

- [ ] **Step 1: Add failing assertions for metadataBase and headers policy**

Extend `tests/seo-config.test.mjs` with source-level assertions for the framework integration:

```js
import { readFile } from "node:fs/promises";

const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const nextConfigSource = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

test("root layout derives metadataBase and default robots from SEO config", () => {
  assert.match(layoutSource, /metadataBase:\s*config\.siteUrl/);
  assert.match(layoutSource, /buildPublicMetadata/);
});

test("Next config sends noindex headers on staging and private paths", () => {
  assert.match(nextConfigSource, /X-Robots-Tag/);
  assert.match(nextConfigSource, /SEO_INDEX/);
  assert.match(nextConfigSource, /santa-admin/);
  assert.match(nextConfigSource, /api/);
});
```

- [ ] **Step 2: Run tests and verify the new integration assertions fail**

Run:

```bash
node --test tests/seo-config.test.mjs
```

Expected: FAIL because layout/config have not been wired yet.

- [ ] **Step 3: Add App Router robots and sitemap routes**

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
```

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap();
}
```

- [ ] **Step 4: Wire root metadata to the central SEO config**

Update `app/layout.tsx` so it computes:

```ts
const config = getSeoConfig();
const rootMetadata = buildPublicMetadata({
  title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
  description: "Invite Santa Jim of Baton Rouge for home visits, photo sessions, schools, businesses, community celebrations, and holiday events.",
  path: "/",
}, config);

export const metadata: Metadata = {
  ...rootMetadata,
  metadataBase: config.siteUrl,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};
```

Keep all existing CSS imports and render behavior unchanged.

- [ ] **Step 5: Add staging/private response headers without affecting application routes**

Update `next.config.ts` to keep previews safe even if a crawler ignores HTML metadata:

```ts
import type { NextConfig } from "next";

const indexingEnabled = process.env.SEO_INDEX === "true";

const nextConfig: NextConfig = {
  async headers() {
    const privateRules = [
      {
        source: "/santa-admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];

    if (indexingEnabled) return privateRules;

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      ...privateRules,
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 6: Run tests, lint, and build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all PASS. Build output must include `/robots.txt` and `/sitemap.xml`.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/robots.ts app/sitemap.ts next.config.ts tests/seo-config.test.mjs
git commit -m "feat: add staging-safe SEO infrastructure"
```

---

### Task 3: Add reusable structured data and FAQ parity

**Files:**
- Create: `lib/seo-schema.ts`
- Create: `components/santa/structured-data.tsx`
- Create: `tests/seo-schema.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `app/faq/page.tsx`

**Interfaces:**
- Consumes: `absoluteUrl`, `getSeoConfig` from `lib/seo.ts`.
- Consumes: `faqs`, `santaProfile` from `components/santa/site-content.ts`.
- Produces: `buildPersonSchema`, `buildWebsiteSchema`, `buildWebPageSchema`, `buildServiceSchema`, `buildBreadcrumbSchema`, `buildFaqSchema`.
- Produces: `<StructuredData data={...} />`.

- [ ] **Step 1: Write failing schema tests**

Create `tests/seo-schema.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { faqs } from "../components/santa/site-content.ts";
import { getSeoConfig } from "../lib/seo.ts";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPersonSchema,
  buildServiceSchema,
  buildWebsiteSchema,
} from "../lib/seo-schema.ts";

const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });

test("person schema uses only verified Santa Jim identity", () => {
  const schema = buildPersonSchema(config);
  assert.equal(schema["@type"], "Person");
  assert.equal(schema.name, "Santa Jim of Baton Rouge");
  assert.equal(schema.jobTitle, "Professional Santa Claus performer");
  assert.equal("address" in schema, false);
  assert.equal("award" in schema, false);
});

test("website schema is anchored to the configured canonical domain", () => {
  const schema = buildWebsiteSchema(config);
  assert.equal(schema.url, "https://santajim.example/");
});

test("FAQ schema mirrors visible FAQ content exactly", () => {
  const schema = buildFaqSchema(faqs, config);
  assert.equal(schema.mainEntity.length, faqs.length);
  assert.deepEqual(
    schema.mainEntity.map((entry) => [entry.name, entry.acceptedAnswer.text]),
    faqs.map((item) => [item.question, item.answer]),
  );
});

test("service schema targets Baton Rouge and uses Santa Jim as provider", () => {
  const schema = buildServiceSchema({
    name: "Santa Home Visits",
    description: "Personal Santa visits for Baton Rouge families.",
    path: "/experiences/home-visits",
  }, config);
  assert.equal(schema.areaServed.name, "Baton Rouge, Louisiana");
  assert.equal(schema.provider["@id"], "https://santajim.example/#santa-jim");
});

test("experience breadcrumb order is Home, Experiences, detail", () => {
  const schema = buildBreadcrumbSchema([
    ["Home", "/"],
    ["Experiences", "/experiences"],
    ["Home Visits", "/experiences/home-visits"],
  ], config);
  assert.deepEqual(schema.itemListElement.map((item) => item.name), ["Home", "Experiences", "Home Visits"]);
});
```

- [ ] **Step 2: Run schema tests and verify failure**

Run:

```bash
node --test tests/seo-schema.test.mjs
```

Expected: FAIL because schema helpers do not exist.

- [ ] **Step 3: Implement schema builders**

Create `lib/seo-schema.ts` with stable IDs and no unsupported business claims. Core shapes:

```ts
import type { FaqItem } from "@/components/santa/site-content";
import { absoluteUrl, getSeoConfig, type SeoConfig } from "@/lib/seo";

export function buildPersonSchema(config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${config.siteUrl.origin}/#santa-jim`,
    name: "Santa Jim of Baton Rouge",
    jobTitle: "Professional Santa Claus performer",
    url: absoluteUrl("/meet", config),
    image: absoluteUrl("/images/jim-hope-throne.webp", config),
  } as const;
}

export function buildWebsiteSchema(config: SeoConfig = getSeoConfig()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.siteUrl.origin}/#website`,
    name: "Santa Jim of Baton Rouge",
    url: absoluteUrl("/", config),
    inLanguage: "en-US",
  } as const;
}

export function buildServiceSchema(
  input: { name: string; description: string; path: string },
  config: SeoConfig = getSeoConfig(),
) {
  const url = absoluteUrl(input.path, config);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: input.name,
    description: input.description,
    url,
    provider: { "@id": `${config.siteUrl.origin}/#santa-jim` },
    areaServed: { "@type": "City", name: "Baton Rouge, Louisiana" },
  } as const;
}
```

Also implement `buildWebPageSchema`, `buildBreadcrumbSchema`, and `buildFaqSchema` using canonical URLs and `faqs` verbatim.

- [ ] **Step 4: Add a safe JSON-LD renderer**

Create `components/santa/structured-data.tsx`:

```tsx
export function StructuredData({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
```

- [ ] **Step 5: Render Person and WebSite schema once at the root**

In `app/layout.tsx`, render two `<StructuredData>` components inside `<body>` before `{children}` using `buildPersonSchema(config)` and `buildWebsiteSchema(config)`.

- [ ] **Step 6: Add FAQPage schema from the same visible data source**

Update `app/faq/page.tsx` to use `buildPublicMetadata` for `/faq` and render:

```tsx
<StructuredData data={buildFaqSchema(faqs)} />
```

Keep `<FaqList items={faqs} />` unchanged so schema and visible content stay synchronized.

Use metadata:

```ts
export const metadata = buildPublicMetadata({
  title: "Santa Booking FAQ in Baton Rouge, LA | Santa Jim",
  description: "Answers about booking Santa Jim of Baton Rouge for home visits, events, photo sessions, timing, personalization, and travel planning.",
  path: "/faq",
});
```

- [ ] **Step 7: Run schema and full tests**

Run:

```bash
node --test tests/seo-schema.test.mjs
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/seo-schema.ts components/santa/structured-data.tsx app/layout.tsx app/faq/page.tsx tests/seo-schema.test.mjs
git commit -m "feat: add Santa Jim structured SEO data"
```

---

### Task 4: Extend experience content into six unique SEO landing pages

**Files:**
- Modify: `components/santa/site-content.ts`
- Create: `app/experiences/[slug]/page.tsx`
- Create: `tests/experience-seo.test.mjs`

**Interfaces:**
- Extends `Experience` with `slug`, `seoTitle`, `seoDescription`, `detailHeading`, `detailIntro`, `planningTips`, `relatedSlugs`.
- Produces: `getExperienceBySlug(slug: string): Experience | undefined`.
- Consumes: `experiencePhotos` mapping by existing title.
- Consumes: SEO/schema helpers from Tasks 1 and 3.

- [ ] **Step 1: Write failing experience-data tests**

Create `tests/experience-seo.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { experiences, getExperienceBySlug } from "../components/santa/site-content.ts";

const expectedSlugs = [
  "home-visits",
  "birthday-surprises",
  "corporate-events",
  "schools-groups",
  "community-celebrations",
  "photo-sessions",
];

test("all six approved appearance types have unique SEO slugs", () => {
  assert.deepEqual(experiences.map((item) => item.slug), expectedSlugs);
  assert.equal(new Set(experiences.map((item) => item.slug)).size, experiences.length);
});

test("experience SEO titles and descriptions are unique and Baton Rouge specific", () => {
  assert.equal(new Set(experiences.map((item) => item.seoTitle)).size, experiences.length);
  assert.equal(new Set(experiences.map((item) => item.seoDescription)).size, experiences.length);
  assert.ok(experiences.every((item) => /Baton Rouge/i.test(item.seoTitle + " " + item.seoDescription)));
});

test("each detail page has useful planning copy and valid related links", () => {
  const slugs = new Set(expectedSlugs);
  for (const item of experiences) {
    assert.ok(item.detailIntro.length >= 100);
    assert.ok(item.planningTips.length >= 3);
    assert.ok(item.relatedSlugs.length >= 1);
    assert.ok(item.relatedSlugs.every((slug) => slug !== item.slug && slugs.has(slug)));
  }
});

test("unknown experience slugs do not resolve", () => {
  assert.equal(getExperienceBySlug("not-a-real-experience"), undefined);
});
```

- [ ] **Step 2: Run the experience tests and verify failure**

Run:

```bash
node --test tests/experience-seo.test.mjs
```

Expected: FAIL because the current `Experience` type has no slug/detail SEO fields.

- [ ] **Step 3: Extend the central experience data with genuinely unique content**

Update `Experience`:

```ts
export type Experience = {
  title: string;
  kicker: string;
  description: string;
  iconSrc: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  detailHeading: string;
  detailIntro: string;
  planningTips: string[];
  relatedSlugs: string[];
};
```

Use these exact SEO titles:

```text
Santa Home Visits in Baton Rouge, LA | Santa Jim
Santa Birthday Appearances in Baton Rouge, LA | Santa Jim
Corporate Santa in Baton Rouge, LA | Santa Jim
Santa for Schools & Groups in Baton Rouge, LA | Santa Jim
Santa for Community Events in Baton Rouge, LA | Santa Jim
Santa Photo Sessions in Baton Rouge, LA | Santa Jim
```

Use concise unique descriptions matching the existing offers. Example home-visit detail copy:

```text
Bring Santa Jim into your Baton Rouge-area home for a personal Christmas visit built around your family, your traditions, and the pace that feels comfortable for your guests. Share names, favorite traditions, photo plans, and any surprises ahead of time so the visit can feel natural and personal when Santa arrives.
```

Use planning tips that are specific to each event type. Do not duplicate one generic paragraph six times.

Add:

```ts
export function getExperienceBySlug(slug: string) {
  return experiences.find((experience) => experience.slug === slug);
}
```

- [ ] **Step 4: Create the dynamic experience detail route**

Create `app/experiences/[slug]/page.tsx` using Next 16 async params:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { experiencePhotos } from "@/components/santa/experience-photos";
import { SiteShell } from "@/components/santa/site-shell";
import { StructuredData } from "@/components/santa/structured-data";
import { experiences, getExperienceBySlug } from "@/components/santa/site-content";
import { buildPublicMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildServiceSchema } from "@/lib/seo-schema";

export function generateStaticParams() {
  return experiences.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);
  if (!experience) return {};
  return buildPublicMetadata({
    title: experience.seoTitle,
    description: experience.seoDescription,
    path: `/experiences/${experience.slug}`,
  });
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);
  if (!experience) notFound();
  const photo = experiencePhotos[experience.title];
  const related = experience.relatedSlugs.map(getExperienceBySlug).filter(Boolean);
  const path = `/experiences/${experience.slug}`;

  return (
    <SiteShell className="experiences-page">
      <StructuredData data={buildServiceSchema({ name: experience.title, description: experience.seoDescription, path })} />
      <StructuredData data={buildBreadcrumbSchema([
        ["Home", "/"],
        ["Experiences", "/experiences"],
        [experience.title, path],
      ])} />
      {/* existing page-banner / experience-story styling, no redesign */}
    </SiteShell>
  );
}
```

The rendered page must contain:

- `<h1>{experience.detailHeading}</h1>`
- `experience.detailIntro`
- relevant `Image` using `experiencePhotos[experience.title]`
- a planning list from `experience.planningTips`
- CTA to `/invite`
- link back to `/experiences`
- related experience links from `relatedSlugs`

Use existing CSS classes from the Experiences page before adding new styles. Add CSS only if the current classes cannot support a readable detail page.

- [ ] **Step 5: Run the detail-page tests and build**

Run:

```bash
node --test tests/experience-seo.test.mjs
npm run build
```

Expected: PASS and build lists all six generated `/experiences/<slug>` routes.

- [ ] **Step 6: Commit**

```bash
git add components/santa/site-content.ts app/experiences/[slug]/page.tsx tests/experience-seo.test.mjs
git commit -m "feat: add Baton Rouge Santa experience landing pages"
```

---

### Task 5: Turn the existing Experiences page and homepage into a strong crawl path

**Files:**
- Modify: `app/experiences/page.tsx`
- Modify: `app/page.tsx`
- Test: `tests/experience-seo.test.mjs`
- Test: `tests/narrative-sections.test.mjs`

**Interfaces:**
- Consumes: `experience.slug` from Task 4.
- Consumes: `buildPublicMetadata`, `buildWebPageSchema`, `StructuredData`.
- Produces: public internal links from Home → Experiences hub → all detail pages → Invite.

- [ ] **Step 1: Add failing internal-link assertions**

Extend `tests/experience-seo.test.mjs` with source assertions:

```js
import { readFile } from "node:fs/promises";

const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const hubSource = await readFile(new URL("../app/experiences/page.tsx", import.meta.url), "utf8");

test("experience hub links every card to its detail route", () => {
  assert.match(hubSource, /`\/experiences\/\$\{experience\.slug\}`/);
});

test("homepage gives crawlers and visitors direct routes into selected experience details", () => {
  assert.match(homeSource, /`\/experiences\/\$\{experience\.slug\}`/);
  assert.match(homeSource, /Professional Santa appearances in Baton Rouge/);
});
```

- [ ] **Step 2: Run the link tests and verify failure**

Run:

```bash
node --test tests/experience-seo.test.mjs
```

Expected: FAIL until the hub/home links and local supporting copy are added.

- [ ] **Step 3: Upgrade the Experiences hub metadata and links**

Replace the existing metadata with:

```ts
export const metadata = buildPublicMetadata({
  title: "Santa Experiences in Baton Rouge, LA | Santa Jim",
  description: "Explore Santa Jim of Baton Rouge home visits, birthday surprises, corporate events, schools and groups, community celebrations, and photo sessions.",
  path: "/experiences",
});
```

For each existing experience story, replace the generic inquiry-only text link with two useful links:

```tsx
<Link className="text-link" href={`/experiences/${experience.slug}`}>
  Explore {experience.title} <ArrowRight size={16} aria-hidden="true" />
</Link>
<Link className="text-link" href="/invite">
  Ask about availability <ArrowRight size={16} aria-hidden="true" />
</Link>
```

Keep the existing cards, photos, alternating layout, and visit-path section.

- [ ] **Step 4: Strengthen homepage local context without replacing the brand headline**

Keep:

```text
Christmas feels closer when Santa walks in.
```

Add one concise supporting sentence near the hero or directly after it:

```text
Professional Santa appearances in Baton Rouge for home visits, photo sessions, schools, businesses, community celebrations, and seasonal events.
```

For the three `featuredExperiences`, add a natural detail link:

```tsx
<Link className="text-link text-link--light" href={`/experiences/${experience.slug}`}>
  Explore {experience.title} <ArrowRight size={16} aria-hidden="true" />
</Link>
```

Update homepage metadata to:

```ts
export const metadata = buildPublicMetadata({
  title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
  description: "Invite Santa Jim of Baton Rouge for home visits, photo sessions, schools, businesses, community celebrations, and holiday events.",
  path: "/",
});
```

Render `buildWebPageSchema` for `/` through `<StructuredData>`.

- [ ] **Step 5: Run tests and build**

Run:

```bash
node --test tests/experience-seo.test.mjs tests/narrative-sections.test.mjs
npm run lint
npm run build
```

Expected: PASS with no layout regressions from source-level narrative tests.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/experiences/page.tsx tests/experience-seo.test.mjs tests/narrative-sections.test.mjs
git commit -m "feat: strengthen Santa Jim local search pathways"
```

---

### Task 6: Canonicalize every public page and protect the admin subtree

**Files:**
- Create: `app/santa-admin/layout.tsx`
- Modify: `app/meet/page.tsx`
- Modify: `app/gallery/page.tsx`
- Modify: `app/invite/page.tsx`
- Modify: `app/faq/page.tsx` if needed after Task 3
- Modify: `app/santa-admin/page.tsx` only to remove duplicated robots metadata if inherited layout makes it redundant
- Test: `tests/seo-config.test.mjs`

**Interfaces:**
- Consumes: `buildPublicMetadata` and `buildWebPageSchema`.
- Produces: canonical metadata for `/meet`, `/gallery`, `/faq`, `/invite`.
- Produces: inherited `noindex,nofollow` for every `/santa-admin/*` page.

- [ ] **Step 1: Add failing page-metadata source assertions**

Extend `tests/seo-config.test.mjs`:

```js
for (const [file, route] of [
  ["../app/meet/page.tsx", "/meet"],
  ["../app/gallery/page.tsx", "/gallery"],
  ["../app/faq/page.tsx", "/faq"],
  ["../app/invite/page.tsx", "/invite"],
]) {
  test(`${route} uses canonical public metadata`, async () => {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.match(source, /buildPublicMetadata/);
    assert.ok(source.includes(`path: "${route}"`));
  });
}

test("the Santa admin subtree has inherited noindex metadata", async () => {
  const source = await readFile(new URL("../app/santa-admin/layout.tsx", import.meta.url), "utf8");
  assert.match(source, /index:\s*false/);
  assert.match(source, /follow:\s*false/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test tests/seo-config.test.mjs
```

Expected: FAIL for pages still using ad hoc metadata and for the missing admin layout.

- [ ] **Step 3: Convert public pages to central metadata**

Use these exact metadata targets:

`/meet`

```ts
buildPublicMetadata({
  title: "Meet Santa Jim of Baton Rouge | Professional Santa",
  description: "Meet Santa Jim of Baton Rouge and learn about the warm, personal approach behind his home visits, events, storytime moments, and photo-ready holiday appearances.",
  path: "/meet",
});
```

`/gallery`

```ts
buildPublicMetadata({
  title: "Santa Jim Photo Gallery | Baton Rouge Holiday Appearances",
  description: "See real Santa Jim of Baton Rouge moments from family visits, community celebrations, photo sessions, pets, and holiday gatherings.",
  path: "/gallery",
});
```

`/invite`

```ts
buildPublicMetadata({
  title: "Book Santa Jim in Baton Rouge, LA | Holiday Appearance Inquiry",
  description: "Request Santa Jim of Baton Rouge for a home visit, photo session, school, business, community celebration, or other holiday appearance.",
  path: "/invite",
});
```

Keep `/faq` metadata from Task 3.

Render a `WebPage` schema on `/meet`, `/gallery`, and `/invite`. Do not change the inquiry form component or its data flow.

- [ ] **Step 4: Add inherited admin noindex layout**

Create `app/santa-admin/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Santa Jim Scheduler | Private Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function SantaAdminLayout({ children }: { children: ReactNode }) {
  return children;
}
```

Remove the duplicate page-level `robots` block from `app/santa-admin/page.tsx` only if doing so leaves the title/behavior equivalent. Do not modify `AdminDashboard`.

- [ ] **Step 5: Run full tests and build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/meet/page.tsx app/gallery/page.tsx app/faq/page.tsx app/invite/page.tsx app/santa-admin/layout.tsx app/santa-admin/page.tsx tests/seo-config.test.mjs
git commit -m "feat: canonicalize public Santa pages and protect admin"
```

---

### Task 7: Enforce SEO verification in CI without weakening booking tests

**Files:**
- Modify: `.github/workflows/verify.yml`
- Modify: `tests/seo-config.test.mjs`
- Modify: `tests/seo-schema.test.mjs`
- Modify: `tests/experience-seo.test.mjs`
- No changes to scheduler/API implementation unless an existing unrelated failure is discovered and separately justified.

**Interfaces:**
- Consumes: all SEO helpers and routes from Tasks 1–6.
- Produces: CI gate that runs tests, lint, Deno checks, and Next build before merge.

- [ ] **Step 1: Add final regression cases for the five Review Focus risks**

Add tests covering:

```js
// SITE_URL alone never enables indexing.
assert.equal(getSeoConfig({ SITE_URL: "https://santajim.example" }).indexingEnabled, false);

// /invite remains present in PUBLIC_ROUTES.
assert.ok(PUBLIC_ROUTES.includes("/invite"));

// Admin/API remain absent from sitemap.
assert.ok(buildSitemap(getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" }))
  .every((entry) => !new URL(entry.url).pathname.startsWith("/santa-admin")));

// All six experience slugs resolve and a fake slug does not.
for (const slug of expectedSlugs) assert.ok(getExperienceBySlug(slug));
assert.equal(getExperienceBySlug("fake"), undefined);

// FAQ schema remains exact parity with visible faqs array.
assert.deepEqual(schemaPairs, visiblePairs);
```

- [ ] **Step 2: Run the complete test suite**

Run:

```bash
npm test
```

Expected: PASS, including all existing scheduler, inquiry, calendar, admin, API contract, layout, and content tests.

- [ ] **Step 3: Add lint as an explicit CI step**

Update `.github/workflows/verify.yml` between tests and build:

```yaml
      - name: Lint
        run: npm run lint
```

Do not remove the existing Deno checks, `npm test`, or `npm run build` steps.

- [ ] **Step 4: Run the same verification locally/in the execution environment**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/verify.yml tests/seo-config.test.mjs tests/seo-schema.test.mjs tests/experience-seo.test.mjs
git commit -m "test: enforce Santa Jim SEO regressions"
```

---

### Task 8: Preview-deploy, inspect crawler behavior, and merge only after verification

**Files:**
- No product-code changes expected.
- If verification reveals a defect, fix it in the owning task's file and add a regression assertion before continuing.

**Interfaces:**
- Consumes: completed feature branch.
- Produces: a Vercel preview verified as noindex with working public pages and unchanged booking/admin flows.

- [ ] **Step 1: Push/commit branch state and allow Vercel preview deployment**

Expected environment for preview:

```text
SITE_URL unset or https://santa-jim-hope-site.vercel.app
SEO_INDEX unset or false
```

- [ ] **Step 2: Verify preview crawler controls**

Check the preview deployment responses:

```text
/                 -> X-Robots-Tag: noindex, nofollow, noarchive
/robots.txt       -> User-agent * disallowed from /
/sitemap.xml      -> generated URLs use configured canonical base
/santa-admin      -> noindex HTML metadata plus X-Robots-Tag
/api/...          -> X-Robots-Tag noindex
```

The preview must not expose `index,follow` anywhere on public pages.

- [ ] **Step 3: Verify public routes visually and functionally**

Open and inspect:

```text
/
/meet
/experiences
/experiences/home-visits
/experiences/birthday-surprises
/experiences/corporate-events
/experiences/schools-groups
/experiences/community-celebrations
/experiences/photo-sessions
/gallery
/faq
/invite
```

Confirm:

- current Santa design remains intact
- experience images render
- links do not 404
- mobile booking CTA remains visible
- `/invite` form loads and preserves existing interaction behavior
- `/santa-admin` still renders its existing dashboard/auth behavior

- [ ] **Step 4: Verify metadata and JSON-LD on representative pages**

Inspect page HTML for:

```text
/                          -> canonical, noindex, Person/WebSite/WebPage schema
/experiences/home-visits  -> unique title/description, canonical, Service, BreadcrumbList
/faq                       -> FAQPage schema with visible FAQ text
/invite                    -> conversion title/description, canonical, no scheduler changes
```

- [ ] **Step 5: Run final branch verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Open PR and review diff**

PR title:

```text
Add staging-safe local SEO for Santa Jim of Baton Rouge
```

PR summary must call out:

```text
- temporary Vercel deployment remains noindex by default
- real domain indexing requires SITE_URL plus SEO_INDEX=true
- six Baton Rouge experience landing pages added
- sitemap/robots/canonicals/schema added
- Santa admin and APIs remain blocked
- scheduler, inquiry, Supabase, and API behavior intentionally unchanged
```

- [ ] **Step 7: Merge only after Vercel preview and CI are green**

After merge, verify the production Vercel alias still has `SEO_INDEX=false` until the real Santa Jim domain is connected.

---

## Real Domain Launch Checklist

Do not run these steps until the client domain is actually connected and ready to become canonical.

1. Set production `SITE_URL=https://<real-santa-jim-domain>`.
2. Keep preview/development `SEO_INDEX=false`.
3. Set production `SEO_INDEX=true` only after DNS/domain routing is confirmed.
4. Redeploy production.
5. Verify `/` canonical uses the real domain.
6. Verify public pages emit index/follow.
7. Verify `/santa-admin` and `/api/*` remain blocked/noindex.
8. Verify `robots.txt` allows public crawling and advertises `<real-domain>/sitemap.xml`.
9. Verify every sitemap URL uses the real domain.
10. Submit the sitemap to Google Search Console when account access is available.
11. Track non-brand queries separately, including `Santa for hire Baton Rouge`, `Santa home visits Baton Rouge`, `corporate Santa Baton Rouge`, `Santa photo sessions Baton Rouge`, `Santa for schools Baton Rouge`, and `Santa community events Baton Rouge`.

## Self-Review

- **Spec coverage:** Every approved requirement maps to Tasks 1–8: environment safety, canonicals, robots, sitemap, page metadata, structured data, six experience pages, homepage/local copy, internal links, private protection, tests, preview verification, and domain launch procedure.
- **Placeholder scan:** No implementation step relies on TBD/TODO/follow-up filler. All new routes, files, interfaces, titles, environment names, commands, and key copy are explicit.
- **Type consistency:** `SeoConfig`, `PublicMetadataInput`, experience slug fields, and schema helper names are defined before later tasks consume them.
- **Review Focus:** Preview defaults, SITE_URL-only safety, unknown slugs, admin/API protection, and FAQ parity each have explicit regression coverage in the owning tasks.
