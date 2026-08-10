import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProtectedUser } from "../_components/protected-page";
import { createClient } from "../lib/supabase/server";
import type { FounderProfile } from "../lib/kufuo/types";
import { OnboardingView } from "./OnboardingView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Build your founder profile — Kufuo | كفو",
  description: "Tell Kufuo what you bring, how you work, and who you want to build with.",
};

export default async function OnboardingPage() {
  const user = await getProtectedUser("/onboarding");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.userId).maybeSingle();
  const profile = data as FounderProfile | null;

  if (profile?.onboarding_complete) redirect("/dashboard");

  return (
    <OnboardingView
      userId={user.userId}
      user={{ displayName: user.displayName, email: user.email }}
      initialProfile={profile}
    />
  );
}
