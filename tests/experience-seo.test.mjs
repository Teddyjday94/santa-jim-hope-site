import test from "node:test";
import assert from "node:assert/strict";
import { experiences } from "../components/santa/site-content.ts";
import {
  experienceDetails,
  getExperienceBySlug,
} from "../components/santa/experience-seo.ts";

const expectedSlugs = [
  "home-visits",
  "birthday-surprises",
  "corporate-events",
  "schools-groups",
  "community-celebrations",
  "photo-sessions",
];

test("SEO experience data defines exactly the six approved search landing pages", () => {
  assert.deepEqual(experienceDetails.map((item) => item.slug), expectedSlugs);
  assert.equal(new Set(experienceDetails.map((item) => item.seoTitle)).size, 6);
  assert.equal(new Set(experienceDetails.map((item) => item.seoDescription)).size, 6);
});

test("every experience landing page has useful Baton Rouge content", () => {
  const currentTitles = new Set(experiences.map((item) => item.title));
  for (const item of experienceDetails) {
    assert.ok(currentTitles.has(item.title), `${item.title} must map to an existing experience`);
    assert.match(item.seoTitle, /Baton Rouge/);
    assert.match(item.seoDescription, /Baton Rouge/);
    assert.ok(item.detailIntro.length >= 100, `${item.slug} needs a substantial introduction`);
    assert.ok(item.planningTips.length >= 3, `${item.slug} needs practical planning details`);
  }
});

test("related experience links point only to approved experience slugs", () => {
  const valid = new Set(expectedSlugs);
  for (const item of experienceDetails) {
    for (const slug of item.relatedSlugs) {
      assert.ok(valid.has(slug), `${item.slug} has invalid related slug ${slug}`);
      assert.notEqual(slug, item.slug);
    }
  }
});

test("experience lookup returns approved data and rejects unknown slugs", () => {
  assert.equal(getExperienceBySlug("home-visits")?.title, "Home visits");
  assert.equal(getExperienceBySlug("not-a-real-experience"), undefined);
});
