import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { experiences, visitSteps } from "../components/santa/site-content.ts";

test("the editable content module includes six event experiences", async () => {
  const content = await readFile(new URL("../components/santa/site-content.ts", import.meta.url), "utf8");

  for (const title of ["Home visits", "Birthday surprises", "Corporate events", "Schools & groups", "Community celebrations", "Photo sessions"]) {
    assert.match(content, new RegExp(title.replace("&", "&")));
  }
});

test("the page exposes every narrative destination", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  for (const id of ["meet-jim", "experiences", "visit", "gallery", "faq", "booking"]) {
    assert.match(page, new RegExp(`id=["']${id}["']`));
  }
});

test("the booking section presents the active Santa request path", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Holiday inquiries are open/i);
  assert.match(page, /<InquiryForm \/>/);
  assert.match(page, /Dates and timing are confirmed directly after your inquiry is reviewed/i);
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
