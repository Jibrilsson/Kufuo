import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Compass,
  Eye,
  Languages,
  MapPin,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { getProtectedUser } from "../../_components/protected-page";
import { normalizeLinkedinUrl } from "../../lib/kufuo/profile";
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
  const isOwner = profile.id === user.userId;
  if (!isOwner && (!profile.is_visible || !profile.onboarding_complete)) notFound();

  const linkedinUrl = normalizeLinkedinUrl(profile.linkedin_url);
  const preferences: Array<[string, string | null]> = [
    ["Looking for", profile.looking_for],
    ["Startup stage", profile.startup_stage],
    ["Commitment", profile.commitment],
    ["Working style", profile.working_style],
    ["Decision style", profile.decision_style],
    ["Equity approach", profile.equity_approach],
  ];
  const visiblePreferences = preferences.filter(([, value]) => Boolean(value));
  const brings = profile.profile_type === "idea" ? "An idea" : profile.profile_type === "skill" ? "A skill" : "An idea and skills";

  return (
    <main className="member-profile-page">
      <header className="member-topbar">
        <a className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a>
        <nav><a href="/dashboard"><Compass size={17} />Dashboard</a><a href="/discover">Discover</a></nav>
        <div><a className="button button-small button-secondary" href="/discover">Back to discover</a></div>
      </header>

      <section className="member-hero section-frame">
        <div className="member-avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name ?? "Founder"} /> : <UserRound size={54} />}</div>
        <div className="member-identity">
          <p className="kicker">Founder profile</p>
          <span className="account-verified"><ShieldCheck size={16} />Kufuo member</span>
          <h1>{profile.full_name ?? "Kufuo member"}</h1>
          <h2>{profile.headline ?? profile.role ?? "Founder"}</h2>
          {linkedinUrl && <a className="member-linkedin-link" href={linkedinUrl} target="_blank" rel="noopener noreferrer"><FaLinkedin aria-hidden="true" />LinkedIn profile</a>}
          <div className="member-meta">
            {profile.city && <span><MapPin size={16} />{profile.city}</span>}
            {profile.availability && <span><Clock3 size={16} />{profile.availability}</span>}
            {profile.languages.length > 0 && <span><Languages size={16} />{profile.languages.join(" · ")}</span>}
          </div>
          {profile.bio && <p className="member-intro">{profile.bio}</p>}
          <IntroductionButton userId={user.userId} recipientId={profile.id} />
        </div>
      </section>

      <div className="member-content section-frame">
        <div className="member-main">
          {profile.skills.length > 0 || profile.industries.length > 0 ? <section className="member-two-column">
            {profile.skills.length > 0 && <article><div className="member-section-title"><span className="side-icon"><Target size={20} /></span><h2>Skills</h2></div><div className="member-tag-list">{profile.skills.map((item) => <span key={item}>{item}</span>)}</div></article>}
            {profile.industries.length > 0 && <article><div className="member-section-title"><span className="side-icon"><BriefcaseBusiness size={20} /></span><h2>Sectors</h2></div><div className="member-tag-list">{profile.industries.map((item) => <span key={item}>{item}</span>)}</div></article>}
          </section> : null}

          {visiblePreferences.length > 0 && <section className="member-section">
            <div className="member-section-title"><span className="side-icon inverse"><BriefcaseBusiness size={20} /></span><h2>Founder preferences</h2></div>
            <dl className="member-preferences">{visiblePreferences.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </section>}
        </div>

        <aside className="member-sidebar">
          <section className="member-side-card member-glance-card">
            <div className="member-side-heading"><Target size={21} /><span>At a glance</span></div>
            <dl>
              <div><dt><BriefcaseBusiness size={16} />Brings</dt><dd>{brings}</dd></div>
              {profile.commitment && <div><dt><Clock3 size={16} />Commitment</dt><dd>{profile.commitment}</dd></div>}
              {profile.startup_stage && <div><dt><Target size={16} />Stage</dt><dd>{profile.startup_stage}</dd></div>}
              <div><dt><Eye size={16} />Visibility</dt><dd>Visible to Kufuo members</dd></div>
            </dl>
          </section>
          <section className="member-side-card member-trust-card">
            <div className="member-side-heading"><ShieldCheck size={21} /><span>Member context</span></div>
            <p><CheckCircle2 size={17} />Core compatibility fields completed</p>
            <p><CheckCircle2 size={17} />Contact details remain private</p>
            <p className="member-trust-note">A completed profile helps you evaluate fit. Always validate expectations directly before making a commitment.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
