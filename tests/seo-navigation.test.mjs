import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const experiences = await readFile(new URL("../app/experiences/page.tsx", import.meta.url), "utf8");

test("homepage keeps the brand hero while adding explicit Baton Rouge service context", () => {
  assert.match(home, /Christmas feels closer when/);
  assert.match(home, /Professional Santa appearances in Baton Rouge/);
  assert.match(home, /buildPublicMetadata/);
  assert.match(home, /buildWebPageSchema/);
});

test("homepage featured experiences link to crawlable detail pages", () => {
  assert.match(home, /experienceDetails/);
  assert.match(home, /\/experiences\/\$\{detail\.slug\}/);
});

test("experiences hub uses canonical local metadata and links all experience details", () => {
  assert.match(experiences, /Santa Experiences in Baton Rouge, LA/);
  assert.match(experiences, /buildPublicMetadata/);
  assert.match(experiences, /experienceDetails/);
  assert.match(experiences, /\/experiences\/\$\{detail\.slug\}/);
});
