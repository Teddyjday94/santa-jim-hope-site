import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the page presents the working Santa brand and primary booking path", async () => {
  const [page, header] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/santa/site-header.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /santaProfile\.displayName/);
  assert.match(page, /Christmas feels closer when Santa walks in\./);
  assert.match(page, /href="#booking"/);
  assert.match(header, /\["Experiences", "#experiences"\]/);
});

test("the root metadata describes the Santa service", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /Santa Jim Hope \| Holiday Visits & Event Appearances/);
  assert.match(layout, /family celebrations, birthdays, schools, businesses, community events/);
});
