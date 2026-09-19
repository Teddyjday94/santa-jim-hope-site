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

test("dedicated gallery and FAQ routes use the interactive content components", async () => {
  const [galleryPage, faqPage] = await Promise.all([
    readFile(new URL("../app/gallery/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/faq/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(galleryPage, /<GalleryLightbox items=\{galleryItems\}/);
  assert.match(faqPage, /<FaqList items=\{faqs\}/);
});
