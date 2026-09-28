import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const stylesUrl = new URL("../public/multipage.css", import.meta.url);

test("homepage polish uses deliberate wrappers for editorial composition", async () => {
  const page = await readFile(pageUrl, "utf8");

  for (const hook of [
    "home-story__frame",
    "home-experience-card__body",
    "visit-path__connector",
    "home-gallery__item--tall",
    "home-invite__panel",
  ]) {
    assert.match(page, new RegExp(hook), `${hook} should be present on the homepage`);
  }
});

test("homepage polish styles hierarchy, motion, and mobile behavior intentionally", async () => {
  const css = await readFile(stylesUrl, "utf8");

  for (const selector of [
    ".home-story__frame",
    ".home-experience-card__body",
    ".visit-path__connector",
    ".home-gallery__item--tall",
    ".home-invite__panel",
  ]) {
    assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${selector} should have styling`);
  }

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
});
