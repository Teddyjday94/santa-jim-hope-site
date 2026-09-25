import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("production metadata becomes indexable only after explicit opt in", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const metadata = buildPublicMetadata({
    title: "Santa for Hire in Baton Rouge, LA | Santa Jim",
    description: "Professional Santa appearances in Baton Rouge, Louisiana.",
    path: "/",
  }, config);
  assert.equal(metadata.robots?.index, true);
  assert.equal(metadata.robots?.follow, true);
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

test("sitemap contains every public route, including invite, and excludes private routes", () => {
  const config = getSeoConfig({ SITE_URL: "https://santajim.example", SEO_INDEX: "true" });
  const sitemap = buildSitemap(config);
  const urls = sitemap.map((entry) => new URL(entry.url).pathname);
  assert.ok(PUBLIC_ROUTES.includes("/invite"));
  for (const route of PUBLIC_ROUTES) assert.ok(urls.includes(route));
  for (const prefix of PRIVATE_ROUTE_PREFIXES) assert.ok(urls.every((route) => !route.startsWith(prefix)));
});

const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const nextConfigSource = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
const workflowSource = await readFile(new URL("../.github/workflows/verify.yml", import.meta.url), "utf8");

test("root layout derives metadataBase and default robots from SEO config", () => {
  assert.match(layoutSource, /metadataBase:\s*config\.siteUrl/);
  assert.match(layoutSource, /buildPublicMetadata/);
});

test("Next config sends noindex headers on staging and private paths", () => {
  assert.match(nextConfigSource, /X-Robots-Tag/);
  assert.match(nextConfigSource, /SEO_INDEX/);
  assert.match(nextConfigSource, /santa-admin/);
  assert.match(nextConfigSource, /api/);
});

test("verification workflow runs lint in addition to tests and build", () => {
  assert.match(workflowSource, /- name: Lint\s+run: npm run lint/);
  assert.match(workflowSource, /run: npm test/);
  assert.match(workflowSource, /run: npm run build/);
});
