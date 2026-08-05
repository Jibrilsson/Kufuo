"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Code2,
  Compass,
  Filter,
  Handshake,
  Languages,
  Lightbulb,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  Target,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

type Language = "en" | "ar";
type FilterKey = "all" | "tech" | "product" | "business";

const content = {
  en: {
    nav: ["Discover", "How it works", "Founder journey", "Community"],
    signIn: "Sign in",
    join: "Join the community",
    eyebrow: "Saudi-first. Arabic and English.",
    heroTitle: "Find someone worthy of building with.",
    heroBody: "Meet serious builders, explore credible ideas, and test how you work together before making the commitment.",
    haveIdea: "I have an idea",
    joinIdea: "I want to join an idea",
    trust: ["Curated community", "Compatibility explained", "Privacy built in"],
    sample: "Sample match",
    recommended: "Recommended for you",
    strongFit: "Strong fit",
    matchReasons: ["Complementary product and technical skills", "Both available 15+ hours per week", "Aligned on early-stage risk"],
    viewProfile: "View example profile",
    discoverKicker: "Discover",
    discoverTitle: "Meet people who complete your skill set.",
    discoverBody: "Profiles show what matters before a first conversation: skills, commitment, expectations, and working style.",
    filters: { all: "All profiles", tech: "Technology", product: "Product", business: "Business" },
    sampleProfiles: "Illustrative profiles for the product preview",
    pathsKicker: "Two ways to begin",
    pathsTitle: "Bring the idea. Or bring the skill.",
    paths: [
      ["I am building an idea", "Publish a structured opportunity, explain what you have validated, and meet people who fill the gaps in your founding team.", "Create an opportunity"],
      ["I want to join a team", "Find credible ideas that fit your experience, interests, availability, and appetite for risk.", "Build my Founder Passport"],
    ],
    opportunityKicker: "Opportunity preview",
    opportunityTitle: "Clear expectations from the first click.",
    opportunityBody: "Every opportunity shows the problem, current stage, role, commitment, location, and partnership model before anyone spends time on a meeting.",
    opportunityName: "Supply-chain intelligence for Saudi SMEs",
    opportunityStage: "Validating",
    opportunityDescription: "Helping growing businesses predict stock needs and avoid costly shortages using practical, Arabic-first software.",
    seeking: "Seeking",
    seekingRole: "Technical cofounder",
    location: "Riyadh or remote",
    commitment: "15–20 hrs/week",
    model: "Equity partnership",
    progress: "Founder progress",
    progressItems: ["12 customer interviews", "Problem validated", "Prototype scope ready"],
    howKicker: "How it works",
    howTitle: "Do more than exchange introductions.",
    how: [
      ["Build your Founder Passport", "Show your skills, values, availability, risk tolerance, and the kind of company you want to build."],
      ["Understand the fit", "See why a person or opportunity is recommended without relying on a mysterious compatibility score."],
      ["Try working together", "Complete a short, structured sprint before making a long-term cofounder commitment."],
    ],
    sprintKicker: "The Cofounder Trial Sprint",
    sprintTitle: "Chemistry is easier to judge when you build something together.",
    sprintBody: "Choose a small outcome, agree on responsibilities, and spend three or seven days working as a team. Private reflection prompts help both people decide what comes next.",
    sprintSteps: ["Choose one outcome", "Divide responsibilities", "Check in together", "Reflect privately", "Decide what is next"],
    startSprint: "See the sprint flow",
    journeyKicker: "Founder journey",
    journeyTitle: "Progress that means something.",
    journeyBody: "No popularity leaderboard. Your journey advances through useful actions that build trust and move a startup forward.",
    journey: ["Explorer", "Contributor", "Builder", "Partner", "Cofounder"],
    communityKicker: "Built for the Saudi ecosystem",
    communityTitle: "A community, not a cold directory.",
    communityBody: "Industry circles, focused founder gatherings, and curated introductions help high-intent members meet beyond their existing networks.",
    events: [["AI builders majlis", "Riyadh · In person", "18 SEP"], ["Find your technical cofounder", "Online · Arabic", "24 SEP"]],
    safetyTitle: "Trust is part of the product.",
    safetyBody: "Profile controls, mutual connection consent, clear partnership expectations, and active moderation protect the quality of the community.",
    safetyItems: ["Member verification", "Private profile controls", "Reporting and moderation"],
    faqKicker: "Questions",
    faqTitle: "The important things, answered early.",
    faq: [
      ["Is this a freelancer marketplace?", "No. The product is designed for people exploring genuine cofounder partnerships and shared ownership—not unpaid task work."],
      ["Do I need an idea to join?", "No. Skilled builders can discover opportunities that fit their experience, interests, and commitment level."],
      ["Will my idea be public?", "You control what appears publicly, what members can see, and what is shared only after a connection is accepted."],
      ["How does matching work?", "Recommendations use complementary skills, availability, stage, location, risk, and working preferences, then explain the strongest reasons for the fit."],
    ],
    ctaKicker: "Founding cohort",
    ctaTitle: "Your next company may begin with one conversation.",
    ctaBody: "Choose your path and help shape the first Saudi-first cofounder community.",
    emailPlaceholder: "Work email",
    requestInvite: "Request an invitation",
    choosePath: "Choose a path first",
    selectedIdea: "You are joining as an idea owner.",
    selectedSkill: "You are joining as a potential cofounder.",
    confirmation: "Thank you. Your interest is saved in this preview.",
    note: "Early product preview. No confidential idea details are required.",
    footer: "Built for people ready to build together.",
  },
  ar: {
    nav: ["اكتشف", "كيف تعمل المنصة", "رحلة المؤسس", "المجتمع"],
    signIn: "تسجيل الدخول",
    join: "انضم للمجتمع",
    eyebrow: "صُممت للسعودية. بالعربية والإنجليزية.",
    heroTitle: "ابحث عن شخصٍ كفو لتبني معه.",
    heroBody: "تعرّف على أشخاص جادين، واكتشف أفكارًا واعدة، وجرّبوا العمل معًا قبل اتخاذ قرار الشراكة.",
    haveIdea: "لدي فكرة",
    joinIdea: "أريد الانضمام إلى فكرة",
    trust: ["مجتمع منتقى", "توافق واضح", "خصوصية من البداية"],
    sample: "مثال على تطابق",
    recommended: "مقترح لك",
    strongFit: "توافق قوي",
    matchReasons: ["مهارات تقنية ومنتجية متكاملة", "التزام مشترك بأكثر من ١٥ ساعة أسبوعيًا", "توافق في تقبّل مخاطر المرحلة المبكرة"],
    viewProfile: "عرض الملف التجريبي",
    discoverKicker: "اكتشف",
    discoverTitle: "قابل من يكمل مهاراتك.",
    discoverBody: "توضح الملفات ما يهم قبل المحادثة الأولى: المهارات، والالتزام، والتوقعات، وأسلوب العمل.",
    filters: { all: "جميع الملفات", tech: "التقنية", product: "المنتج", business: "الأعمال" },
    sampleProfiles: "ملفات توضيحية لمعاينة المنتج",
    pathsKicker: "طريقان للبداية",
    pathsTitle: "قدّم الفكرة. أو قدّم المهارة.",
    paths: [
      ["أعمل على فكرة", "انشر فرصة واضحة، واشرح ما اختبرته، وقابل أشخاصًا يكملون فريقك المؤسس.", "أنشئ فرصة تأسيس"],
      ["أريد الانضمام إلى فريق", "اكتشف أفكارًا جادة تناسب خبرتك واهتماماتك ووقتك واستعدادك للمخاطرة.", "أنشئ ملف المؤسس"],
    ],
    opportunityKicker: "معاينة الفرصة",
    opportunityTitle: "توقعات واضحة من أول نقرة.",
    opportunityBody: "كل فرصة توضح المشكلة والمرحلة والدور والالتزام والموقع ونموذج الشراكة قبل أن يقضي أي طرف وقته في اجتماع.",
    opportunityName: "ذكاء سلاسل الإمداد للمنشآت السعودية",
    opportunityStage: "مرحلة التحقق",
    opportunityDescription: "مساعدة المنشآت النامية على توقع احتياجات المخزون وتفادي النقص المكلف عبر برنامج عملي يدعم العربية.",
    seeking: "نبحث عن",
    seekingRole: "شريك مؤسس تقني",
    location: "الرياض أو عن بُعد",
    commitment: "١٥–٢٠ ساعة أسبوعيًا",
    model: "شراكة بالملكية",
    progress: "تقدم المؤسس",
    progressItems: ["١٢ مقابلة مع عملاء", "تم التحقق من المشكلة", "نطاق النموذج الأولي جاهز"],
    howKicker: "كيف تعمل",
    howTitle: "أكثر من مجرد تعارف.",
    how: [
      ["أنشئ ملف المؤسس", "اعرض مهاراتك وقيمك ووقتك وتقبلك للمخاطرة ونوع الشركة التي تريد بناءها."],
      ["افهم سبب التوافق", "اعرف لماذا رُشّح لك شخص أو فرصة دون الاعتماد على درجة غامضة."],
      ["جرّبوا العمل معًا", "أكملوا تجربة عملية قصيرة ومنظمة قبل اتخاذ قرار شراكة طويل المدى."],
    ],
    sprintKicker: "تجربة الشريك المؤسس",
    sprintTitle: "أسهل طريقة لاختبار الانسجام هي أن تبنوا شيئًا معًا.",
    sprintBody: "اختاروا نتيجة صغيرة، وحددوا المسؤوليات، واعملوا كفريق لثلاثة أو سبعة أيام. تساعد الأسئلة الخاصة الطرفين على اتخاذ الخطوة التالية.",
    sprintSteps: ["اختيار نتيجة واحدة", "تقسيم المسؤوليات", "متابعة مشتركة", "تقييم خاص", "تحديد الخطوة التالية"],
    startSprint: "استعرض التجربة",
    journeyKicker: "رحلة المؤسس",
    journeyTitle: "تقدم له معنى.",
    journeyBody: "لا توجد قائمة شعبية. تتقدم رحلتك عبر أفعال مفيدة تبني الثقة وتحرك المشروع إلى الأمام.",
    journey: ["مستكشف", "مساهم", "صانع", "شريك", "مؤسس مشارك"],
    communityKicker: "لمنظومة ريادة الأعمال السعودية",
    communityTitle: "مجتمع، وليس دليل أسماء باردًا.",
    communityBody: "دوائر متخصصة، ولقاءات مركزة، وترشيحات منتقاة تساعد الأعضاء الجادين على اللقاء خارج شبكاتهم المعتادة.",
    events: [["مجلس صُنّاع الذكاء الاصطناعي", "الرياض · حضوري", "١٨ سبتمبر"], ["اعثر على شريكك التقني", "عن بُعد · بالعربية", "٢٤ سبتمبر"]],
    safetyTitle: "الثقة جزء من المنتج.",
    safetyBody: "التحكم بالملف، والموافقة المتبادلة، ووضوح توقعات الشراكة، والإشراف الفعّال تحافظ على جودة المجتمع.",
    safetyItems: ["توثيق الأعضاء", "خيارات خصوصية واضحة", "بلاغات وإشراف فعّال"],
    faqKicker: "أسئلة",
    faqTitle: "الأمور المهمة، بإجابات مبكرة.",
    faq: [
      ["هل هذه منصة للعمل الحر؟", "لا. المنصة مخصصة لمن يستكشفون شراكة تأسيس حقيقية وملكية مشتركة، وليست للحصول على عمل مجاني."],
      ["هل أحتاج إلى فكرة للانضمام؟", "لا. يستطيع أصحاب المهارات اكتشاف فرص تناسب خبرتهم واهتماماتهم ومستوى التزامهم."],
      ["هل ستكون فكرتي متاحة للجميع؟", "أنت تتحكم فيما يظهر للعامة، وما يراه الأعضاء، وما يُشارك فقط بعد قبول التواصل."],
      ["كيف تعمل المطابقة؟", "تستخدم الترشيحات تكامل المهارات والوقت والمرحلة والموقع والمخاطرة وأسلوب العمل، ثم تشرح أسباب التوافق."],
    ],
    ctaKicker: "المجموعة التأسيسية",
    ctaTitle: "قد تبدأ شركتك القادمة بمحادثة واحدة.",
    ctaBody: "اختر طريقك وساهم في تشكيل أول مجتمع سعودي للشركاء المؤسسين.",
    emailPlaceholder: "البريد المهني",
    requestInvite: "اطلب دعوة",
    choosePath: "اختر مسارك أولًا",
    selectedIdea: "ستنضم بصفتك صاحب فكرة.",
    selectedSkill: "ستنضم بصفتك شريكًا مؤسسًا محتملًا.",
    confirmation: "شكرًا لك. تم حفظ اهتمامك في هذه المعاينة.",
    note: "معاينة مبكرة للمنتج. لا نطلب أي تفاصيل سرية عن فكرتك.",
    footer: "لمن هم مستعدون للبناء معًا.",
  },
} as const;

const profiles = [
  { name: ["Amir N.", "أمير ن."], role: ["Full-stack engineer", "مهندس برمجيات متكامل"], filter: "tech", city: ["Riyadh", "الرياض"], time: ["15 hrs/week", "١٥ ساعة أسبوعيًا"], tags: [["Fintech", "AI", "B2B"], ["تقنية مالية", "ذكاء اصطناعي", "أعمال"]], image: "/profile-amir.jpg" },
  { name: ["Sara A.", "سارة أ."], role: ["Product & growth", "منتج ونمو"], filter: "product", city: ["Jeddah", "جدة"], time: ["Part-time to start", "دوام جزئي مبدئيًا"], tags: [["Marketplaces", "Consumer", "Tourism"], ["منصات", "منتجات استهلاكية", "سياحة"]], image: "/profile-sara.jpg" },
  { name: ["Maha R.", "مها ر."], role: ["Operations & strategy", "عمليات واستراتيجية"], filter: "business", city: ["Eastern Province", "المنطقة الشرقية"], time: ["Ready full-time", "مستعدة للتفرغ"], tags: [["Logistics", "Climate", "SMEs"], ["لوجستيات", "استدامة", "منشآت صغيرة"]], image: "/profile-maha.jpg" },
] as const;

const howIcons = [CircleUserRound, Search, Zap] as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState<"idea" | "skill" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const t = content[language];
  const dashboardHref = process.env.NODE_ENV === "development" ? "/dashboard" : "/signin-with-chatgpt?return_to=%2Fdashboard";
  const arabic = language === "ar";
  const l = arabic ? 1 : 0;
  const Arrow = arabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  const visibleProfiles = useMemo(() => profiles.filter((profile) => activeFilter === "all" || profile.filter === activeFilter), [activeFilter]);

  function choosePath(next: "idea" | "skill") {
    setPath(next);
    setSubmitted(false);
    document.querySelector("#join")?.scrollIntoView({ behavior: "smooth" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (path) setSubmitted(true);
  }

  return (
    <main className="site-shell" dir={arabic ? "rtl" : "ltr"}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kufuo home"><span className="brand-mark"><UsersRound size={20} /></span><span dir="ltr">Kufuo <b lang="ar">| كفو</b></span></a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {t.nav.map((item, index) => <a key={item} href={["#discover", "#how", "#journey", "#community"][index]} onClick={() => setMenuOpen(false)}>{item}</a>)}
        </nav>
        <div className="header-actions">
          <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")} aria-label={arabic ? "Switch to English" : "التبديل إلى العربية"}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button>
          <a className="text-link header-sign-in" href={dashboardHref}>{t.signIn}</a>
          <a className="button button-small" href={dashboardHref}>{t.join}</a>
          <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <section className="hero section-frame" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><MapPin size={16} />{t.eyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-body">{t.heroBody}</p>
          <div className="hero-actions">
            <button className="button" type="button" onClick={() => choosePath("idea")}><Lightbulb size={19} />{t.haveIdea}</button>
            <button className="button button-secondary" type="button" onClick={() => choosePath("skill")}><BriefcaseBusiness size={19} />{t.joinIdea}</button>
          </div>
          <ul className="trust-list">
            {t.trust.map((item, index) => { const Icon = [ShieldCheck, Target, CheckCircle2][index]; return <li key={item}><Icon size={18} />{item}</li>; })}
          </ul>
        </div>

        <div className="match-preview" aria-label={t.sample}>
          <div className="preview-topline"><span className="preview-label">{t.sample}</span><span className="status"><span className="status-dot" />{t.recommended}</span></div>
          <div className="match-people">
            <div className="person-mini"><img src="/profile-sara.jpg" alt="Illustrative founder profile" /><div><strong>{arabic ? "سارة" : "Sara"}</strong><span>{arabic ? "منتج ونمو" : "Product & growth"}</span></div></div>
            <div className="match-link"><Handshake size={22} /></div>
            <div className="person-mini person-mini-end"><img src="/profile-amir.jpg" alt="Illustrative founder profile" /><div><strong>{arabic ? "أمير" : "Amir"}</strong><span>{arabic ? "هندسة تقنية" : "Engineering"}</span></div></div>
          </div>
          <div className="fit-heading"><div><span>{arabic ? "سبب الترشيح" : "Why this works"}</span><h2>{t.strongFit}</h2></div><Target size={26} /></div>
          <ul className="reason-list">{t.matchReasons.map((reason) => <li key={reason}><Check size={17} />{reason}</li>)}</ul>
          <a className="panel-action" href="/profile">{t.viewProfile}<Arrow size={18} /></a>
        </div>
      </section>

      <section className="section-frame discover-section" id="discover">
        <div className="section-heading split-heading"><div><p className="kicker">{t.discoverKicker}</p><h2>{t.discoverTitle}</h2></div><p>{t.discoverBody}</p></div>
        <div className="filter-row" aria-label="Profile filters">
          <span className="filter-icon"><Filter size={17} /></span>
          {(Object.keys(t.filters) as FilterKey[]).map((filter) => <button type="button" className={`chip ${activeFilter === filter ? "is-active" : ""}`} aria-pressed={activeFilter === filter} key={filter} onClick={() => setActiveFilter(filter)}>{t.filters[filter]}</button>)}
        </div>
        <p className="sample-note">{t.sampleProfiles}</p>
        <div className="profile-grid">
          {visibleProfiles.map((profile) => (
            <article className="profile-card" key={profile.name[0]}>
              <div className="profile-photo-wrap"><img className="profile-photo" src={profile.image} alt="Illustrative profile portrait" /><span className="availability-badge"><span className="status-dot" />{arabic ? "متاح" : "Available"}</span></div>
              <div className="profile-content">
                <div className="profile-title-row"><div><h3>{profile.name[l]}</h3><p>{profile.role[l]}</p></div><a className="icon-button" href="/profile" aria-label={`View ${profile.name[0]} profile`}><Arrow size={19} /></a></div>
                <div className="profile-meta"><span><MapPin size={15} />{profile.city[l]}</span><span><Clock3 size={15} />{profile.time[l]}</span></div>
                <div className="tag-row">{profile.tags[l].map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-frame path-section">
        <div className="section-heading centered-heading"><p className="kicker">{t.pathsKicker}</p><h2>{t.pathsTitle}</h2></div>
        <div className="path-grid">
          {t.paths.map((item, index) => { const Icon = index === 0 ? Lightbulb : UsersRound; return (
            <article className="path-card" key={item[0]}><div className="large-icon"><Icon size={28} /></div><span className="card-number">0{index + 1}</span><h3>{item[0]}</h3><p>{item[1]}</p><button className="card-link" type="button" onClick={() => choosePath(index === 0 ? "idea" : "skill")}>{item[2]}<Arrow size={18} /></button></article>
          ); })}
        </div>
      </section>

      <section className="section-frame opportunity-section">
        <div className="opportunity-copy"><p className="kicker">{t.opportunityKicker}</p><h2>{t.opportunityTitle}</h2><p>{t.opportunityBody}</p><ul className="plain-feature-list"><li><ShieldCheck size={19} />{arabic ? "تفاصيل حساسة لا تظهر إلا بعد قبول التواصل" : "Sensitive details stay private until a connection is accepted"}</li><li><Target size={19} />{arabic ? "نموذج الشراكة واضح منذ البداية" : "The partnership model is visible from the start"}</li></ul></div>
        <article className="opportunity-card">
          <div className="opportunity-card-top"><div className="opportunity-icon"><Code2 size={24} /></div><span className="status neutral-status">{t.opportunityStage}</span></div>
          <h3>{t.opportunityName}</h3><p>{t.opportunityDescription}</p>
          <div className="opportunity-details"><span className="detail-label">{t.seeking}</span><strong>{t.seekingRole}</strong><ul><li><MapPin size={17} />{t.location}</li><li><Clock3 size={17} />{t.commitment}</li><li><Handshake size={17} />{t.model}</li></ul></div>
          <div className="progress-box"><span>{t.progress}</span>{t.progressItems.map((item) => <p key={item}><CheckCircle2 size={16} />{item}</p>)}</div>
        </article>
      </section>

      <section className="section-frame how-section" id="how">
        <div className="section-heading centered-heading narrow-heading"><p className="kicker">{t.howKicker}</p><h2>{t.howTitle}</h2></div>
        <div className="steps-grid">{t.how.map((item, index) => { const Icon = howIcons[index]; return <article className="step-card" key={item[0]}><div className="step-top"><span>0{index + 1}</span><Icon size={25} /></div><h3>{item[0]}</h3><p>{item[1]}</p></article>; })}</div>
      </section>

      <section className="sprint-section">
        <div className="section-frame sprint-inner">
          <div className="sprint-copy"><p className="kicker kicker-inverse">{t.sprintKicker}</p><h2>{t.sprintTitle}</h2><p>{t.sprintBody}</p><a className="button button-inverse" href="#journey">{t.startSprint}<Arrow size={19} /></a></div>
          <div className="sprint-board">
            <div className="sprint-board-head"><div><span>{arabic ? "تجربة ٣ أيام" : "3-day sprint"}</span><strong>{arabic ? "اختبار فرضية العميل" : "Test the customer problem"}</strong></div><span className="sprint-status"><Clock3 size={15} />{arabic ? "يومان متبقيان" : "2 days left"}</span></div>
            <ol className="sprint-list">{t.sprintSteps.map((item, index) => <li className={index < 2 ? "is-complete" : index === 2 ? "is-current" : ""} key={item}><span className="sprint-check">{index < 2 ? <Check size={16} /> : index + 1}</span><span>{item}</span></li>)}</ol>
            <div className="sprint-people"><div className="avatar-stack"><img src="/profile-amir.jpg" alt="Illustrative participant" /><img src="/profile-sara.jpg" alt="Illustrative participant" /></div><span>{arabic ? "أمير وسارة يعملان معًا" : "Amir and Sara are building together"}</span></div>
          </div>
        </div>
      </section>

      <section className="section-frame journey-section" id="journey">
        <div className="section-heading split-heading"><div><p className="kicker">{t.journeyKicker}</p><h2>{t.journeyTitle}</h2></div><p>{t.journeyBody}</p></div>
        <ol className="journey-track">{t.journey.map((item, index) => { const Icon = [Compass, MessageCircle, Zap, Handshake, UsersRound][index]; return <li className={index < 2 ? "is-complete" : index === 2 ? "is-current" : ""} key={item}><span className="journey-icon"><Icon size={21} /></span><span className="journey-index">0{index + 1}</span><strong>{item}</strong></li>; })}</ol>
      </section>

      <section className="section-frame community-section" id="community">
        <div className="community-copy"><p className="kicker">{t.communityKicker}</p><h2>{t.communityTitle}</h2><p>{t.communityBody}</p><div className="event-list">{t.events.map((event) => <article className="event-item" key={event[0]}><span className="event-date">{event[2]}</span><div><h3>{event[0]}</h3><p>{event[1]}</p></div><button className="icon-button" type="button" aria-label={`View ${event[0]}`}><Arrow size={18} /></button></article>)}</div></div>
        <aside className="safety-card"><div className="safety-icon"><ShieldCheck size={30} /></div><h3>{t.safetyTitle}</h3><p>{t.safetyBody}</p><ul>{t.safetyItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></aside>
      </section>

      <section className="section-frame faq-section">
        <div className="faq-heading"><p className="kicker">{t.faqKicker}</p><h2>{t.faqTitle}</h2></div>
        <div className="faq-list">{t.faq.map((item) => <details key={item[0]}><summary>{item[0]}<ChevronDown size={20} /></summary><p>{item[1]}</p></details>)}</div>
      </section>

      <section className="section-frame cta-section" id="join">
        <div className="cta-copy"><p className="kicker kicker-inverse">{t.ctaKicker}</p><h2>{t.ctaTitle}</h2><p>{t.ctaBody}</p></div>
        <div className="cta-form-area">
          <div className="path-toggle"><button className={path === "idea" ? "is-selected" : ""} type="button" onClick={() => setPath("idea")}><Lightbulb size={18} />{t.haveIdea}</button><button className={path === "skill" ? "is-selected" : ""} type="button" onClick={() => setPath("skill")}><BriefcaseBusiness size={18} />{t.joinIdea}</button></div>
          <p className="path-selection" aria-live="polite">{path === "idea" ? t.selectedIdea : path === "skill" ? t.selectedSkill : t.choosePath}</p>
          <form onSubmit={submit} className="invite-form"><label className="sr-only" htmlFor="email">{t.emailPlaceholder}</label><input id="email" type="email" placeholder={t.emailPlaceholder} required /><button className="button" type="submit" disabled={!path}>{t.requestInvite}<Arrow size={18} /></button></form>
          {submitted && <p className="confirmation" role="status"><CheckCircle2 size={18} />{t.confirmation}</p>}<p className="prototype-note">{t.note}</p>
        </div>
      </section>

      <footer className="site-footer section-frame"><div><a className="brand" href="#top"><span className="brand-mark"><UsersRound size={20} /></span><span dir="ltr">Kufuo <b lang="ar">| كفو</b></span></a><p>{t.footer}</p></div><nav><a href="#community">{arabic ? "الأمان" : "Safety"}</a><a href="#community">{arabic ? "المجتمع" : "Community"}</a><a href="#">{arabic ? "الخصوصية" : "Privacy"}</a><a href="#">{arabic ? "الشروط" : "Terms"}</a></nav><span>© 2026 Kufuo | كفو</span></footer>
    </main>
  );
}
