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

test("server-renders the expert network landing page with sign-up entry points", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Kufuo \| كفو — Vetted Arab experts, by the hour<\/title>/i);
  assert.match(html, /src="\/kufuo-logo\.svg"/i);
  assert.match(html, /Vetted Arab expertise, by the hour\./i);
  assert.match(html, /href="\/login\?mode=signup&amp;returnTo=%2Fapply"/i);
  assert.match(html, /id="request"/i);
  assert.doesNotMatch(html, /Mercor|cofounder/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("mirrors forward chevrons throughout RTL interfaces", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\[dir=["']rtl["']\]\s+\.lucide-chevron-right\s*\{[^}]*transform:\s*scaleX\(-1\)/i);
});

test("routes signed-in people by role and pins OAuth redirects to Kufuo", async () => {
  const [login, callback, config, session] = await Promise.all([
    readFile(new URL("../app/login/LoginView.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/supabase/config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/kufuo/session.ts", import.meta.url), "utf8"),
  ]);
  assert.match(login, /authRedirectOrigin\(window\.location\.origin\)/);
  assert.match(callback, /authRedirectOrigin\(url\.origin\)/);
  assert.match(config, /NEXT_PUBLIC_SITE_URL \?\? "https:\/\/kufuo\.com"/);
  assert.match(session, /if \(role === "admin"\) return "\/admin"/);
  assert.match(session, /if \(role === "company"\) return "\/company"/);
  assert.match(session, /if \(role === "expert"\) return "\/expert"/);
});

test("ships the expert, company and admin routes and the RLS-backed schema", async () => {
  const requiredRoutes = [
    "../app/home/page.tsx",
    "../app/start/page.tsx",
    "../app/apply/page.tsx",
    "../app/expert/page.tsx",
    "../app/company/page.tsx",
    "../app/company/new/page.tsx",
    "../app/admin/page.tsx",
    "../app/privacy/page.tsx",
    "../app/terms/page.tsx",
    "../app/community-guidelines/page.tsx",
  ];
  await Promise.all(requiredRoutes.map((route) => access(new URL(route, import.meta.url))));

  const migration = await readFile(new URL("../supabase/migrations/20261125184303_expert_network_core.sql", import.meta.url), "utf8");
  for (const table of ["experts", "interviews", "interview_results", "companies", "company_requests", "bookings", "booking_company_terms", "booking_expert_terms", "time_entries", "invoices", "payouts", "audit_log"]) {
    assert.match(migration, new RegExp(`create table public\\.${table}\\b`, "i"));
    assert.match(migration, new RegExp(`'${table}'`, "i"));
  }
  assert.match(migration, /execute format\('alter table public\.%I enable row level security'/i);
  assert.match(migration, /Experts can only accept or decline a booking/);
  assert.match(migration, /Companies can only approve or dispute hours/);
});
