import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Kufuo landing page with real authentication entry points", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Kufuo \| كفو — Find someone worthy of building with<\/title>/i);
  assert.match(html, /href="\/login\?returnTo=%2Fdashboard"[^>]*>Log in<\/a>/i);
  assert.match(html, /href="\/login\?mode=signup&amp;returnTo=%2Faccount"[^>]*>Join the community<\/a>/i);
  assert.match(html, /src="\/kufuo-logo\.svg"/i);
  assert.match(html, /Find the right person to build what comes next\./i);
  assert.doesNotMatch(html, /Saudi|السعود/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("ships the protected product routes and RLS-backed core data model", async () => {
  const requiredRoutes = [
    "../app/dashboard/page.tsx",
    "../app/account/page.tsx",
    "../app/discover/page.tsx",
    "../app/messages/page.tsx",
    "../app/connections/page.tsx",
    "../app/notifications/page.tsx",
    "../app/settings/page.tsx",
    "../app/ideas/new/page.tsx",
    "../app/privacy/page.tsx",
    "../app/terms/page.tsx",
    "../app/community-guidelines/page.tsx",
  ];
  await Promise.all(requiredRoutes.map((route) => access(new URL(route, import.meta.url))));

  const [migration, grants, client] = await Promise.all([
    readFile(new URL("../supabase/migrations/20260810152329_kufuo_core_mvp.sql", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260810161000_restrict_member_updates.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/kufuo/client.ts", import.meta.url), "utf8"),
  ]);

  for (const table of ["ideas", "connection_requests", "conversations", "messages", "posts", "notifications", "reports"]) {
    assert.match(migration, new RegExp(`create table(?: if not exists)? public\\.${table}\\b`, "i"));
    assert.match(migration, new RegExp(`['\"]${table}['\"]`, "i"));
  }
  assert.match(migration, /execute format\('alter table public\.%I enable row level security'/i);
  assert.match(grants, /grant update \(status, responded_at\) on table public\.connection_requests to authenticated/i);
  assert.match(grants, /grant update \(read_at\) on table public\.messages to authenticated/i);
  assert.match(client, /export async function loadDiscovery/);
  assert.match(client, /export async function sendConversationMessage/);
  assert.match(client, /export async function publishPost/);
});
