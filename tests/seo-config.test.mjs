import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_URL,
  PRIVATE_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  absoluteUrl,
  buildPublicMetadata,
  buildRobots,
  buildSitemap,
  getSeoConfig,
} from "../lib/seo.ts";

test("SEO defaults to the Vercel hostname with indexing disabled", () => {
  const config = getSeoConfig({});
  assert.equal(config.siteUrl.origin, DEFAULT_SITE_URL);
  assert.equal(config.indexingEnabled, false);
});

test("SEO_INDEX must be exactly true before indexing is enabled", () => {
  assert.equal(getSeoConfig({ SEO_INDEX: "false" }).indexingEnabled, false);
  assert.equal(getSeoConfig({ SEO_INDEX: "TRUE" }).indexingEnabled, false);
  assert.equal(getSeoConfig({ SEO_INDEX: "true" }).indexingEnabled, true);
});

test("SITE_URL changes canonical origin without implicitly enabling indexing", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example/" });
  assert.equal(config.siteUrl.origin, "https://santajim.example");
  assert.equal(config.indexingEnabled, false);
  assert.equal(absoluteUrl("/faq", config), "https://santajim.example/faq");
});

test("staging metadata is noindex and canonicalized", () => {
  const config = getSeoConfig({});
  const metadata = buildPublicMetadata({
    title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
    description: "Professional Santa appearances in Baton Rouge, Louisiana.",
    path: "/",
  }, config);
  assert.equal(metadata.alternates?.canonical, DEFAULT_SITE_URL + "/");
  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, false);
});

test("production robots allows public routes while blocking private routes", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const robots = buildRobots(config);
  assert.deepEqual(robots.rules, [{
    userAgent: "*",
    allow: "/",
    disallow: ["/santa-admin", "/api/"],
  }]);
  assert.equal(robots.sitemap, "https://santajim.example/sitemap.xml");
});

test("staging robots disallows everything and does not advertise a sitemap", () => {
  const robots = buildRobots(getSeoConfig({}));
  assert.deepEqual(robots.rules, [{ userAgent: "*", disallow: "/" }]);
  assert.equal("sitemap" in robots, false);
});

test("sitemap contains public routes and excludes private routes", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const sitemap = buildSitemap(config);
  const urls = sitemap.map((entry) => new URL(entry.url).pathname);
  for (const route of PUBLIC_ROUTES) assert.ok(urls.includes(route));
  for (const prefix of PRIVATE_ROUTE_PREFIXES) assert.ok(urls.every((route) => !route.startsWith(prefix)));
});
