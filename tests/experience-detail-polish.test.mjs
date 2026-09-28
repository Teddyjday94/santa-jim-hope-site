import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const detailUrl = new URL("../components/santa/experience-seo.ts", import.meta.url);
const pageUrl = new URL("../app/experiences/[slug]/page.tsx", import.meta.url);
const stylesUrl = new URL("../public/experience-detail-polish.css", import.meta.url);

test("each experience provides meaningful planning tip titles", async () => {
  const source = await readFile(detailUrl, "utf8");
  for (const title of [
    "Date & arrival",
    "Traditions & surprises",
    "Comfort & accessibility",
    "Guest of honor",
    "Party timing",
    "Keep the surprise",
    "Venue & logistics",
    "Santa’s role",
    "Schedule & timing",
    "Group size & ages",
    "Visit format",
    "Accessibility & coordination",
    "Event flow",
    "Santa’s setup",
    "Arrival & weather plan",
    "Session logistics",
    "Set & timing",
    "Guest flow",
  ]) {
    assert.match(source, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${title} should be present`);
  }
});

test("experience detail template uses polished planning and related-card hooks", async () => {
  const page = await readFile(pageUrl, "utf8");
  for (const hook of [
    "planning-card__step",
    "planning-card__icon",
    "related-experience-card__media",
    "related-experience-card__body",
    "related-experiences__footer",
  ]) {
    assert.match(page, new RegExp(hook), `${hook} should be present`);
  }
  assert.doesNotMatch(page, /Planning detail \{index \+ 1\}/);
});

test("experience detail polish includes responsive spacing and reduced-motion handling", async () => {
  const css = await readFile(stylesUrl, "utf8").catch(() => "");
  for (const selector of [
    ".planning-card",
    ".related-experience-card__body",
    ".related-experiences__footer",
  ]) {
    assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${selector} should have styles`);
  }
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
