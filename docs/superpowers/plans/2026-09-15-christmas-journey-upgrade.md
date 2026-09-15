# Santa Jim Christmas Journey Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Santa Jim site feel like one immersive, premium Christmas journey while preserving its real photography, booking flow, and established visual identity.

**Architecture:** Keep the current Next.js App Router page and data-driven Santa content. Upgrade the homepage composition, reusable content data, CSS, and booking affordances without introducing unnecessary dependencies or replacing the working inquiry delivery system.

**Tech Stack:** Next.js, React, TypeScript, CSS, Lucide React.

**Spec:** Approved upgrade direction from the September 15, 2026 site review.

## Global Constraints

- Preserve the current dark green, red, cream, gold, real-photography Christmas aesthetic.
- Do not use emojis or generic numbered-box layouts.
- Remove staging/demo language from customer-facing copy.
- Keep motion subtle and respect reduced-motion preferences.
- Preserve the working inquiry form and current test email destination until client handoff.
- Avoid adding new external dependencies.

---

### Task 1: Customer-ready content

**Files:**
- Modify: `components/santa/site-content.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: existing `experiences`, `visitSteps`, `galleryItems`, `faqs` exports.
- Produces: polished customer-facing copy and gallery category metadata used by the homepage.

- [ ] **Step 1:** Add/adjust content-level tests or static assertions where the existing test setup supports them, specifically checking that staging phrases such as `coming soon`, `will be added`, and `final service area will be added` are absent from rendered content.
- [ ] **Step 2:** Run the targeted test and verify it fails on the current copy.
- [ ] **Step 3:** Replace staging language with intentional booking/service copy and add meaningful gallery category labels.
- [ ] **Step 4:** Run the targeted test and confirm it passes.

### Task 2: Immersive page composition and mobile CTA

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: current page sections and content arrays.
- Produces: continuous visual journey treatment, enhanced hero atmosphere, more expressive experience presentation, refined gallery interaction, and a mobile sticky booking CTA.

- [ ] **Step 1:** Add a structural/render test if supported by the current setup for the new journey rail, gallery links, and mobile booking CTA.
- [ ] **Step 2:** Verify the test fails before markup changes.
- [ ] **Step 3:** Add the decorative journey rail, atmospheric hero layers, custom experience/card composition, gallery lightbox links, and mobile CTA with accessible labels.
- [ ] **Step 4:** Expand responsive CSS for desktop/mobile and reduced-motion behavior.
- [ ] **Step 5:** Run the targeted test and confirm it passes.

### Task 3: SEO and launch polish

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing site title/description and public favicon.
- Produces: stronger metadata for search and social previews without inventing unconfirmed service-area claims.

- [ ] **Step 1:** Add metadata assertions if the test setup supports importing the layout metadata.
- [ ] **Step 2:** Verify the new expectations fail before changes.
- [ ] **Step 3:** Add Open Graph and Twitter metadata using existing site content/assets.
- [ ] **Step 4:** Run tests and build/type checks.

### Task 4: Verification

**Files:**
- No production files unless verification uncovers an issue.

**Interfaces:**
- Produces: evidence that the updated site compiles and preserves existing booking behavior.

- [ ] **Step 1:** Run the complete existing test suite.
- [ ] **Step 2:** Run lint/type/build checks defined by `package.json`.
- [ ] **Step 3:** Fix any regressions and rerun checks until clean.
