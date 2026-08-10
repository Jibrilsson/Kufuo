import type { Metadata } from "next";
import { DashboardView } from "../../dashboard/DashboardView";
import type { FounderProfile, Idea } from "../../lib/kufuo/types";

export const metadata: Metadata = {
  title: "Dashboard preview | Kufuo",
  robots: { index: false, follow: false },
};

const previewUserId = "11111111-1111-4111-8111-111111111111";

const previewProfile: FounderProfile = {
  id: previewUserId,
  full_name: "Salah Jibril",
  avatar_url: null,
  headline: "Product designer · Cofounder",
  bio: null,
  city: "Jeddah",
  country_code: "SA",
  role: "Product designer",
  linkedin_url: null,
  skills: ["Product strategy", "UX design"],
  industries: ["SaaS"],
  languages: ["Arabic", "English"],
  profile_type: "both",
  availability: "Evenings",
  commitment: "Part-time",
  startup_stage: "validation",
  looking_for: "Technical cofounder",
  working_style: "Async first",
  decision_style: "Evidence led",
  equity_approach: "Discuss after trial",
  is_visible: true,
  onboarding_complete: true,
  profile_strength: 82,
  created_at: "2026-08-01T09:00:00.000Z",
  updated_at: "2026-08-10T09:00:00.000Z",
};

const founders: FounderProfile[] = [
  { ...previewProfile, id: "22222222-2222-4222-8222-222222222222", full_name: "Noura Alharbi", headline: "Fintech operator · Former growth lead", city: "Riyadh", role: "Founder", skills: ["Growth", "Operations"], industries: ["Fintech"], profile_strength: 96 },
  { ...previewProfile, id: "33333333-3333-4333-8333-333333333333", full_name: "Omar Mansour", headline: "B2B founder · Supply-chain specialist", city: "Dubai", role: "Founder", skills: ["Sales", "Logistics"], industries: ["B2B SaaS"], profile_strength: 91 },
  { ...previewProfile, id: "44444444-4444-4444-8444-444444444444", full_name: "Maya Haddad", headline: "Climate-tech researcher · Community builder", city: "Amman", role: "Founder", skills: ["Research", "Partnerships"], industries: ["Climate tech"], profile_strength: 88 },
];

const previewIdeas: Idea[] = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", owner_id: founders[0].id, title: "A clearer financial workspace for independent teams", summary: "We are validating a bilingual workspace that helps small teams understand cash flow, upcoming obligations, and decisions without needing a finance department.", stage: "validation", city: "Remote", skills_needed: ["Full-stack engineering", "AI workflows"], industries: ["Fintech", "B2B SaaS"], status: "open", created_at: "2026-08-10T14:00:00.000Z", updated_at: "2026-08-10T14:00:00.000Z", owner: founders[0] },
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", owner_id: founders[1].id, title: "Modern procurement for growing restaurant groups", summary: "The problem and buying process are clear. I am looking for a product-minded technical partner to build the first focused workflow with three design partners.", stage: "mvp", city: "Dubai", skills_needed: ["Product engineering", "Data integrations"], industries: ["Hospitality", "Operations"], status: "open", created_at: "2026-08-09T10:30:00.000Z", updated_at: "2026-08-09T10:30:00.000Z", owner: founders[1] },
  { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", owner_id: founders[2].id, title: "Community-led energy efficiency for rented homes", summary: "Early interviews show renters want practical ways to lower their bills. We need a commercial cofounder who can shape partnerships and the go-to-market model.", stage: "discovery", city: "Amman", skills_needed: ["Partnerships", "Commercial strategy"], industries: ["Climate tech", "Consumer"], status: "open", created_at: "2026-08-08T08:00:00.000Z", updated_at: "2026-08-08T08:00:00.000Z", owner: founders[2] },
];

export default function DashboardPreviewPage() {
  return (
    <DashboardView
      userId={previewUserId}
      user={{ displayName: "Salah Jibril", email: "jibrilsson@gmail.com" }}
      profile={previewProfile}
      signOutHref="/login"
      initialIdeas={previewIdeas}
      initialRequests={[]}
    />
  );
}
