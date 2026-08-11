"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleUserRound,
  FileText,
  Lightbulb,
  ListFilter,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { loadOpportunityFeed, requestIntroduction } from "../lib/kufuo/client";
import { getLanguageSnapshot, getServerLanguageSnapshot, subscribeToLanguage } from "../lib/kufuo/language";
import type { ConnectionRequest, FounderProfile, Idea, Language } from "../lib/kufuo/types";
import { MemberHeader } from "../_components/MemberHeader";
import { MemberPromoBanner } from "../_components/MemberPromoBanner";

const copy = {
  en: {
    search: "Search opportunities or skills",
    nav: ["Opportunities", "Discover", "Messages", "Connections", "Notifications", "Profile", "Settings"],
    kicker: "Opportunities built for cofounders",
    title: "Find a startup worth joining.",
    intro: "Browse clear founder opportunities, understand what is missing, and apply with a thoughtful introduction.",
    create: "Post an opportunity",
    tabs: ["For you", "Newest", "My applications", "My ideas"],
    stages: ["All stages", "Discovery", "Validation", "MVP", "Early revenue", "Growth"],
    filters: "Filter opportunities",
    applied: "Application sent",
    accepted: "Application accepted",
    declined: "Application closed",
    apply: "Apply to join",
    viewFounder: "View founder",
    manage: "Review applicants",
    emptyTitle: "No opportunities match this view yet.",
    emptyBody: "Try another filter, or post the opportunity you want the right cofounder to discover.",
    applicationTitle: "Apply to join this idea",
    applicationBody: "Explain what you can contribute, how much time you can commit, and why this problem matters to you.",
    messagePlaceholder: "I can contribute… My availability is… I’m interested because…",
    send: "Send application",
    cancel: "Cancel",
    sent: "Your application has been sent to the founder.",
    completeProfile: "Complete your profile",
    profileHint: "A complete profile gives founders the context they need before replying.",
    signOut: "Sign out",
    activity: "Your activity",
    applications: "Applications",
    openIdeas: "Open ideas",
    privacy: "Your contact details remain private until both sides choose to connect.",
  },
  ar: {
    search: "ابحث في الفرص أو المهارات",
    nav: ["الفرص", "استكشف", "الرسائل", "العلاقات", "التنبيهات", "الملف الشخصي", "الإعدادات"],
    kicker: "فرص مصممة للشركاء المؤسسين",
    title: "اعثر على مشروع يستحق أن تنضم إليه.",
    intro: "استكشف فرصًا واضحة، واعرف المهارة الناقصة، وقدّم طلب انضمام يوضح القيمة التي تضيفها.",
    create: "انشر فرصة",
    tabs: ["الأنسب لك", "الأحدث", "طلباتي", "أفكاري"],
    stages: ["كل المراحل", "الاستكشاف", "التحقق", "النموذج الأولي", "إيرادات مبكرة", "النمو"],
    filters: "تصفية الفرص",
    applied: "تم إرسال الطلب",
    accepted: "تم قبول الطلب",
    declined: "أُغلق الطلب",
    apply: "قدّم طلب انضمام",
    viewFounder: "عرض المؤسس",
    manage: "راجع المتقدمين",
    emptyTitle: "ما فيه فرص مطابقة لهذا العرض حتى الآن.",
    emptyBody: "جرّب تصفية مختلفة، أو انشر الفرصة التي تبي الشريك المناسب يكتشفها.",
    applicationTitle: "قدّم للانضمام إلى الفكرة",
    applicationBody: "وضّح وش تقدر تضيف، وكم وقت تقدر تلتزم، وليش هذي المشكلة تهمك.",
    messagePlaceholder: "أقدر أضيف… تفرغي هو… ومهتم لأن…",
    send: "إرسال الطلب",
    cancel: "إلغاء",
    sent: "تم إرسال طلبك للمؤسس.",
    completeProfile: "أكمل ملفك",
    profileHint: "الملف المكتمل يعطي المؤسس صورة أوضح قبل الرد.",
    signOut: "تسجيل الخروج",
    activity: "نشاطك",
    applications: "الطلبات",
    openIdeas: "الأفكار المفتوحة",
    privacy: "تبقى بيانات تواصلك خاصة إلى أن يختار الطرفان التواصل.",
  },
} as const;

const navIcons = [BriefcaseBusiness, Search, Mail, UsersRound, Bell, CircleUserRound, Settings] as const;
const navHrefs = ["/dashboard", "/discover", "/messages", "/connections", "/notifications", "/account", "/settings"];

const stageLabel = (stage: string, ar: boolean) => ({
  discovery: ar ? "استكشاف المشكلة" : "Problem discovery",
  validation: ar ? "التحقق" : "Validation",
  mvp: ar ? "النموذج الأولي" : "MVP",
  early_revenue: ar ? "إيرادات مبكرة" : "Early revenue",
  growth: ar ? "النمو" : "Growth",
}[stage] ?? stage);

function statusCopy(request: ConnectionRequest | undefined, language: Language) {
  if (!request) return null;
  const t = copy[language];
  if (request.status === "accepted") return t.accepted;
  if (request.status === "declined" || request.status === "cancelled") return t.declined;
  return t.applied;
}

type DashboardViewProps = {
  userId: string;
  user: { displayName: string; email: string };
  profile: FounderProfile | null;
  signOutHref: string;
  initialIdeas?: Idea[];
  initialRequests?: ConnectionRequest[];
};

export function DashboardView({ userId, user, profile, signOutHref, initialIdeas, initialRequests }: DashboardViewProps) {
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, getServerLanguageSnapshot);
  const [activeTab, setActiveTab] = useState(0);
  const [stage, setStage] = useState("all");
  const [query, setQuery] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas ?? []);
  const [requests, setRequests] = useState<ConnectionRequest[]>(initialRequests ?? []);
  const [loading, setLoading] = useState(!initialIdeas);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [application, setApplication] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const arabic = language === "ar";
  const t = copy[language];
  const progress = profile?.profile_strength ?? 20;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  useEffect(() => {
    if (initialIdeas) return;
    let alive = true;
    loadOpportunityFeed(userId)
      .then((data) => { if (alive) { setIdeas(data.ideas); setRequests(data.requests); } })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Could not load opportunities."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId, initialIdeas]);

  const visibleIdeas = useMemo(() => {
    const requestedIds = new Set(requests.filter((request) => request.requester_id === userId && request.idea_id).map((request) => request.idea_id));
    return ideas.filter((idea) => {
      if (activeTab === 0 && (idea.owner_id === userId || requestedIds.has(idea.id))) return false;
      if (activeTab === 2 && !requestedIds.has(idea.id)) return false;
      if (activeTab === 3 && idea.owner_id !== userId) return false;
      if ((activeTab === 0 || activeTab === 1) && idea.status !== "open") return false;
      if (stage !== "all" && idea.stage !== stage) return false;
      const haystack = `${idea.title} ${idea.summary} ${idea.city ?? ""} ${idea.skills_needed.join(" ")} ${idea.industries.join(" ")}`.toLowerCase();
      return haystack.includes(query.toLowerCase().trim());
    });
  }, [ideas, requests, userId, activeTab, stage, query]);

  async function sendApplication() {
    if (!selectedIdea || application.trim().length < 20) {
      setError(arabic ? "اكتب رسالة واضحة من ٢٠ حرفًا على الأقل." : "Write a clear message of at least 20 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const request = await requestIntroduction(userId, selectedIdea.owner_id, application.trim(), selectedIdea.id);
      setRequests((current) => [request, ...current]);
      setSelectedIdea(null);
      setApplication("");
      setNotice(t.sent);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send your application.");
    } finally {
      setSubmitting(false);
    }
  }

  const myApplications = requests.filter((request) => request.requester_id === userId && request.idea_id).length;
  const myOpenIdeas = ideas.filter((idea) => idea.owner_id === userId && idea.status === "open").length;

  return (
    <main className="founder-app opportunity-app" dir={arabic ? "rtl" : "ltr"}>
      <MemberHeader user={user} active="opportunities" avatarUrl={profile?.avatar_url} searchValue={query} onSearchChange={setQuery} searchPlaceholder={t.search} />
      <MemberPromoBanner language={language} />

      <div className="dashboard-grid opportunity-grid">
        <aside className="dash-left">
          <section className="dash-mini-profile compact-profile-card"><div className="dash-profile-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={26} />}</div><div><h2>{profile?.full_name ?? user.displayName}</h2><p>{profile?.headline ?? (arabic ? "عضو كفو" : "Kufuo member")}</p></div><a href="/account"><span>{t.completeProfile}</span><b>{progress}%</b><ChevronRight className="directional-icon" size={15} /></a></section>
          <nav className="dash-nav" aria-label="Dashboard">{t.nav.map((label, index) => { const Icon = navIcons[index]; return <a className={index === 0 ? "is-active" : ""} href={navHrefs[index]} key={label}><Icon size={17} /><span>{label}</span></a>; })}</nav>
          <a className="dash-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a>
        </aside>

        <section className="dash-feed opportunity-feed">
          <header className="opportunity-heading"><div><p className="kicker">{t.kicker}</p><h1>{t.title}</h1><p>{t.intro}</p></div><a className="button" href="/ideas/new"><Lightbulb size={17} />{t.create}</a></header>
          <section className="opportunity-toolbar" aria-label={t.filters}>
            <div className="dash-feed-tabs" role="tablist">{t.tabs.map((tab, index) => <button className={activeTab === index ? "is-active" : ""} type="button" role="tab" aria-selected={activeTab === index} onClick={() => setActiveTab(index)} key={tab}>{tab}</button>)}</div>
            <label><ListFilter size={16} /><span className="sr-only">{t.filters}</span><select value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">{t.stages[0]}</option><option value="discovery">{t.stages[1]}</option><option value="validation">{t.stages[2]}</option><option value="mvp">{t.stages[3]}</option><option value="early_revenue">{t.stages[4]}</option><option value="growth">{t.stages[5]}</option></select></label>
          </section>
          {notice && <p className="opportunity-notice" role="status"><ShieldCheck size={17} />{notice}</p>}
          {error && <p className="workspace-error" role="alert">{error}</p>}
          {loading ? <div className="workspace-loading" role="status">{arabic ? "جارٍ تحميل الفرص…" : "Loading opportunities…"}</div> : visibleIdeas.length ? <div className="opportunity-list">{visibleIdeas.map((idea) => {
            const request = requests.find((item) => item.requester_id === userId && item.idea_id === idea.id);
            const own = idea.owner_id === userId;
            return <article className="opportunity-card" key={idea.id}>
              <div className="opportunity-card-main"><div className="opportunity-card-meta"><span>{stageLabel(idea.stage, arabic)}</span><span><MapPin size={13} />{idea.city || (arabic ? "عن بُعد" : "Remote")}</span><span>{new Date(idea.created_at).toLocaleDateString(arabic ? "ar" : "en", { day: "numeric", month: "short" })}</span></div><h2>{idea.title}</h2><p>{idea.summary}</p><div className="tag-row">{idea.skills_needed.map((skill) => <span className="tag" key={skill}>{skill}</span>)}{idea.industries.slice(0, 2).map((industry) => <span className="tag tag-muted" key={industry}>{industry}</span>)}</div><div className="opportunity-founder"><span className="dash-small-avatar">{idea.owner?.avatar_url ? <img src={idea.owner.avatar_url} alt="" /> : <UserRound size={17} />}</span><div><strong>{idea.owner?.full_name ?? (arabic ? "عضو كفو" : "Kufuo member")}</strong><span>{idea.owner?.headline ?? (arabic ? "مؤسس الفكرة" : "Idea founder")}</span></div></div></div>
              <aside><span className="opportunity-fit"><Target size={16} />{arabic ? "يبحث عن" : "Looking for"}</span><strong>{idea.skills_needed.slice(0, 2).join(" · ") || (arabic ? "شريك مكمل" : "A complementary cofounder")}</strong>{request ? <span className={`application-status status-${request.status}`}><FileText size={15} />{statusCopy(request, language)}</span> : own ? <a className="button button-small" href="/connections"><UsersRound size={16} />{t.manage}</a> : <button className="button button-small" type="button" onClick={() => { setSelectedIdea(idea); setError(""); }}><Send size={16} />{t.apply}</button>}<a className="founder-link" href={`/profile/${idea.owner_id}`}>{t.viewFounder}<ChevronRight className="directional-icon" size={15} /></a></aside>
            </article>;
          })}</div> : <div className="workspace-empty opportunity-empty"><span className="side-icon"><Sparkles size={21} /></span><h2>{t.emptyTitle}</h2><p>{t.emptyBody}</p><a className="button" href="/ideas/new"><Lightbulb size={17} />{t.create}</a></div>}
        </section>

        <aside className="dash-right opportunity-rail">
          <section className="dash-side-card activity-card"><div className="side-card-title"><span className="side-icon"><BriefcaseBusiness size={19} /></span><small>{t.activity}</small></div><dl><div><dt>{t.applications}</dt><dd>{myApplications}</dd></div><div><dt>{t.openIdeas}</dt><dd>{myOpenIdeas}</dd></div></dl><a className="button button-small" href="/ideas/new"><Lightbulb size={16} />{t.create}</a></section>
          <section className="dash-side-card profile-readiness"><div className="side-card-title"><span className="side-icon"><CircleUserRound size={19} /></span><small>{t.completeProfile}</small></div><strong>{progress}%</strong><div className="side-progress"><span style={{ width: `${progress}%` }} /></div><p>{t.profileHint}</p><a className="side-link" href="/account">{t.completeProfile}<ChevronRight className="directional-icon" size={15} /></a></section>
          <section className="dash-side-card privacy-note"><LockKeyhole size={19} /><p>{t.privacy}</p></section>
        </aside>
      </div>

      {selectedIdea && <div className="application-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIdea(null); }}><section className="application-dialog" role="dialog" aria-modal="true" aria-labelledby="application-title"><button className="icon-button" type="button" aria-label={t.cancel} onClick={() => setSelectedIdea(null)}><X size={19} /></button><span className="side-icon"><Send size={20} /></span><p className="kicker">{selectedIdea.title}</p><h2 id="application-title">{t.applicationTitle}</h2><p>{t.applicationBody}</p><textarea value={application} onChange={(event) => setApplication(event.target.value)} rows={6} maxLength={800} placeholder={t.messagePlaceholder} autoFocus /><small>{application.length}/800</small><div><button className="button button-secondary" type="button" onClick={() => setSelectedIdea(null)}>{t.cancel}</button><button className="button" type="button" disabled={submitting} onClick={sendApplication}><Send size={17} />{submitting ? (arabic ? "جارٍ الإرسال…" : "Sending…") : t.send}</button></div></section></div>}
    </main>
  );
}
