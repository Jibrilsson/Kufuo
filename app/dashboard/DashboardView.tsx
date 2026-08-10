"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Compass,
  Heart,
  Languages,
  Lightbulb,
  LogOut,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { loadFeed, publishPost, togglePostReaction, toggleSavedPost } from "../lib/kufuo/client";
import type { CommunityPost, FounderProfile, Language } from "../lib/kufuo/types";

const copy = {
  en: {
    search: "Search founders, ideas, or sectors",
    nav: ["Feed", "Discover", "Messages", "Connections", "Notifications", "Profile", "Settings"],
    greeting: "Welcome back",
    intro: "Follow new ideas, open opportunities, and useful updates from the founder community.",
    tabs: ["For you", "Opportunities", "Ideas", "Community"],
    prompt: "Share an update, ask for help, or describe who you need…",
    publish: "Post to the community",
    emptyPost: "Write something useful before posting.",
    posted: "Your update is live in the community.",
    like: "Useful",
    comment: "Comment",
    save: "Save",
    completeProfile: "Complete your profile",
    passport: "Founder profile",
    passportBody: "Complete your profile to become discoverable and improve recommendations.",
    continue: "Continue profile",
    signOut: "Sign out",
  },
  ar: {
    search: "ابحث عن مؤسسين أو أفكار أو قطاعات",
    nav: ["الخلاصة", "استكشف", "الرسائل", "العلاقات", "التنبيهات", "الملف الشخصي", "الإعدادات"],
    greeting: "حيّاك من جديد",
    intro: "تابع الأفكار الجديدة والفرص المفتوحة والتحديثات المفيدة من مجتمع المؤسسين.",
    tabs: ["لك", "الفرص", "الأفكار", "المجتمع"],
    prompt: "شارك تحديثًا أو اطلب مساعدة أو صف الشخص الذي تحتاجه…",
    publish: "انشر للمجتمع",
    emptyPost: "اكتب شيئًا مفيدًا قبل النشر.",
    posted: "تم نشر تحديثك في المجتمع.",
    like: "مفيد",
    comment: "تعليق",
    save: "حفظ",
    completeProfile: "أكمل ملفك",
    passport: "ملف المؤسس",
    passportBody: "أكمل ملفك لتظهر في البحث وتحصل على توصيات أفضل.",
    continue: "تابع الملف",
    signOut: "تسجيل الخروج",
  },
} as const;

const navIcons = [Compass, Search, Mail, UsersRound, Bell, CircleUserRound, Settings] as const;

export function DashboardView({ userId, user, profile, signOutHref }: { userId: string; user: { displayName: string; email: string }; profile: FounderProfile | null; signOutHref: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState(0);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const arabic = language === "ar";
  const t = copy[language];
  const firstName = user.displayName.includes("@") ? user.email.split("@")[0] : user.displayName.split(" ")[0];
  const role = profile?.headline ?? (arabic ? "عضو كفو" : "Kufuo member");
  const progress = profile?.profile_strength ?? 20;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  useEffect(() => {
    let alive = true;
    loadFeed(userId).then((data) => { if (alive) setPosts(data); }).catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : "Could not load the community feed."); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId]);

  const visiblePosts = useMemo(() => posts.filter((post) => activeTab === 0 || (activeTab === 1 && post.kind === "opportunity") || (activeTab === 2 && post.kind === "idea") || (activeTab === 3 && ["community", "help", "update"].includes(post.kind))), [posts, activeTab]);

  async function createPost(kind: CommunityPost["kind"] = "update") {
    const value = draft.trim();
    if (!value) { setNotice(t.emptyPost); return; }
    setError("");
    try {
      const post = await publishPost(userId, value, kind);
      setPosts((current) => [{ ...post, author: profile, reaction_count: 0, comment_count: 0, reacted: false, saved: false }, ...current]);
      setDraft("");
      setNotice(t.posted);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not publish your update."); }
  }

  async function react(post: CommunityPost) {
    const active = !post.reacted;
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, reacted: active, reaction_count: Math.max(0, (item.reaction_count ?? 0) + (active ? 1 : -1)) } : item));
    try { await togglePostReaction(userId, post.id, active); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update the reaction."); }
  }

  async function save(post: CommunityPost) {
    const active = !post.saved;
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, saved: active } : item));
    try { await toggleSavedPost(userId, post.id, active); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the post."); }
  }

  return (
    <main className="founder-app" dir={arabic ? "rtl" : "ltr"}>
      <header className="dash-topbar">
        <Link className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></Link>
        <label className="dash-search"><Search size={17} /><span className="sr-only">{t.search}</span><input type="search" placeholder={t.search} /></label>
        <div className="dash-top-actions"><button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button><a className="dash-icon-link" href="/notifications" aria-label={t.nav[4]}><Bell size={19} /></a><a className="dash-user-link" href="/account"><UserRound size={18} /><span>{firstName}</span></a></div>
      </header>
      <div className="dashboard-grid">
        <aside className="dash-left">
          <section className="dash-mini-profile"><div className="dash-profile-avatar"><UserRound size={30} /></div><h2>{profile?.full_name ?? user.displayName}</h2><p>{role}</p><span>{progress}% {arabic ? "مكتمل" : "complete"}</span><a href="/account">{t.completeProfile}<ChevronRight size={16} /></a></section>
          <nav className="dash-nav" aria-label="Dashboard">{t.nav.map((label, index) => { const Icon = navIcons[index]; const href = ["/dashboard", "/discover", "/messages", "/connections", "/notifications", "/account", "/settings"][index]; return <a className={index === 0 ? "is-active" : ""} href={href} key={label}><Icon size={18} /><span>{label}</span></a>; })}</nav>
          <a className="dash-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a>
        </aside>
        <section className="dash-feed" id="feed">
          <div className="dash-greeting"><div><p className="kicker">{t.greeting}, {firstName}</p><h1>{arabic ? "شوف وش يبني مجتمع المؤسسين." : "See what the founder community is building."}</h1><p>{t.intro}</p></div></div>
          <section className="dash-composer"><div className="dash-composer-row"><span className="dash-small-avatar"><UserRound size={19} /></span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t.prompt} rows={2} /></div><div className="dash-composer-actions"><div><a href="/ideas/new" aria-label="Publish an idea"><Lightbulb size={17} /></a><button type="button" aria-label="Post an opportunity" onClick={() => createPost("opportunity")}><BriefcaseBusiness size={17} /></button><button type="button" aria-label="Post to the community" onClick={() => createPost("community")}><CalendarDays size={17} /></button></div><button className="button button-small" type="button" onClick={() => createPost("update")}><Send size={16} />{t.publish}</button></div>{notice && <p className="dash-notice" role="status">{notice}</p>}{error && <p className="workspace-error" role="alert">{error}</p>}</section>
          <div className="dash-feed-tabs" role="tablist" aria-label="Feed filters">{t.tabs.map((tab, index) => <button className={activeTab === index ? "is-active" : ""} type="button" role="tab" aria-selected={activeTab === index} onClick={() => setActiveTab(index)} key={tab}>{tab}</button>)}</div>
          {loading ? <div className="workspace-loading" role="status">{arabic ? "جارٍ تحميل الخلاصة…" : "Loading the community feed…"}</div> : visiblePosts.length ? (
            <div className="feed-list">{visiblePosts.map((post) => (
              <article className="feed-card" key={post.id}>
                <header>{post.author?.avatar_url ? <img className="feed-avatar" src={post.author.avatar_url} alt="" /> : <span className="feed-avatar"><UserRound size={23} /></span>}<div><strong>{post.author?.full_name ?? (post.author_id === userId ? user.displayName : (arabic ? "عضو كفو" : "Kufuo member"))}</strong><span>{post.author?.headline ?? role} · {new Date(post.created_at).toLocaleDateString(arabic ? "ar" : "en")}</span></div><button className="icon-button" type="button" aria-label="More options"><MoreHorizontal size={19} /></button></header>
                <div className="feed-label-row"><span className="feed-label">{post.kind}</span></div>{post.title && <h2>{post.title}</h2>}<p className="feed-body">{post.body}</p>
                <footer><div className="feed-reactions"><button className={post.reacted ? "is-active" : ""} type="button" onClick={() => react(post)}><Heart size={17} fill={post.reacted ? "currentColor" : "none"} />{t.like} {post.reaction_count ? `(${post.reaction_count})` : ""}</button><button type="button"><MessageCircle size={17} />{t.comment} {post.comment_count ? `(${post.comment_count})` : ""}</button><button className={post.saved ? "is-active" : ""} type="button" onClick={() => save(post)}><Bookmark size={17} fill={post.saved ? "currentColor" : "none"} />{t.save}</button></div>{post.author_id !== userId && <a className="button button-small button-secondary" href={`/profile/${post.author_id}`}>{arabic ? "عرض المؤسس" : "View founder"}<ChevronRight size={16} /></a>}</footer>
              </article>
            ))}</div>
          ) : <div className="workspace-empty"><span className="side-icon"><Sparkles size={21} /></span><h2>{arabic ? "ابدأ المجتمع بأول تحديث" : "Start the community with the first update"}</h2><p>{arabic ? "شارك ما تعمل عليه أو اطلب مهارة تحتاجها." : "Share what you are building or ask for a skill you need."}</p></div>}
        </section>
        <aside className="dash-right"><section className="dash-side-card passport-card"><img className="passport-art" src="/kufuo-founder-collaboration.png" alt="" /><div className="side-card-title"><span className="side-icon"><Target size={20} /></span><small>{t.passport}</small></div><h2>{progress}%</h2><p>{t.passportBody}</p><div className="side-progress"><span style={{ width: `${progress}%` }} /></div><div className="side-progress-label"><span>{profile?.onboarding_complete ? (arabic ? "ملفك ظاهر" : "Profile discoverable") : (arabic ? "أكمل ملفك" : "Profile incomplete")}</span><ShieldCheck size={16} /></div><a className="button button-small" href="/account">{t.continue}<ChevronRight size={16} /></a></section><section className="dash-side-card"><div className="side-card-title"><span className="side-icon"><UsersRound size={20} /></span><small>{arabic ? "العلاقات" : "Connections"}</small></div><h3>{arabic ? "ابحث عن الشخص المكمل لك" : "Find the person who complements you"}</h3><p>{arabic ? "اكتشف أعضاء حقيقيين بعد اكتمال ملفاتهم." : "Discover real members once their founder profiles are complete."}</p><a className="side-link" href="/discover">{arabic ? "استكشف" : "Discover"}<ChevronRight size={16} /></a></section></aside>
      </div>
    </main>
  );
}
