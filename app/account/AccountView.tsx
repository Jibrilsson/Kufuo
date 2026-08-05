"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Languages,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

type Language = "en" | "ar";

const copy = {
  en: {
    back: "Back to home",
    signOut: "Sign out",
    label: "Your founder account",
    welcome: "Welcome,",
    intro: "Your ChatGPT account is connected. Complete your Founder Passport to unlock relevant people and opportunities.",
    verified: "Signed in with ChatGPT",
    progress: "Founder Passport progress",
    progressValue: "1 of 5 sections complete",
    continue: "Continue your profile",
    next: "Your next steps",
    nextBody: "Build enough context for useful matching. You control what becomes visible to other members.",
    steps: [
      ["Choose your path", "Tell us whether you have an idea, want to join one, or both."],
      ["Add founder preferences", "Share your commitment, working style, stage, and risk expectations."],
      ["Show your strengths", "Add skills, experience, sectors, and the role you want to own."],
      ["Review your profile", "Choose what is public, member-only, or private before publishing."],
    ],
    current: "Ready now",
    locked: "After the previous step",
    account: "Connected account",
    email: "Email",
    identity: "Authentication",
    identityValue: "ChatGPT verified session",
    privacy: "Privacy",
    privacyValue: "Contact details stay private",
    browse: "Explore sample matches",
    idea: "I have an idea",
    skill: "I want to join an idea",
    secure: "Authentication is handled securely by ChatGPT. Cofounders never receives your password.",
  },
  ar: {
    back: "العودة للرئيسية",
    signOut: "تسجيل الخروج",
    label: "حساب المؤسس",
    welcome: "مرحبًا،",
    intro: "تم ربط حساب ChatGPT. أكمل ملف المؤسس لفتح ترشيحات الأشخاص والفرص المناسبة.",
    verified: "تم الدخول عبر ChatGPT",
    progress: "تقدم ملف المؤسس",
    progressValue: "اكتمل قسم واحد من خمسة",
    continue: "تابع إنشاء ملفك",
    next: "خطواتك التالية",
    nextBody: "أضف ما يكفي لتصبح المطابقة مفيدة. أنت تتحكم فيما يظهر للأعضاء الآخرين.",
    steps: [
      ["اختر مسارك", "أخبرنا إن كانت لديك فكرة أو تريد الانضمام إلى فكرة أو كليهما."],
      ["أضف تفضيلاتك", "حدد التزامك وأسلوب عملك والمرحلة وتوقعات المخاطرة."],
      ["اعرض نقاط قوتك", "أضف مهاراتك وخبرتك والقطاعات والدور الذي تريد قيادته."],
      ["راجع ملفك", "حدد ما يظهر للجميع أو للأعضاء أو يبقى خاصًا قبل النشر."],
    ],
    current: "متاح الآن",
    locked: "بعد الخطوة السابقة",
    account: "الحساب المتصل",
    email: "البريد الإلكتروني",
    identity: "المصادقة",
    identityValue: "جلسة موثقة عبر ChatGPT",
    privacy: "الخصوصية",
    privacyValue: "تبقى بيانات التواصل خاصة",
    browse: "استكشف أمثلة المطابقة",
    idea: "لدي فكرة",
    skill: "أريد الانضمام إلى فكرة",
    secure: "تتم المصادقة بأمان عبر ChatGPT، ولا تستلم منصة Cofounders كلمة مرورك.",
  },
} as const;

const stepIcons = [Compass, ShieldCheck, BriefcaseBusiness, CheckCircle2] as const;

export function AccountView({ user, signOutHref }: { user: { displayName: string; email: string }; signOutHref: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const arabic = language === "ar";
  const t = copy[language];
  const Back = arabic ? ArrowRight : ArrowLeft;
  const Forward = arabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  return (
    <main className="account-page" dir={arabic ? "rtl" : "ltr"}>
      <header className="account-header section-frame">
        <a className="brand" href="/"><span className="brand-mark"><UsersRound size={20} /></span><span>Cofounders</span></a>
        <a className="account-back" href="/"><Back size={18} />{t.back}</a>
        <div className="account-header-actions">
          <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button>
          <a className="account-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a>
        </div>
      </header>

      <section className="account-hero section-frame">
        <div className="account-hero-copy">
          <p className="kicker">{t.label}</p>
          <span className="account-verified"><ShieldCheck size={17} />{t.verified}</span>
          <h1>{t.welcome}<br />{user.displayName}</h1>
          <p>{t.intro}</p>
        </div>
        <div className="account-progress-card">
          <div className="account-avatar"><UserRound size={40} /></div>
          <div><span>{t.progress}</span><strong>{t.progressValue}</strong></div>
          <div className="account-progress-track" aria-label={t.progressValue}><span /></div>
          <a className="button" href="#next-steps">{t.continue}<Forward size={18} /></a>
        </div>
      </section>

      <section className="account-content section-frame" id="next-steps">
        <div className="account-steps">
          <div className="account-section-heading"><h2>{t.next}</h2><p>{t.nextBody}</p></div>
          <div className="account-step-list">
            {t.steps.map((step, index) => { const Icon = stepIcons[index]; return (
              <article className={index === 0 ? "is-current" : ""} key={step[0]}>
                <span className="account-step-number">0{index + 1}</span>
                <span className="account-step-icon"><Icon size={22} /></span>
                <div><h3>{step[0]}</h3><p>{step[1]}</p></div>
                <small>{index === 0 ? t.current : t.locked}</small>
              </article>
            ); })}
          </div>
        </div>

        <aside className="account-sidebar">
          <div className="account-sidebar-head"><span className="account-step-icon inverse"><LockKeyhole size={22} /></span><h2>{t.account}</h2></div>
          <dl>
            <div><dt><Mail size={17} />{t.email}</dt><dd>{user.email}</dd></div>
            <div><dt><ShieldCheck size={17} />{t.identity}</dt><dd>{t.identityValue}</dd></div>
            <div><dt><LockKeyhole size={17} />{t.privacy}</dt><dd>{t.privacyValue}</dd></div>
          </dl>
          <p className="account-secure-note">{t.secure}</p>
          <a className="button button-secondary" href={signOutHref}><LogOut size={18} />{t.signOut}</a>
        </aside>
      </section>

      <section className="account-paths section-frame">
        <a href="/#join"><Lightbulb size={23} /><span>{t.idea}</span><Forward size={19} /></a>
        <a href="/#discover"><BriefcaseBusiness size={23} /><span>{t.skill}</span><Forward size={19} /></a>
        <a href="/profile"><UsersRound size={23} /><span>{t.browse}</span><Forward size={19} /></a>
      </section>
    </main>
  );
}
