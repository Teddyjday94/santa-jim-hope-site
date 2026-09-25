import test from "node:test";
import assert from "node:assert/strict";
import { faqs } from "../components/santa/site-content.ts";
import { getSeoConfig } from "../lib/seo.ts";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPersonSchema,
  buildServiceSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
} from "../lib/seo-schema.ts";

const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });

test("person schema contains only verified Santa identity and Baton Rouge context", () => {
  const schema = buildPersonSchema(config);
  assert.equal(schema["@type"], "Person");
  assert.equal(schema.name, "Santa Jim of Baton Rouge");
  assert.equal(schema.jobTitle, "Professional Santa Claus performer");
  assert.equal(schema.url, "https://santajim.example/meet");
  assert.match(schema.image, /^https:\/\/santajim\.example\//);
  assert.equal("address" in schema, false);
  assert.equal("award" in schema, false);
});

test("website and webpage schemas share the configured canonical site", () => {
  const website = buildWebsiteSchema(config);
  const page = buildWebPageSchema({
    path: "/faq",
    name: "Santa Booking FAQ in Baton Rouge, LA | Santa Jim",
    description: "Answers about booking Santa Jim of Baton Rouge.",
  }, config);
  assert.equal(website.url, "https://santajim.example/");
  assert.equal(page.url, "https://santajim.example/faq");
  assert.equal(page.isPartOf["@id"], "https://santajim.example/#website");
});

test("service schema uses Baton Rouge as the verified service area", () => {
  const schema = buildServiceSchema({
    path: "/experiences/home-visits",
    name: "Santa Home Visits",
    description: "Personal Santa home visits in Baton Rouge.",
  }, config);
  assert.equal(schema["@type"], "Service");
  assert.equal(schema.areaServed.name, "Baton Rouge, Louisiana");
  assert.equal(schema.provider["@id"], "https://santajim.example/#santa-jim");
});

test("breadcrumb schema preserves route order", () => {
  const schema = buildBreadcrumbSchema([
    ["Home", "/"],
    ["Experiences", "/experiences"],
    ["Home visits", "/experiences/home-visits"],
  ], config);
  assert.equal(schema.itemListElement.length, 3);
  assert.equal(schema.itemListElement[2].position, 3);
  assert.equal(schema.itemListElement[2].item, "https://santajim.example/experiences/home-visits");
});

test("FAQ schema exactly mirrors the visible FAQ questions and answers", () => {
  const schema = buildFaqSchema(faqs, config);
  assert.equal(schema["@type"], "FAQPage");
  assert.deepEqual(
    schema.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]),
    faqs.map((item) => [item.question, item.answer]),
  );
});
