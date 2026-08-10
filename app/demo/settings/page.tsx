import type { Metadata } from "next";
import { MemberWorkspace } from "../../_components/MemberWorkspace";
import type { FounderProfile, MemberSettings } from "../../lib/kufuo/types";

export const metadata: Metadata = {
  title: "Settings preview | Kufuo",
  robots: { index: false, follow: false },
};

const previewUserId = "11111111-1111-4111-8111-111111111111";

const previewProfile: FounderProfile = {
  id: previewUserId,
  full_name: "Salah Jibril",
  avatar_url: null,
  headline: "Product designer · Cofounder",
  bio: "I build clear digital products and help early teams turn ambiguous ideas into focused products.",
  city: "Jeddah",
  country_code: "SA",
  role: "Product designer",
  linkedin_url: "https://www.linkedin.com/",
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

const previewSettings: MemberSettings = {
  user_id: previewUserId,
  match_notifications: true,
  introduction_notifications: true,
  community_notifications: false,
  profile_visible: true,
  city_visible: true,
  preferred_language: "en",
};

export default function SettingsPreviewPage() {
  return <MemberWorkspace mode="settings" userId={previewUserId} user={{ displayName: "Salah Jibril", email: "jibrilsson@gmail.com" }} signOutHref="/login" previewProfile={previewProfile} previewSettings={previewSettings} />;
}
