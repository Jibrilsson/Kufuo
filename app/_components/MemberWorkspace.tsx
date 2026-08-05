"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Filter,
  Languages,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";

type Mode = "discover" | "messages" | "connections" | "notifications" | "settings";
type Language = "en" | "ar";
type SettingsState = { matching: boolean; introductions: boolean; community: boolean; profileVisible: boolean; cityVisible: boolean };

const founders = [
  { id: 1, name: "Amir N.", role: { en: "Technical founder", ar: "مؤسس تقني" }, city: { en: "Riyadh", ar: "الرياض" }, fit: "92%", image: "/profile-amir.jpg", skills: ["TypeScript", "B2B SaaS", "Fintech"], body: { en: "Building practical software for Saudi SMEs and looking for a commercially strong partner.", ar: "يبني برمجيات عملية للمنشآت السعودية ويبحث عن شريك قوي تجاريًا." } },
  { id: 2, name: "Maha A.", role: { en: "Growth & partnerships", ar: "نمو وشراكات" }, city: { en: "Khobar", ar: "الخبر" }, fit: "88%", image: "/profile-maha.jpg", skills: ["Growth", "Partnerships", "Marketplaces"], body: { en: "Experienced in launching regional products and building their first commercial partnerships.", ar: "خبرة في إطلاق منتجات إقليمية وبناء شراكاتها التجارية الأولى." } },
  { id: 3, name: "Sara Alotaibi", role: { en: "Product lead", ar: "قائدة منتجات" }, city: { en: "Jeddah", ar: "جدة" }, fit: "84%", image: "/profile-sara.jpg", skills: ["Product", "Logistics", "Research"], body: { en: "Validating a simpler returns network for local commerce and seeking technical leadership.", ar: "تتحقق من شبكة أبسط لمرتجعات التجارة المحلية وتبحث عن قيادة تقنية." } },
] as const;

const nav = [
  ["Feed", "الخلاصة", "/dashboard", Compass],
  ["Discover", "استكشف", "/discover", Search],
  ["Messages", "الرسائل", "/messages", Mail],
  ["Connections", "العلاقات", "/connections", UsersRound],
  ["Notifications", "التنبيهات", "/notifications", Bell],
  ["Profile", "الملف الشخصي", "/account", CircleUserRound],
  ["Settings", "الإعدادات", "/settings", Settings],
] as const;

const pageCopy = {
  en: {
    discover: ["Discover", "Find people and ideas worth building with.", "Search by skills, sector, city, commitment, or startup stage."],
    messages: ["Messages", "Move promising connections forward.", "Keep founder conversations focused, respectful, and easy to revisit."],
    connections: ["Connections", "Your founder network, with context.", "Manage introductions, accepted connections, and people you want to follow up with."],
    notifications: ["Notifications", "Only the updates that help you move.", "Matches, introductions, messages, and community activity—without noisy vanity alerts."],
    settings: ["Settings", "Control your Kufuo experience.", "Manage matching preferences, privacy, notifications, language, and your connected account."],
    search: "Search Kufuo",
    signOut: "Sign out",
  },
  ar: {
    discover: ["استكشف", "اعثر على أشخاص وأفكار تستحق أن تبني معها.", "ابحث حسب المهارات أو القطاع أو المدينة أو الالتزام أو مرحلة المشروع."],
    messages: ["الرسائل", "حوّل العلاقات الواعدة إلى خطوات عملية.", "حافظ على محادثات المؤسسين مركزة ومحترمة وسهلة الرجوع."],
    connections: ["العلاقات", "شبكة مؤسسين بسياق واضح.", "أدر التعارفات والعلاقات المقبولة والأشخاص الذين تريد متابعتهم."],
    notifications: ["التنبيهات", "التحديثات التي تساعدك على التقدم فقط.", "توافقات وتعارفات ورسائل ونشاط مجتمعي دون تنبيهات سطحية مزعجة."],
    settings: ["الإعدادات", "تحكم في تجربتك على كفو.", "أدر تفضيلات المطابقة والخصوصية والتنبيهات واللغة والحساب المتصل."],
    search: "ابحث في كفو",
    signOut: "تسجيل الخروج",
  },
} as const;

function Brand() {
  return <a className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a>;
}

export function MemberWorkspace({ mode, user, signOutHref }: { mode: Mode; user: { displayName: string; email: string }; signOutHref: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [discoverType, setDiscoverType] = useState<"people" | "ideas">("people");
  const [activeConversation, setActiveConversation] = useState(0);
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [connectionTab, setConnectionTab] = useState<"accepted" | "pending">("accepted");
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [settingsState, setSettingsState] = useState({ matching: true, introductions: true, community: false, profileVisible: true, cityVisible: true });
  const arabic = language === "ar";
  const t = pageCopy[language];
  const [label, title, body] = t[mode];
  const firstName = user.displayName.includes("@") ? user.email.split("@")[0] : user.displayName.split(" ")[0];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  const filteredFounders = useMemo(() => founders.filter((founder) => `${founder.name} ${founder.role[language]} ${founder.city[language]} ${founder.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query, language]);

  function sendMessage() {
    const value = draft.trim();
    if (!value) return;
    setSentMessages([...sentMessages, value]);
    setDraft("");
  }

  return (
    <main className="workspace-app" dir={arabic ? "rtl" : "ltr"}>
      <header className="workspace-topbar">
        <Brand />
        <label className="dash-search"><Search size={17} /><span className="sr-only">{t.search}</span><input type="search" placeholder={t.search} /></label>
        <div><button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button><a className="dash-user-link" href="/account"><UserRound size={18} /><span>{firstName}</span></a></div>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-sidebar">
          <nav className="dash-nav" aria-label="Member navigation">{nav.map(([en, ar, href, Icon]) => <a className={href === `/${mode}` ? "is-active" : ""} href={href} key={href}><Icon size={18} /><span>{arabic ? ar : en}</span>{href === "/notifications" && !notificationsRead && <b>2</b>}</a>)}</nav>
          <div className="workspace-profile-note"><span className="dash-small-avatar"><UserRound size={18} /></span><div><strong>{user.displayName}</strong><span>{arabic ? "اكتمل ٦٠٪ من الملف" : "Profile 60% complete"}</span></div></div>
          <a className="dash-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a>
        </aside>

        <section className="workspace-main">
          <header className="workspace-heading"><p className="kicker">{label}</p><h1>{title}</h1><p>{body}</p></header>
          {mode === "discover" && <Discover language={language} query={query} setQuery={setQuery} type={discoverType} setType={setDiscoverType} founders={filteredFounders} saved={saved} setSaved={setSaved} />}
          {mode === "messages" && <Messages language={language} active={activeConversation} setActive={setActiveConversation} draft={draft} setDraft={setDraft} sent={sentMessages} send={sendMessage} />}
          {mode === "connections" && <Connections language={language} tab={connectionTab} setTab={setConnectionTab} />}
          {mode === "notifications" && <Notifications language={language} read={notificationsRead} setRead={setNotificationsRead} />}
          {mode === "settings" && <SettingsView language={language} state={settingsState} setState={setSettingsState} user={user} signOutHref={signOutHref} />}
        </section>
      </div>
    </main>
  );
}

function Discover({ language, query, setQuery, type, setType, founders: results, saved, setSaved }: { language: Language; query: string; setQuery: (v: string) => void; type: "people" | "ideas"; setType: (v: "people" | "ideas") => void; founders: Array<(typeof founders)[number]>; saved: number[]; setSaved: (v: number[]) => void }) {
  const ar = language === "ar";
  return <div className="discover-view"><div className="workspace-toolbar"><div className="segmented"><button className={type === "people" ? "is-active" : ""} onClick={() => setType("people")} type="button"><UsersRound size={17} />{ar ? "مؤسسون" : "Founders"}</button><button className={type === "ideas" ? "is-active" : ""} onClick={() => setType("ideas")} type="button"><Lightbulb size={17} />{ar ? "أفكار" : "Ideas"}</button></div><button className="button button-secondary button-small" type="button"><Filter size={16} />{ar ? "تصفية" : "Filters"}</button></div><label className="workspace-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "ابحث بالمهارة أو المدينة أو القطاع" : "Search by skill, city, or sector"} /></label>{type === "people" ? <div className="discover-grid">{results.map((founder) => <article className="discover-card" key={founder.id}><div className="discover-card-top"><img src={founder.image} alt="" /><span className="status"><Sparkles size={14} />{founder.fit} {ar ? "توافق" : "fit"}</span></div><h2>{founder.name}</h2><p className="discover-role">{founder.role[language]} · {founder.city[language]}</p><p>{founder.body[language]}</p><div className="tag-row">{founder.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div><footer><a className="button button-small" href="/profile">{ar ? "عرض الملف" : "View profile"}<ChevronRight size={16} /></a><button className={`icon-button ${saved.includes(founder.id) ? "is-saved" : ""}`} type="button" aria-label="Save" onClick={() => setSaved(saved.includes(founder.id) ? saved.filter((id) => id !== founder.id) : [...saved, founder.id])}><Bookmark size={18} fill={saved.includes(founder.id) ? "currentColor" : "none"} /></button></footer></article>)}</div> : <div className="idea-list"><article><span className="side-icon inverse"><BriefcaseBusiness size={20} /></span><div><small>{ar ? "مرحلة التحقق · الرياض" : "Validation · Riyadh"}</small><h2>{ar ? "ذكاء المخزون للمنشآت السعودية" : "Inventory intelligence for Saudi SMEs"}</h2><p>{ar ? "فريق تجاري يبحث عن شريك تقني لبناء نموذج أولي ثنائي اللغة." : "A commercial founding team seeking a technical partner for a bilingual MVP."}</p></div><a className="button button-small" href="/profile">{ar ? "استكشف" : "Explore"}<ChevronRight size={16} /></a></article><article><span className="side-icon"><Lightbulb size={20} /></span><div><small>{ar ? "اكتشاف المشكلة · جدة" : "Problem discovery · Jeddah"}</small><h2>{ar ? "مرتجعات أبسط للتجارة المحلية" : "Simpler returns for local commerce"}</h2><p>{ar ? "فكرة يتم اختبارها مع متاجر محلية وتبحث عن خبرة تشغيلية وتقنية." : "An idea being tested with local stores, seeking operational and technical depth."}</p></div><a className="button button-small button-secondary" href="/profile">{ar ? "استكشف" : "Explore"}<ChevronRight size={16} /></a></article></div>}</div>;
}

function Messages({ language, active, setActive, draft, setDraft, sent, send }: { language: Language; active: number; setActive: (v: number) => void; draft: string; setDraft: (v: string) => void; sent: string[]; send: () => void }) {
  const ar = language === "ar"; const conversations = [{ name: "Amir N.", image: "/profile-amir.jpg", preview: ar ? "دعنا نحدد تجربة العمل…" : "Let’s define the trial sprint…" }, { name: "Maha A.", image: "/profile-maha.jpg", preview: ar ? "أرسلت لك تفاصيل الفعالية" : "I sent the event details" }, { name: "Sara Alotaibi", image: "/profile-sara.jpg", preview: ar ? "الفكرة ما زالت في مرحلة…" : "The idea is still at the…" }];
  return <div className="messages-shell"><aside className="conversation-list"><label><Search size={17} /><input placeholder={ar ? "ابحث في الرسائل" : "Search messages"} /></label>{conversations.map((item, index) => <button className={active === index ? "is-active" : ""} type="button" onClick={() => setActive(index)} key={item.name}><img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.preview}</small></span>{index === 0 && <b />}</button>)}</aside><section className="conversation"><header><img src={conversations[active].image} alt="" /><div><strong>{conversations[active].name}</strong><span>{ar ? "متصل عبر تعارف متبادل" : "Connected through a mutual introduction"}</span></div><a className="button button-small button-secondary" href="/profile">{ar ? "الملف" : "Profile"}</a></header><div className="message-thread"><div className="message-date">{ar ? "اليوم" : "Today"}</div><p className="message-bubble received">{ar ? "شكرًا لقبول التعارف. أعتقد أن خبراتنا متكاملة." : "Thanks for accepting the introduction. I think our experience is complementary."}</p><p className="message-bubble sent">{ar ? "أتفق. لنبدأ بمكالمة قصيرة ثم نحدد تجربة عمل صغيرة." : "Agreed. Let’s start with a short call, then define one small trial sprint."}</p>{sent.map((message, index) => <p className="message-bubble sent" key={`${message}-${index}`}>{message}</p>)}</div><div className="message-compose"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={ar ? "اكتب رسالة…" : "Write a message…"} rows={2} /><button className="button" type="button" onClick={send} aria-label={ar ? "إرسال" : "Send"}><Send size={18} /></button></div></section></div>;
}

function Connections({ language, tab, setTab }: { language: Language; tab: "accepted" | "pending"; setTab: (v: "accepted" | "pending") => void }) {
  const ar = language === "ar"; const data = tab === "accepted" ? founders.slice(0, 2) : founders.slice(2);
  return <div><div className="workspace-toolbar"><div className="segmented"><button className={tab === "accepted" ? "is-active" : ""} type="button" onClick={() => setTab("accepted")}><UserCheck size={17} />{ar ? "العلاقات" : "Connected"}</button><button className={tab === "pending" ? "is-active" : ""} type="button" onClick={() => setTab("pending")}><Clock3 size={17} />{ar ? "قيد الانتظار" : "Pending"}</button></div></div><div className="connection-list">{data.map((person) => <article key={person.id}><img src={person.image} alt="" /><div><h2>{person.name}</h2><p>{person.role[language]} · {person.city[language]}</p><span>{tab === "accepted" ? (ar ? "تم التعارف بنجاح" : "Introduction accepted") : (ar ? "بانتظار الرد" : "Waiting for response")}</span></div><div><a className="button button-small" href="/messages"><MessageCircle size={16} />{ar ? "رسالة" : "Message"}</a><button className="icon-button" type="button" aria-label="Remove"><X size={17} /></button></div></article>)}</div></div>;
}

function Notifications({ language, read, setRead }: { language: Language; read: boolean; setRead: (v: boolean) => void }) {
  const ar = language === "ar"; const items = [{ icon: Sparkles, title: ar ? "لديك توافق جديد بنسبة ٩٢٪" : "You have a new 92% founder match", body: ar ? "أمير مؤسس تقني في الرياض ومتوافق مع تفضيلاتك." : "Amir is a technical founder in Riyadh aligned with your preferences.", time: ar ? "قبل ١٨ دقيقة" : "18 min ago", href: "/profile" }, { icon: UserRoundPlus, title: ar ? "قبلت مها طلب التعارف" : "Maha accepted your introduction", body: ar ? "يمكنكما الآن بدء محادثة خاصة." : "You can now start a private conversation.", time: ar ? "قبل ساعتين" : "2 hrs ago", href: "/messages" }, { icon: Lightbulb, title: ar ? "فكرة جديدة في الخدمات اللوجستية" : "New idea in logistics", body: ar ? "فرصة في جدة تناسب اهتماماتك وخبرتك." : "A Jeddah opportunity matches your interests and experience.", time: ar ? "أمس" : "Yesterday", href: "/discover" }];
  return <div className="notifications-view"><div className="workspace-toolbar"><span>{read ? (ar ? "لا توجد تنبيهات غير مقروءة" : "No unread notifications") : (ar ? "تنبيهان جديدان" : "2 new notifications")}</span><button className="button button-small button-secondary" type="button" onClick={() => setRead(true)}><Check size={16} />{ar ? "تحديد الكل كمقروء" : "Mark all read"}</button></div><div className="notification-list">{items.map((item, index) => { const Icon = item.icon; return <a className={!read && index < 2 ? "is-unread" : ""} href={item.href} key={item.title}><span className="side-icon"><Icon size={20} /></span><div><h2>{item.title}</h2><p>{item.body}</p><small>{item.time}</small></div><ChevronRight size={18} /></a>; })}</div></div>;
}

function SettingsView({ language, state, setState, user, signOutHref }: { language: Language; state: SettingsState; setState: (v: SettingsState) => void; user: { displayName: string; email: string }; signOutHref: string }) {
  const ar = language === "ar"; const rows = [{ key: "matching", icon: Sparkles, title: ar ? "تنبيهات التوافق" : "Match recommendations", body: ar ? "أرسل لي التوافقات الجديدة ذات الجودة العالية." : "Notify me about strong new matches." }, { key: "introductions", icon: UserRoundPlus, title: ar ? "طلبات التعارف" : "Introduction updates", body: ar ? "أرسل لي تحديثات القبول والرفض." : "Notify me when introduction requests change." }, { key: "community", icon: Bell, title: ar ? "ملخص المجتمع" : "Community digest", body: ar ? "ملخص أسبوعي للفعاليات والنقاشات." : "A weekly summary of events and discussions." }, { key: "profileVisible", icon: CircleUserRound, title: ar ? "ظهور الملف للأعضاء" : "Member profile visibility", body: ar ? "اسمح للأعضاء الموثقين باكتشاف ملفك." : "Let verified members discover your profile." }, { key: "cityVisible", icon: MapPin, title: ar ? "إظهار المدينة" : "Show my city", body: ar ? "اعرض مدينتك دون مشاركة موقع دقيق." : "Display your city without sharing a precise location." }];
  return <div className="settings-layout"><section className="settings-panel"><div className="settings-section-title"><SlidersHorizontal size={20} /><div><h2>{ar ? "التفضيلات والخصوصية" : "Preferences & privacy"}</h2><p>{ar ? "يمكنك تغيير هذه الإعدادات في أي وقت." : "You can change these settings at any time."}</p></div></div>{rows.map((row) => { const Icon = row.icon; return <div className="settings-row" key={row.key}><span className="side-icon"><Icon size={19} /></span><div><strong>{row.title}</strong><p>{row.body}</p></div><button className={`switch ${state[row.key] ? "is-on" : ""}`} type="button" role="switch" aria-checked={state[row.key]} onClick={() => setState({ ...state, [row.key]: !state[row.key] })}><span /></button></div>; })}</section><aside className="settings-account"><div className="member-side-heading"><LockKeyhole size={20} /><span>{ar ? "الحساب المتصل" : "Connected account"}</span></div><div className="settings-user"><span className="dash-small-avatar"><UserRound size={20} /></span><div><strong>{user.displayName}</strong><span>{user.email}</span></div></div><p><ShieldCheck size={16} />{ar ? "جلسة كفو آمنة وموثقة" : "Secure, verified Kufuo session"}</p><a className="button button-secondary" href={signOutHref}><LogOut size={17} />{ar ? "تسجيل الخروج" : "Sign out"}</a></aside></div>;
}
