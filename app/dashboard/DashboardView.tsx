"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Compass,
  Heart,
  Languages,
  Lightbulb,
  LogOut,
  Mail,
  MapPin,
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

type Language = "en" | "ar";
type FeedType = "match" | "idea" | "community";

const feed = [
  {
    id: 1,
    type: "match" as FeedType,
    avatar: "/profile-amir.jpg",
    author: { en: "Amir N.", ar: "أمير ن." },
    role: { en: "Technical founder · Riyadh", ar: "مؤسس تقني · الرياض" },
    time: { en: "18 min ago", ar: "قبل ١٨ دقيقة" },
    label: { en: "92% fit", ar: "توافق ٩٢٪" },
    title: { en: "Looking for a commercial cofounder for Saudi SME software", ar: "أبحث عن شريك تجاري لمنتج يخدم المنشآت السعودية" },
    body: { en: "I have validated the workflow with nine operations teams and built an early bilingual prototype. I’m looking for someone who can lead customer discovery, partnerships, and early sales.", ar: "تحققت من سير العمل مع تسعة فرق تشغيل وبنيت نموذجًا أوليًا ثنائي اللغة. أبحث عن شريك يقود اكتشاف العملاء والشراكات والمبيعات المبكرة." },
    tags: { en: ["B2B SaaS", "Validation", "15 hrs/week"], ar: ["برمجيات أعمال", "مرحلة التحقق", "١٥ ساعة أسبوعيًا"] },
  },
  {
    id: 2,
    type: "idea" as FeedType,
    avatar: "/profile-sara.jpg",
    author: { en: "Sara Alotaibi", ar: "سارة العتيبي" },
    role: { en: "Product lead · Jeddah", ar: "قائدة منتجات · جدة" },
    time: { en: "1 hr ago", ar: "قبل ساعة" },
    label: { en: "Idea seeking talent", ar: "فكرة تبحث عن مهارات" },
    title: { en: "A simpler returns network for local commerce", ar: "شبكة أبسط لمرتجعات التجارة المحلية" },
    body: { en: "Saudi online stores still handle returns through fragmented calls and spreadsheets. I’m exploring a shared pickup layer and need a logistics-minded technical partner for a focused validation sprint.", ar: "ما زالت المتاجر السعودية تدير المرتجعات عبر مكالمات وجداول متفرقة. أستكشف طبقة استلام مشتركة وأحتاج شريكًا تقنيًا يفهم الخدمات اللوجستية لتجربة تحقق مركزة." },
    tags: { en: ["Logistics", "E-commerce", "Technical cofounder"], ar: ["الخدمات اللوجستية", "التجارة الإلكترونية", "شريك تقني"] },
  },
  {
    id: 3,
    type: "community" as FeedType,
    avatar: "/profile-maha.jpg",
    author: { en: "Maha Alharbi", ar: "مها الحربي" },
    role: { en: "Growth strategist · Khobar", ar: "استراتيجية نمو · الخبر" },
    time: { en: "Today", ar: "اليوم" },
    label: { en: "Community question", ar: "سؤال للمجتمع" },
    title: { en: "What did you test before agreeing on founder equity?", ar: "ما الذي اختبرتموه قبل الاتفاق على حصص المؤسسين؟" },
    body: { en: "I’m collecting practical exercises that reveal decision style, reliability, and conflict habits. What is one short project every potential founding team should complete together?", ar: "أجمع تمارين عملية تكشف أسلوب القرار والالتزام وطريقة التعامل مع الخلاف. ما المشروع القصير الذي يجب أن ينجزه كل فريق مؤسس محتمل معًا؟" },
    tags: { en: ["Founder fit", "Equity", "Trial sprint"], ar: ["توافق المؤسسين", "الحصص", "تجربة عمل"] },
  },
] as const;

const copy = {
  en: {
    search: "Search founders, ideas, or sectors",
    nav: ["Feed", "Discover", "Messages", "Connections", "Notifications", "Profile", "Settings"],
    role: "Product builder · Riyadh",
    profileProgress: "Profile 20% complete",
    completeProfile: "Complete your profile",
    greeting: "Good to see you",
    intro: "Find serious people, credible ideas, and useful conversations selected for your founder preferences.",
    tabs: ["For you", "Cofounders", "Ideas", "Community"],
    prompt: "Share an update, ask for help, or describe who you need…",
    publish: "Post to the community",
    emptyPost: "Write something useful before posting.",
    posted: "Your update is now at the top of your feed.",
    like: "Useful",
    comment: "Comment",
    save: "Save",
    connect: "View founder",
    viewIdea: "Explore idea",
    join: "Join conversation",
    passport: "Founder Passport",
    passportBody: "Complete your preferences to improve every recommendation.",
    sections: "1 of 5 sections",
    continue: "Continue profile",
    suggestion: "Suggested for you",
    suggestionRole: "Growth & partnerships · Riyadh",
    suggestionBody: "Strong match on stage, commitment, and working style.",
    viewMatch: "View match",
    challenge: "Weekly challenge",
    challengeTitle: "Make one useful introduction",
    challengeBody: "Connect two members whose skills clearly complement each other.",
    reward: "+40 community points",
    event: "Upcoming in Riyadh",
    eventTitle: "Founder Fit: Working Session",
    eventMeta: "Thursday · 7:30 PM · In person",
    eventAction: "View event",
    signOut: "Sign out",
  },
  ar: {
    search: "ابحث عن مؤسسين أو أفكار أو قطاعات",
    nav: ["الخلاصة", "استكشف", "الرسائل", "العلاقات", "التنبيهات", "الملف الشخصي", "الإعدادات"],
    role: "باني منتجات · الرياض",
    profileProgress: "اكتمل ٢٠٪ من الملف",
    completeProfile: "أكمل ملفك",
    greeting: "سعداء بعودتك",
    intro: "اكتشف أشخاصًا جادين وأفكارًا موثوقة ونقاشات مختارة حسب تفضيلاتك كمؤسس.",
    tabs: ["لك", "مؤسسون", "أفكار", "المجتمع"],
    prompt: "شارك تحديثًا أو اطلب مساعدة أو صف الشخص الذي تحتاجه…",
    publish: "انشر للمجتمع",
    emptyPost: "اكتب شيئًا مفيدًا قبل النشر.",
    posted: "تمت إضافة تحديثك إلى أعلى الخلاصة.",
    like: "مفيد",
    comment: "تعليق",
    save: "حفظ",
    connect: "عرض المؤسس",
    viewIdea: "استكشف الفكرة",
    join: "شارك في النقاش",
    passport: "ملف المؤسس",
    passportBody: "أكمل تفضيلاتك لتحسين كل ترشيح.",
    sections: "قسم واحد من خمسة",
    continue: "تابع الملف",
    suggestion: "مقترح لك",
    suggestionRole: "نمو وشراكات · الرياض",
    suggestionBody: "توافق قوي في المرحلة والالتزام وأسلوب العمل.",
    viewMatch: "عرض التوافق",
    challenge: "تحدي الأسبوع",
    challengeTitle: "اصنع تعارفًا مفيدًا",
    challengeBody: "اربط بين عضوين تكمل مهاراتهما بعضهما بوضوح.",
    reward: "+٤٠ نقطة مجتمع",
    event: "قريبًا في الرياض",
    eventTitle: "توافق المؤسسين: جلسة عمل",
    eventMeta: "الخميس · ٧:٣٠ مساءً · حضوري",
    eventAction: "عرض الفعالية",
    signOut: "تسجيل الخروج",
  },
} as const;

const navIcons = [Compass, Search, Mail, UsersRound, Bell, CircleUserRound, Settings] as const;

export function DashboardView({ user, signOutHref }: { user: { displayName: string; email: string }; signOutHref: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [userPost, setUserPost] = useState<string | null>(null);
  const arabic = language === "ar";
  const t = copy[language];
  const firstName = user.displayName.includes("@") ? user.email.split("@")[0] : user.displayName.split(" ")[0];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  const visibleFeed = useMemo(() => {
    if (activeTab === 0) return feed;
    const type: FeedType = activeTab === 1 ? "match" : activeTab === 2 ? "idea" : "community";
    return feed.filter((item) => item.type === type);
  }, [activeTab]);

  function publishPost() {
    const value = draft.trim();
    if (!value) { setNotice(t.emptyPost); return; }
    setUserPost(value);
    setDraft("");
    setNotice(t.posted);
  }

  function toggle(list: number[], setList: (value: number[]) => void, id: number) {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  return (
    <main className="founder-app" dir={arabic ? "rtl" : "ltr"}>
      <header className="dash-topbar">
        <a className="brand" href="/"><span className="brand-mark"><img src="/kufuo-mark-256.png" alt="" /></span><span dir="ltr">Kufuo <b lang="ar">| كفو</b></span></a>
        <label className="dash-search"><Search size={17} /><span className="sr-only">{t.search}</span><input type="search" placeholder={t.search} /></label>
        <div className="dash-top-actions">
          <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button>
          <a className="dash-icon-link" href="#notifications" aria-label={t.nav[4]}><Bell size={19} /><span /></a>
          <a className="dash-user-link" href="/account"><UserRound size={18} /><span>{firstName}</span></a>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="dash-left">
          <section className="dash-mini-profile">
            <div className="dash-profile-avatar"><UserRound size={30} /></div>
            <h2>{user.displayName}</h2>
            <p>{t.role}</p>
            <span>{t.profileProgress}</span>
            <a href="/account">{t.completeProfile}<ChevronRight size={16} /></a>
          </section>
          <nav className="dash-nav" aria-label="Dashboard">
            {t.nav.map((label, index) => { const Icon = navIcons[index]; const href = ["/dashboard", "/discover", "/messages", "/connections", "/notifications", "/account", "/settings"][index]; return (
              <a className={index === 0 ? "is-active" : ""} href={href} key={label}><Icon size={18} /><span>{label}</span>{index === 4 && <b>2</b>}</a>
            ); })}
          </nav>
          <a className="dash-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a>
        </aside>

        <section className="dash-feed" id="feed">
          <div className="dash-greeting"><div><p className="kicker">{t.greeting}, {firstName}</p><h1>{arabic ? "ابدأ من حيث يتحرك مجتمع المؤسسين." : "Start where the founder community is moving."}</h1><p>{t.intro}</p></div></div>
          <section className="dash-composer">
            <div className="dash-composer-row"><span className="dash-small-avatar"><UserRound size={19} /></span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t.prompt} rows={2} /></div>
            <div className="dash-composer-actions"><div><button type="button" aria-label="Add idea"><Lightbulb size={17} /></button><button type="button" aria-label="Add opportunity"><BriefcaseBusiness size={17} /></button><button type="button" aria-label="Add event"><CalendarDays size={17} /></button></div><button className="button button-small" type="button" onClick={publishPost}><Send size={16} />{t.publish}</button></div>
            {notice && <p className="dash-notice" role="status">{notice}</p>}
          </section>
          <div className="dash-feed-tabs" role="tablist" aria-label="Feed filters">
            {t.tabs.map((tab, index) => <button className={activeTab === index ? "is-active" : ""} type="button" role="tab" aria-selected={activeTab === index} onClick={() => setActiveTab(index)} key={tab}>{tab}</button>)}
          </div>

          {userPost && <article className="feed-card is-new"><header><span className="feed-avatar"><UserRound size={23} /></span><div><strong>{user.displayName}</strong><span>{t.role} · {arabic ? "الآن" : "Now"}</span></div><span className="status"><Check size={14} />{arabic ? "منشور" : "Posted"}</span></header><p className="feed-body">{userPost}</p></article>}

          <div className="feed-list">
            {visibleFeed.map((item) => {
              const cta = item.type === "match" ? t.connect : item.type === "idea" ? t.viewIdea : t.join;
              return (
                <article className="feed-card" key={item.id}>
                  <header><img className="feed-avatar" src={item.avatar} alt="" /><div><strong>{item.author[language]}</strong><span>{item.role[language]} · {item.time[language]}</span></div><button className="icon-button" type="button" aria-label="More options"><MoreHorizontal size={19} /></button></header>
                  <div className="feed-label-row"><span className={item.type === "match" ? "status" : "feed-label"}>{item.label[language]}</span></div>
                  <h2>{item.title[language]}</h2>
                  <p className="feed-body">{item.body[language]}</p>
                  <div className="tag-row">{item.tags[language].map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  <footer><div className="feed-reactions"><button className={liked.includes(item.id) ? "is-active" : ""} type="button" onClick={() => toggle(liked, setLiked, item.id)}><Heart size={17} fill={liked.includes(item.id) ? "currentColor" : "none"} />{t.like}</button><button type="button"><MessageCircle size={17} />{t.comment}</button><button className={saved.includes(item.id) ? "is-active" : ""} type="button" onClick={() => toggle(saved, setSaved, item.id)}><Bookmark size={17} fill={saved.includes(item.id) ? "currentColor" : "none"} />{t.save}</button></div><a className="button button-small button-secondary" href={item.type === "match" ? "/profile" : "#feed"}>{cta}<ChevronRight size={16} /></a></footer>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="dash-right">
          <section className="dash-side-card passport-card"><img className="passport-art" src="/kufuo-founder-collaboration.png" alt="" /><div className="side-card-title"><span className="side-icon"><Target size={20} /></span><small>{t.passport}</small></div><h2>20%</h2><p>{t.passportBody}</p><div className="side-progress"><span /></div><div className="side-progress-label"><span>{t.sections}</span><ShieldCheck size={16} /></div><a className="button button-small" href="/account">{t.continue}<ChevronRight size={16} /></a></section>
          <section className="dash-side-card"><div className="side-card-title"><span className="side-icon"><Sparkles size={20} /></span><small>{t.suggestion}</small></div><div className="suggested-person"><img src="/profile-maha.jpg" alt="" /><div><strong>{arabic ? "مها أ." : "Maha A."}</strong><span>{t.suggestionRole}</span></div></div><p>{t.suggestionBody}</p><a className="side-link" href="/profile">{t.viewMatch}<ChevronRight size={16} /></a></section>
          <section className="dash-side-card challenge-card"><div className="side-card-title"><span className="side-icon"><UsersRound size={20} /></span><small>{t.challenge}</small></div><h3>{t.challengeTitle}</h3><p>{t.challengeBody}</p><span className="challenge-reward">{t.reward}</span></section>
          <section className="dash-side-card"><div className="side-card-title"><span className="side-icon"><MapPin size={20} /></span><small>{t.event}</small></div><h3>{t.eventTitle}</h3><p>{t.eventMeta}</p><a className="side-link" href="#feed">{t.eventAction}<ChevronRight size={16} /></a></section>
        </aside>
      </div>
    </main>
  );
}
