"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Languages,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Save,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";

type Language = "en" | "ar";

const copy = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    signOut: "Sign out",
    kicker: "Your founder profile",
    role: "Product builder & aspiring founder",
    location: "Riyadh, Saudi Arabia",
    availability: "10–15 hrs/week",
    language: "Arabic & English",
    verified: "Identity verified by Kufuo",
    intro: "I turn promising problems into clear product experiments. I’m looking to meet a technical cofounder who values customer evidence, direct communication, and building for the Saudi market.",
    edit: "Edit profile",
    cancel: "Cancel",
    save: "Save changes",
    saved: "Profile updated for this session",
    about: "About",
    aboutBody: "I have experience shaping digital products, validating early ideas, and translating complex workflows into clear experiences. I’m especially interested in practical B2B products with Saudi-first insight and regional potential.",
    skills: "Skills",
    skillsList: ["Product strategy", "UX research", "Validation", "Business modeling", "Arabic localization", "Go-to-market"],
    interests: "Sectors of interest",
    interestsList: ["B2B SaaS", "Fintech", "Logistics", "SME tools"],
    preferences: "Founder preferences",
    preferenceRows: [
      ["Looking for", "Technical cofounder / CTO"],
      ["Preferred stage", "Problem validation to MVP"],
      ["Commitment", "Part-time, then full-time after validation"],
      ["Working style", "Direct, documented, customer-led"],
      ["Decision style", "Evidence first, then move quickly"],
      ["Equity approach", "Meaningful ownership after trial sprint"],
    ],
    experience: "Experience",
    experienceRows: [
      ["Product & UX", "Shaped bilingual products and service experiences for regional users."],
      ["Early validation", "Turned assumptions into interviews, prototypes, and measurable learning."],
      ["Commercial thinking", "Connected customer needs to practical business and launch models."],
    ],
    strength: "Profile strength",
    strengthBody: "Complete your founder preferences and experience to unlock higher-confidence matches.",
    complete: "3 of 5 sections complete",
    account: "Connected account",
    email: "Email",
    authentication: "Authentication",
    authValue: "Secure Kufuo member session",
    privacy: "Privacy",
    privacyValue: "Contact details remain private",
    secure: "Your login is protected and your contact details remain private.",
    preview: "Preview public profile",
    fields: { role: "Professional headline", location: "Location", availability: "Availability", intro: "Short introduction", about: "About you" },
  },
  ar: {
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    kicker: "ملف المؤسس",
    role: "باني منتجات ومؤسس طموح",
    location: "الرياض، المملكة العربية السعودية",
    availability: "١٠–١٥ ساعة أسبوعيًا",
    language: "العربية والإنجليزية",
    verified: "الهوية موثقة عبر كفو",
    intro: "أحوّل المشكلات الواعدة إلى تجارب منتج واضحة. أبحث عن شريك مؤسس تقني يقدّر أدلة العملاء والتواصل المباشر والبناء للسوق السعودي.",
    edit: "تعديل الملف",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    saved: "تم تحديث الملف لهذه الجلسة",
    about: "نبذة",
    aboutBody: "لدي خبرة في تشكيل المنتجات الرقمية والتحقق من الأفكار المبكرة وتحويل العمليات المعقدة إلى تجارب واضحة. أهتم خصوصًا بمنتجات الأعمال العملية المبنية بفهم سعودي ولها فرصة إقليمية.",
    skills: "المهارات",
    skillsList: ["استراتيجية المنتج", "أبحاث المستخدم", "التحقق", "نماذج الأعمال", "التعريب", "دخول السوق"],
    interests: "القطاعات المهتم بها",
    interestsList: ["برمجيات الأعمال", "التقنية المالية", "الخدمات اللوجستية", "أدوات المنشآت"],
    preferences: "تفضيلات الشريك المؤسس",
    preferenceRows: [
      ["أبحث عن", "شريك مؤسس تقني / مدير تقني"],
      ["المرحلة المفضلة", "التحقق من المشكلة حتى النموذج الأولي"],
      ["الالتزام", "جزئي ثم تفرغ بعد التحقق"],
      ["أسلوب العمل", "مباشر وموثق ويقوده العميل"],
      ["أسلوب القرار", "الدليل أولًا ثم التحرك بسرعة"],
      ["نهج الحصص", "ملكية مؤثرة بعد تجربة عمل"],
    ],
    experience: "الخبرة",
    experienceRows: [
      ["المنتج والتجربة", "تشكيل منتجات ثنائية اللغة وتجارب خدمات لمستخدمين في المنطقة."],
      ["التحقق المبكر", "تحويل الافتراضات إلى مقابلات ونماذج أولية وتعلم قابل للقياس."],
      ["التفكير التجاري", "ربط احتياجات العملاء بنماذج عمل وإطلاق عملية."],
    ],
    strength: "قوة الملف",
    strengthBody: "أكمل تفضيلات المؤسس وخبراتك للحصول على توافقات أكثر دقة.",
    complete: "اكتملت ٣ أقسام من ٥",
    account: "الحساب المتصل",
    email: "البريد الإلكتروني",
    authentication: "المصادقة",
    authValue: "جلسة عضو آمنة في كفو",
    privacy: "الخصوصية",
    privacyValue: "تبقى بيانات التواصل خاصة",
    secure: "تسجيل دخولك محمي وتبقى بيانات تواصلك خاصة.",
    preview: "معاينة الملف العام",
    fields: { role: "العنوان المهني", location: "الموقع", availability: "التفرغ", intro: "مقدمة قصيرة", about: "نبذة عنك" },
  },
} as const;

export function AccountView({ user, signOutHref }: { user: { displayName: string; email: string }; signOutHref: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [editing, setEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const arabic = language === "ar";
  const t = copy[language];
  const [details, setDetails] = useState({ role: copy.en.role, location: copy.en.location, availability: copy.en.availability, intro: copy.en.intro, about: copy.en.aboutBody });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  function switchLanguage() {
    const nextLanguage: Language = arabic ? "en" : "ar";
    const next = copy[nextLanguage];
    setLanguage(nextLanguage);
    setDetails({ role: next.role, location: next.location, availability: next.availability, intro: next.intro, about: next.aboutBody });
    setEditing(false);
  }

  function cancelEdit() {
    setDetails({ role: t.role, location: t.location, availability: t.availability, intro: t.intro, about: t.aboutBody });
    setEditing(false);
  }

  function saveProfile() {
    setEditing(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  }

  return (
    <main className="member-profile-page" dir={arabic ? "rtl" : "ltr"}>
      <header className="member-topbar">
        <a className="brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a>
        <nav><a href="/dashboard"><Compass size={17} />{t.dashboard}</a><a className="is-active" href="/account"><CircleUserRound size={17} />{t.profile}</a></nav>
        <div><button className="language-button" type="button" onClick={switchLanguage}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button><a className="account-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a></div>
      </header>

      <section className="member-hero section-frame">
        <div className="member-avatar"><UserRound size={54} /></div>
        <div className="member-identity"><p className="kicker">{t.kicker}</p><span className="account-verified"><ShieldCheck size={16} />{t.verified}</span><h1>{user.displayName}</h1>{editing ? <input aria-label={t.fields.role} value={details.role} onChange={(event) => setDetails({ ...details, role: event.target.value })} /> : <h2>{details.role}</h2>}<div className="member-meta"><span><MapPin size={16} />{details.location}</span><span><Clock3 size={16} />{details.availability}</span><span><Languages size={16} />{t.language}</span></div>{editing ? <textarea aria-label={t.fields.intro} value={details.intro} onChange={(event) => setDetails({ ...details, intro: event.target.value })} rows={4} /> : <p className="member-intro">{details.intro}</p>}<div className="member-actions">{editing ? <><button className="button" type="button" onClick={saveProfile}><Save size={17} />{t.save}</button><button className="button button-secondary" type="button" onClick={cancelEdit}>{t.cancel}</button></> : <button className="button" type="button" onClick={() => setEditing(true)}><Pencil size={17} />{t.edit}</button>}<a className="button button-secondary" href="/profile">{t.preview}<ChevronRight size={17} /></a></div>{savedNotice && <p className="member-save-notice" role="status"><Check size={16} />{t.saved}</p>}</div>
      </section>

      <div className="member-content section-frame">
        <div className="member-main">
          <section className="member-section"><div className="member-section-title"><span className="side-icon"><UserRound size={20} /></span><h2>{t.about}</h2></div>{editing ? <textarea aria-label={t.fields.about} value={details.about} onChange={(event) => setDetails({ ...details, about: event.target.value })} rows={6} /> : <p>{details.about}</p>}</section>
          <section className="member-two-column"><article><div className="member-section-title"><span className="side-icon"><Target size={20} /></span><h2>{t.skills}</h2></div><div className="member-tag-list">{t.skillsList.map((item) => <span key={item}>{item}</span>)}</div></article><article><div className="member-section-title"><span className="side-icon"><Lightbulb size={20} /></span><h2>{t.interests}</h2></div><div className="member-tag-list">{t.interestsList.map((item) => <span key={item}>{item}</span>)}</div></article></section>
          <section className="member-section"><div className="member-section-title"><span className="side-icon inverse"><BriefcaseBusiness size={20} /></span><h2>{t.preferences}</h2></div><dl className="member-preferences">{t.preferenceRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
          <section className="member-section"><div className="member-section-title"><span className="side-icon"><Compass size={20} /></span><h2>{t.experience}</h2></div><div className="member-experience">{t.experienceRows.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
        </div>

        <aside className="member-sidebar">
          <section className="member-side-card"><div className="member-side-heading"><Target size={21} /><span>{t.strength}</span></div><strong>60%</strong><div className="member-progress"><span /></div><p>{t.strengthBody}</p><small>{t.complete}</small><button className="button button-small" type="button" onClick={() => setEditing(true)}>{t.edit}<Pencil size={15} /></button></section>
          <section className="member-side-card"><div className="member-side-heading"><LockKeyhole size={21} /><span>{t.account}</span></div><dl><div><dt><Mail size={16} />{t.email}</dt><dd>{user.email}</dd></div><div><dt><ShieldCheck size={16} />{t.authentication}</dt><dd>{t.authValue}</dd></div><div><dt><LockKeyhole size={16} />{t.privacy}</dt><dd>{t.privacyValue}</dd></div></dl><p className="member-secure-note">{t.secure}</p></section>
        </aside>
      </div>
    </main>
  );
}
