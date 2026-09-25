import test from "node:test";
import assert from "node:assert/strict";

import * as siteContent from "../components/santa/site-content.ts";
import {
  galleryItems,
  heroMedia,
  santaProfile,
} from "../components/santa/site-content.ts";

test("the public-facing Santa profile uses the approved Baton Rouge brand", () => {
  assert.deepEqual(santaProfile, {
    name: "Santa Jim of Baton Rouge",
    displayName: "Santa Jim of Baton Rouge",
    shortName: "Santa Jim",
  });
});

test("the gallery keeps supplied Santa Jim photography unique and descriptive", () => {
  assert.ok(galleryItems.length >= 17);
  assert.equal(new Set(galleryItems.map((item) => item.src)).size, galleryItems.length);
  assert.ok(galleryItems.every((item) => item.alt.trim().length > 20));
});

test("the hero motion has the approved still-image fallback and silent loop source", () => {
  assert.deepEqual(heroMedia, {
    posterSrc: "/images/jim-hope-throne.webp",
    videoSrc: "/videos/jim-hope-christmas-loop.mp4",
    alt: "Santa Jim of Baton Rouge seated on an ornate holiday throne",
  });
});

test("the backdrop uses recognizable snowflakes without the orange ambient orb", () => {
  assert.ok(Array.isArray(siteContent.snowflakes));
  assert.equal(siteContent.snowflakes.length, 16);
  assert.ok(siteContent.snowflakes.every((flake) => ["❄︎", "❅", "❆"].includes(flake.symbol)));
  assert.ok(new Set(siteContent.snowflakes.map((flake) => flake.symbol)).size >= 3);
  assert.deepEqual(siteContent.ambientOrbs, ["one", "three"]);
});
