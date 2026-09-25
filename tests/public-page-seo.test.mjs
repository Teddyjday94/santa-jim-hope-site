import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Meet page uses canonical Baton Rouge metadata and WebPage schema", async () => {
  const source = await read("app/meet/page.tsx");
  assert.match(source, /Meet Santa Jim of Baton Rouge \| Professional Santa/);
  assert.match(source, /buildPublicMetadata/);
  assert.match(source, /buildWebPageSchema/);
  assert.match(source, /path: "\/meet"/);
});

test("Gallery page uses canonical Baton Rouge appearance metadata and WebPage schema", async () => {
  const source = await read("app/gallery/page.tsx");
  assert.match(source, /Santa Jim Photo Gallery \| Baton Rouge Holiday Appearances/);
  assert.match(source, /buildPublicMetadata/);
  assert.match(source, /buildWebPageSchema/);
  assert.match(source, /path: "\/gallery"/);
});

test("Invite page keeps the scheduler form while adding booking-focused canonical metadata", async () => {
  const source = await read("app/invite/page.tsx");
  assert.match(source, /Book Santa Jim in Baton Rouge, LA \| Holiday Appearance Inquiry/);
  assert.match(source, /buildPublicMetadata/);
  assert.match(source, /buildWebPageSchema/);
  assert.match(source, /<InquiryForm \/>/);
});

test("Santa admin subtree inherits explicit noindex metadata", async () => {
  const source = await read("app/santa-admin/layout.tsx");
  assert.match(source, /index:\s*false/);
  assert.match(source, /follow:\s*false/);
  assert.match(source, /nocache:\s*true/);
});
