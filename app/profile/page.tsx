"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Compass,
  Globe2,
  Handshake,
  Languages,
  Lightbulb,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Target,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

type Language = "en" | "ar";

const profileCopy = {
  en: {
    back: "Back to discover",
    language: "العربية",
    preview: "Illustrative founder profile",
    available: "Open to the right opportunity",
    name: "Amir N.",
    role: "Full-stack engineer & technical founder",
    intro: "I turn validated problems into reliable products. Looking for a commercially strong cofounder who cares about practical software for Saudi businesses.",
    city: "Riyadh",
    time: "15–20 hrs/week",
    languages: "Arabic & English",
    verified: "Identity verified",
    connect: "Request an introduction",
    save: "Save profile",
    saved: "Profile saved",
    matchKicker: "Why you were matched",
    matchTitle: "Your founder preferences line up in the areas that matter.",
    reasons: [
      ["Complementary skills", "You bring product and growth; Amir brings technical delivery."],
      ["Commitment alignment", "Both of you can contribute at least 15 hours each week."],
      ["Stage alignment", "You both prefer to validate before committing full-time."],
      ["Risk alignment", "You share a measured approach to runway, equity, and early hiring."],
    ],
    passport: "Founder Passport",
    passportTitle: "The working preferences behind the profile.",
    about: "About",
    aboutText: "Over the last seven years, Amir has built fintech and B2B software across early product teams. He is strongest when the problem is clear, customer feedback is close, and the founding team can make decisions without unnecessary process.",
    details: [
      ["Preferred role", "CTO / Technical cofounder"],
      ["Startup stage", "Validation to early revenue"],
      ["Work style", "Focused, direct, documentation-first"],
      ["Decision style", "Data-informed, comfortable with uncertainty"],
      ["Full-time transition", "After validation or initial funding"],
      ["Partnership model", "Meaningful equity and shared ownership"],
    ],
    skills: "Skills & interests",
    skillsList: ["TypeScript", "Product engineering", "AI applications", "Fintech", "B2B SaaS", "Architecture", "Hiring technical teams"],
    experience: "Selected experience",
    experienceItems: [
      ["2023 — Now", "Engineering lead", "Built and scaled internal operations software for a regional fintech team."],
      ["2020 — 2023", "Senior product engineer", "Shipped bilingual B2B workflows used by growing businesses across the Gulf."],
      ["2018 — 2020", "Founding engineer", "Took an early marketplace product from prototype to its first paying customers."],
    ],
    looking: "What Amir is looking for",
    lookingText: "A cofounder who can lead customer discovery, commercial strategy, partnerships, and early sales—ideally within logistics, fintech, or software for SMEs.",
    values: ["Customer evidence before features", "Clear ownership and honest conflict", "Saudi-first with regional potential"],
    sprintKicker: "Before you commit",
    sprintTitle: "Try a three-day founder sprint together.",
    sprintBody: "Choose one small customer problem, divide responsibilities, and see how you communicate and make decisions before discussing a formal partnership.",
    sprintAction: "Propose a Trial Sprint",
    safety: "Your contact details stay private until both people accept the introduction.",
    panelTitle: "Request an introduction",
    panelBody: "Share why you think the match could work. Amir will see your Founder Passport with this note.",
    noteLabel: "Your introduction note",
    notePlaceholder: "I am working on… I think we could be a strong match because…",
    cancel: "Cancel",
    send: "Send request",
    sent: "Introduction request prepared for this preview.",
  },
  ar: {
    back: "العودة إلى الاستكشاف",
    language: "English",
    preview: "ملف مؤسس توضيحي",
    available: "متاح للفرصة المناسبة",
    name: "أمير ن.",
    role: "مهندس برمجيات وشريك مؤسس تقني",
    intro: "أحوّل المشكلات المتحقق منها إلى منتجات موثوقة. أبحث عن شريك قوي تجاريًا يهتم ببناء برامج عملية للمنشآت السعودية.",
    city: "الرياض",
    time: "١٥–٢٠ ساعة أسبوعيًا",
    languages: "العربية والإنجليزية",
    verified: "تم توثيق الهوية",
    connect: "اطلب تعارفًا",
    save: "احفظ الملف",
    saved: "تم حفظ الملف",
    matchKicker: "لماذا تم ترشيحكما",
    matchTitle: "تفضيلاتكما التأسيسية متوافقة في الأمور الأكثر أهمية.",
    reasons: [
      ["مهارات متكاملة", "أنت تقود المنتج والنمو، وأمير يقود التنفيذ التقني."],
      ["توافق الالتزام", "كلاكما يستطيع المساهمة بما لا يقل عن ١٥ ساعة أسبوعيًا."],
      ["توافق المرحلة", "تفضلان التحقق قبل الانتقال إلى التفرغ الكامل."],
      ["توافق المخاطرة", "لديكما نهج متوازن تجاه التمويل والملكية والتوظيف المبكر."],
    ],
    passport: "ملف المؤسس",
    passportTitle: "تفضيلات العمل خلف الملف.",
    about: "نبذة",
    aboutText: "خلال سبع سنوات، بنى أمير منتجات تقنية مالية وبرامج للأعمال ضمن فرق منتج مبكرة. يقدم أفضل ما لديه حين تكون المشكلة واضحة، وملاحظات العملاء قريبة، والفريق المؤسس قادرًا على اتخاذ القرار دون تعقيد.",
    details: [
      ["الدور المفضل", "مدير تقني / شريك مؤسس تقني"],
      ["مرحلة الشركة", "التحقق حتى الإيرادات المبكرة"],
      ["أسلوب العمل", "مركّز، مباشر، ويوثق القرارات"],
      ["أسلوب القرار", "يسترشد بالبيانات ويتعامل مع عدم اليقين"],
      ["الانتقال للتفرغ", "بعد التحقق أو التمويل الأولي"],
      ["نموذج الشراكة", "ملكية مؤثرة ومسؤولية مشتركة"],
    ],
    skills: "المهارات والاهتمامات",
    skillsList: ["تايب سكربت", "هندسة المنتجات", "تطبيقات الذكاء الاصطناعي", "تقنية مالية", "برمجيات الأعمال", "هندسة الأنظمة", "بناء الفرق التقنية"],
    experience: "خبرات مختارة",
    experienceItems: [
      ["٢٠٢٣ — الآن", "قائد هندسي", "بنى ووسع برنامج عمليات داخليًا لفريق تقنية مالية إقليمي."],
      ["٢٠٢٠ — ٢٠٢٣", "مهندس منتجات أول", "أطلق مسارات عمل ثنائية اللغة لمنشآت نامية في الخليج."],
      ["٢٠١٨ — ٢٠٢٠", "مهندس مؤسس", "نقل منتج منصة من نموذج أولي إلى أول عملاء يدفعون."],
    ],
    looking: "ما الذي يبحث عنه أمير",
    lookingText: "شريك يقود اكتشاف العملاء والاستراتيجية التجارية والشراكات والمبيعات المبكرة، ويفضل في اللوجستيات أو التقنية المالية أو برامج المنشآت الصغيرة.",
    values: ["دليل العميل قبل المزايا", "مسؤولية واضحة وخلاف صريح", "السعودية أولًا بإمكانات إقليمية"],
    sprintKicker: "قبل الالتزام",
    sprintTitle: "جرّبا تجربة تأسيس لثلاثة أيام.",
    sprintBody: "اختارا مشكلة عميل صغيرة، وقسّما المسؤوليات، واختبرا التواصل واتخاذ القرار قبل مناقشة شراكة رسمية.",
    sprintAction: "اقترح تجربة عمل",
    safety: "تبقى بيانات التواصل خاصة حتى يوافق الطرفان على التعارف.",
    panelTitle: "اطلب تعارفًا",
    panelBody: "اشرح لماذا تعتقد أن التوافق قد ينجح. سيرى أمير ملف المؤسس الخاص بك مع هذه الرسالة.",
    noteLabel: "رسالة التعارف",
    notePlaceholder: "أعمل حاليًا على… وأعتقد أننا قد نتوافق لأن…",
    cancel: "إلغاء",
    send: "إرسال الطلب",
    sent: "تم تجهيز طلب التعارف في هذه المعاينة.",
  },
} as const;

const reasonIcons = [Zap, Clock3, Target, ShieldCheck] as const;
const detailIcons = [BriefcaseBusiness, Compass, MessageCircle, Target, Clock3, Handshake] as const;

export default function ProfilePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [saved, setSaved] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const arabic = language === "ar";
  const t = profileCopy[language];
  const Back = arabic ? ArrowRight : ArrowLeft;
  const Forward = arabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  function submitIntroduction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="profile-page" dir={arabic ? "rtl" : "ltr"}>
      <header className="profile-header section-frame">
        <a className="brand" href="/"><span className="brand-mark"><UsersRound size={20} /></span><span dir="ltr">Kufuo <b lang="ar">| كفو</b></span></a>
        <a className="profile-back" href="/#discover"><Back size={18} />{t.back}</a>
        <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} /><span>{t.language}</span></button>
      </header>

      <section className="profile-hero section-frame">
        <div className="profile-portrait-panel">
          <img src="/profile-amir.jpg" alt="Illustrative founder profile portrait" />
          <span className="profile-preview-label">{t.preview}</span>
        </div>
        <div className="profile-intro-panel">
          <div className="profile-status-line"><span className="status"><span className="status-dot" />{t.available}</span><span className="verified-line"><ShieldCheck size={17} />{t.verified}</span></div>
          <h1>{t.name}</h1>
          <p className="profile-role">{t.role}</p>
          <p className="profile-intro">{t.intro}</p>
          <div className="profile-facts"><span><MapPin size={17} />{t.city}</span><span><Clock3 size={17} />{t.time}</span><span><Globe2 size={17} />{t.languages}</span></div>
          <div className="profile-actions"><button className="button" type="button" onClick={() => { setPanelOpen(true); setSent(false); }}><Handshake size={19} />{t.connect}</button><button className={`button button-secondary ${saved ? "is-saved" : ""}`} type="button" onClick={() => setSaved((value) => !value)}><Bookmark size={19} fill={saved ? "currentColor" : "none"} />{saved ? t.saved : t.save}</button></div>
        </div>
      </section>

      <section className="profile-match-section section-frame">
        <div className="profile-section-heading"><p className="kicker">{t.matchKicker}</p><h2>{t.matchTitle}</h2></div>
        <div className="match-reason-grid">{t.reasons.map((item, index) => { const Icon = reasonIcons[index]; return <article key={item[0]}><span className="profile-reason-icon"><Icon size={21} /></span><h3>{item[0]}</h3><p>{item[1]}</p></article>; })}</div>
      </section>

      <section className="passport-section section-frame">
        <div className="profile-section-heading passport-heading"><p className="kicker">{t.passport}</p><h2>{t.passportTitle}</h2></div>
        <div className="passport-layout">
          <article className="about-panel"><h3>{t.about}</h3><p>{t.aboutText}</p><div className="skill-area"><h3>{t.skills}</h3><div className="tag-row">{t.skillsList.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></div></article>
          <div className="passport-detail-grid">{t.details.map((item, index) => { const Icon = detailIcons[index]; return <article key={item[0]}><span><Icon size={19} /></span><small>{item[0]}</small><strong>{item[1]}</strong></article>; })}</div>
        </div>
      </section>

      <section className="profile-depth-section section-frame">
        <div className="experience-column"><h2>{t.experience}</h2><div className="experience-list">{t.experienceItems.map((item) => <article key={item[0]}><span>{item[0]}</span><div><h3>{item[1]}</h3><p>{item[2]}</p></div></article>)}</div></div>
        <aside className="looking-card"><div className="looking-icon"><Lightbulb size={26} /></div><h2>{t.looking}</h2><p>{t.lookingText}</p><ul>{t.values.map((value) => <li key={value}><Check size={17} />{value}</li>)}</ul></aside>
      </section>

      <section className="profile-sprint-section">
        <div className="section-frame profile-sprint-inner"><div><p className="kicker kicker-inverse">{t.sprintKicker}</p><h2>{t.sprintTitle}</h2><p>{t.sprintBody}</p></div><button className="button button-inverse" type="button" onClick={() => { setPanelOpen(true); setSent(false); }}>{t.sprintAction}<Forward size={19} /></button></div>
      </section>

      <footer className="profile-footer section-frame"><span><ShieldCheck size={17} />{t.safety}</span><a href="/">Kufuo | كفو © 2026</a></footer>

      {panelOpen && (
        <div className="intro-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanelOpen(false); }}>
          <section className="intro-panel" role="dialog" aria-modal="true" aria-labelledby="intro-title">
            <div className="intro-panel-head"><div><span className="profile-reason-icon"><Handshake size={21} /></span><h2 id="intro-title">{t.panelTitle}</h2></div><button className="icon-button" type="button" onClick={() => setPanelOpen(false)} aria-label={t.cancel}><X size={20} /></button></div>
            <p>{t.panelBody}</p>
            {sent ? <div className="intro-success"><CheckCircle2 size={24} /><strong>{t.sent}</strong><button className="button" type="button" onClick={() => setPanelOpen(false)}>{t.cancel}</button></div> : (
              <form onSubmit={submitIntroduction}><label htmlFor="intro-note">{t.noteLabel}</label><textarea id="intro-note" rows={6} placeholder={t.notePlaceholder} required /><div className="intro-form-actions"><button className="button button-secondary" type="button" onClick={() => setPanelOpen(false)}>{t.cancel}</button><button className="button" type="submit">{t.send}<Forward size={18} /></button></div></form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
