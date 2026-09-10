import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import * as siteContent from "../components/santa/site-content.ts";

const { galleryItems, socialReels = [] } = siteContent;

const expectedNewPhotos = [
  "/images/santa-jim-hope-community-selfie.jpg",
  "/images/santa-jim-hope-community-tree.jpg",
  "/images/santa-jim-hope-group-celebration.jpg",
  "/images/santa-jim-hope-holiday-swing.jpg",
  "/images/santa-jim-hope-mrs-claus-2025.jpg",
  "/images/santa-jim-hope-red-suit-portrait.jpg",
  "/images/santa-jim-hope-throne-family.jpg",
];

test("the gallery includes every newly supplied Santa Jim photo", async () => {
  const gallerySources = new Set(galleryItems.map((item) => item.src));

  assert.equal(galleryItems.length, 17);
  for (const src of expectedNewPhotos) {
    assert.ok(gallerySources.has(src), `missing gallery record for ${src}`);
    await access(new URL(`../public${src}`, import.meta.url));
  }
});

test("the social video section excludes the unavailable Facebook reel", () => {
  assert.deepEqual(
    socialReels.map(({ reelId, title }) => ({ reelId, title })),
    [
      { reelId: "4142406926072498", title: "Santa Jim Hope community reel" },
    ],
  );
});
