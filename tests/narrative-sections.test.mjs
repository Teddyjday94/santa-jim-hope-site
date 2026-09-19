import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { experiences, visitSteps } from "../components/santa/site-content.ts";

test("the editable content module includes six event experiences", async () => {
  const content = await readFile(new URL("../components/santa/site-content.ts", import.meta.url), "utf8");

  for (const title of ["Home visits", "Birthday surprises", "Corporate events", "Schools & groups", "Community celebrations", "Photo sessions"]) {
    assert.match(content, new RegExp(title));
  }
});

test("the public site exposes each narrative destination as its own route", async () => {
  for (const path of ["meet", "experiences", "gallery", "faq", "invite"]) {
    const page = await readFile(new URL(`../app/${path}/page.tsx`, import.meta.url), "utf8");
    assert.ok(page.length > 100, `${path} should contain a real page`);
  }
});

test("the dedicated invite route preserves the active scheduler request path", async () => {
  const [invite, form] = await Promise.all([
    readFile(new URL("../app/invite/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(invite, /<InquiryForm \/>/);
  assert.match(invite, /available time/i);
  assert.match(form, /\/api\/santa\/availability/);
  assert.match(form, /pending Santa Jim/);
});

test("every experience and route stop uses unique web-optimized keepsake artwork", async () => {
  const sections = [...experiences, ...visitSteps];
  const artwork = sections.map((section) => section.iconSrc);

  assert.equal(new Set(artwork).size, sections.length);

  for (const src of artwork) {
    assert.match(src, /^\/icons\/north-pole-[a-z-]+\.webp$/);
    const asset = await stat(new URL(`../public${src}`, import.meta.url));
    assert.ok(asset.size > 1_000, `${src} should contain real artwork`);
    assert.ok(asset.size < 150_000, `${src} should stay lightweight for mobile`);
  }
});
