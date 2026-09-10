import test from "node:test";
import assert from "node:assert/strict";

import * as siteContent from "../components/santa/site-content.ts";
import {
  galleryItems,
  heroMedia,
  santaProfile,
} from "../components/santa/site-content.ts";

test("the public-facing Santa profile uses Jim Hope's known identity without inventing a biography", () => {
  assert.deepEqual(santaProfile, {
    name: "Jim Hope",
    displayName: "Santa Jim Hope",
    shortName: "Santa Jim",
  });
});

test("the gallery presents all ten supplied Jim Hope photographs", () => {
  assert.equal(galleryItems.length, 10);
  assert.equal(new Set(galleryItems.map((item) => item.src)).size, 10);
  assert.ok(galleryItems.every((item) => item.src.startsWith("/images/jim-hope-")));
  assert.ok(galleryItems.some((item) => item.caption === "Storytime visits"));
  assert.ok(galleryItems.some((item) => item.caption === "Pet-friendly moments"));
  assert.ok(galleryItems.some((item) => item.caption === "Community celebrations"));
});

test("the hero motion has a still-image fallback and a silent loop source", () => {
  assert.deepEqual(heroMedia, {
    posterSrc: "/images/jim-hope-throne.webp",
    videoSrc: "/videos/jim-hope-christmas-loop.mp4",
    alt: "Santa Jim Hope seated on an ornate holiday throne",
  });
});

test("the backdrop uses recognizable snowflakes without the orange ambient orb", () => {
  assert.ok(Array.isArray(siteContent.snowflakes));
  assert.equal(siteContent.snowflakes.length, 16);
  assert.ok(siteContent.snowflakes.every((flake) => ["❄︎", "❅", "❆"].includes(flake.symbol)));
  assert.ok(new Set(siteContent.snowflakes.map((flake) => flake.symbol)).size >= 3);
  assert.deepEqual(siteContent.ambientOrbs, ["one", "three"]);
});
