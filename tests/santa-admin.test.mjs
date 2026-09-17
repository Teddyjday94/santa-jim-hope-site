import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Santa admin page renders the protected dashboard", async () => {
  const page = await read("app/santa-admin/page.tsx");
  assert.match(page, /AdminDashboard/);
  assert.match(page, /Santa Jim.*Scheduler/i);
});

test("admin dashboard authenticates and keeps its session in browser session storage", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /grant_type=password/);
  assert.match(dashboard, /sessionStorage/);
  assert.match(dashboard, /Authorization/);
  assert.match(dashboard, /Sign out/i);
});

test("admin login offers a neutral password recovery request", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /Forgot your password\?/i);
  assert.match(dashboard, /\/auth\/v1\/recover/);
  assert.match(dashboard, /redirect_to/);
  assert.match(dashboard, /If an account exists for that email/i);
});

test("admin recovery callback requires and confirms a strong new password", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /type.*recovery/);
  assert.match(dashboard, /\/auth\/v1\/user/);
  assert.match(dashboard, /New password/i);
  assert.match(dashboard, /Confirm new password/i);
  assert.match(dashboard, /minLength=\{12\}/);
  assert.match(dashboard, /passwords do not match/i);
});

test("admin dashboard can accept and decline requests", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /confirmed/);
  assert.match(dashboard, /declined/);
  assert.match(dashboard, /Accept/);
  assert.match(dashboard, /Decline/);
});

test("admin dashboard supports all day modes and editable season settings", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  for (const mode of ["normal", "photos_only", "blocked", "custom"]) {
    assert.match(dashboard, new RegExp(mode));
  }
  for (const label of ["Season start", "Season end", "Default start", "Default end", "Pending hold"]) {
    assert.match(dashboard, new RegExp(label, "i"));
  }
});

test("admin settings route verifies Santa authorization before updates", async () => {
  const route = await read("app/api/santa/admin/settings/route.ts");
  assert.match(route, /assertSantaAdmin/);
  assert.match(route, /santa_schedule_settings/);
  assert.match(route, /santa_services/);
  assert.match(route, /PATCH/);
});
