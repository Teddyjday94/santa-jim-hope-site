import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the homepage presents the Santa brand and routes customers to booking", async () => {
  const [page, header] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/santa/site-header.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Christmas feels closer when/);
  assert.match(page, /Santa walks in/);
  assert.match(page, /href="\/invite"/);
  assert.match(header, /\["Experiences", "\/experiences"\]/);
  assert.match(header, /href="\/invite"[^>]*>Invite Santa Jim/);
});

test("the root metadata describes the approved Baton Rouge Santa service", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /Santa Jim of Baton Rouge/);
  assert.match(layout, /family celebrations, birthdays, schools, businesses, community events/);
  assert.match(layout, /experience-media\.css/);
  assert.match(layout, /scheduler\.css/);
  assert.match(layout, /admin\.css/);
});

test("the public header separates customer booking from the private Santa portal", async () => {
  const header = await readFile(new URL("../components/santa/site-header.tsx", import.meta.url), "utf8");

  assert.match(header, /href="\/santa-admin"[^>]*>Santa Portal/);
  assert.match(header, /href="\/invite"[^>]*>Invite Santa Jim/);
  assert.match(header, /<nav[\s\S]*href="\/santa-admin"[\s\S]*<\/nav>/);
});
