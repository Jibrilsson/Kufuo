import { notFound } from "next/navigation";
import { BriefcaseBusiness, Clock3, Compass, Languages, MapPin, ShieldCheck, Target, UserRound } from "lucide-react";
import { getProtectedUser } from "../../_components/protected-page";
import { createClient } from "../../lib/supabase/server";
import type { FounderProfile } from "../../lib/kufuo/types";
import { IntroductionButton } from "./IntroductionButton";

export const dynamic = "force-dynamic";

export default async function FounderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getProtectedUser("/discover");
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const profile = data as FounderProfile;

  return <main className="member-profile-page"><header className="member-topbar"><a className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a><nav><a href="/dashboard"><Compass size={17} />Dashboard</a><a href="/discover">Discover</a></nav><div><a className="button button-small button-secondary" href="/discover">Back to discover</a></div></header><section className="member-hero section-frame"><div className="member-avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name ?? "Founder"} /> : <UserRound size={54} />}</div><div className="member-identity"><p className="kicker">Founder profile</p><span className="account-verified"><ShieldCheck size={16} />Kufuo member</span><h1>{profile.full_name ?? "Kufuo member"}</h1><h2>{profile.headline ?? profile.role ?? "Founder"}</h2><div className="member-meta">{profile.city && <span><MapPin size={16} />{profile.city}</span>}{profile.availability && <span><Clock3 size={16} />{profile.availability}</span>}{profile.languages.length > 0 && <span><Languages size={16} />{profile.languages.join(" · ")}</span>}</div><p className="member-intro">{profile.bio}</p><IntroductionButton userId={user.userId} recipientId={profile.id} /></div></section><div className="member-content section-frame"><div className="member-main"><section className="member-two-column"><article><div className="member-section-title"><span className="side-icon"><Target size={20} /></span><h2>Skills</h2></div><div className="member-tag-list">{profile.skills.map((item) => <span key={item}>{item}</span>)}</div></article><article><div className="member-section-title"><span className="side-icon"><BriefcaseBusiness size={20} /></span><h2>Sectors</h2></div><div className="member-tag-list">{profile.industries.map((item) => <span key={item}>{item}</span>)}</div></article></section><section className="member-section"><div className="member-section-title"><span className="side-icon inverse"><BriefcaseBusiness size={20} /></span><h2>Founder preferences</h2></div><dl className="member-preferences">{[["Looking for", profile.looking_for], ["Startup stage", profile.startup_stage], ["Commitment", profile.commitment], ["Working style", profile.working_style], ["Decision style", profile.decision_style], ["Equity approach", profile.equity_approach]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not specified"}</dd></div>)}</dl></section></div><aside className="member-sidebar"><section className="member-side-card"><div className="member-side-heading"><Target size={21} /><span>Profile strength</span></div><strong>{profile.profile_strength}%</strong><div className="member-progress"><span style={{ width: `${profile.profile_strength}%` }} /></div><p>This member completed the core founder compatibility fields.</p></section></aside></div></main>;
}
