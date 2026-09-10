import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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

test("the page is transparent about details that are still to come", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /service area, and booking details are coming soon/i);
  assert.match(page, /will be added once those details are confirmed/i);
});
