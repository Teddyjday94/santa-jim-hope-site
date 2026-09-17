import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the FAQ uses native accessible disclosure controls", async () => {
  const faq = await readFile(new URL("../components/santa/faq-list.tsx", import.meta.url), "utf8");

  assert.match(faq, /<details/);
  assert.match(faq, /<summary/);
  assert.match(faq, /item\.question/);
  assert.match(faq, /item\.answer/);
});

test("the page passes the gallery records into the interactive lightbox", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /<GalleryLightbox items=\{galleryItems\}/);
  assert.match(page, /<FaqList items=\{faqs\}/);
});
