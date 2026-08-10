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
import { createClient } from "./lib/supabase/client";

type Language = "en" | "ar";
type FilterKey = "all" | "tech" | "product" | "business";
type AuthState = "loading" | "signed-in" | "signed-out";

const content = {
  en: {
    nav: ["Discover", "How it works", "Founder journey", "Community"],
    signIn: "Log in",
    join: "Join the community",
    profile: "My profile",
    dashboard: "Dashboard",
    eyebrow: "For people serious about building together.",
    heroTitle: "Find the right person to build what comes next.",
    heroBody: "Bring an idea or bring the skills it needs. Kufuo helps you meet compatible cofounders, compare working preferences, and test the partnership before making a long-term commitment.",
    haveIdea: "I bring the idea",
    joinIdea: "I bring the skill",
    searchLabel: "Find your Kufuo",
    searchPath: "What are you bringing?",
    searchLocation: "Where will you build?",
    searchLocationValue: "Anywhere",
    searchExpertise: "What skill is missing?",
    searchExpertiseValue: "Any expertise",
    searchAction: "Find my cofounder",
    featuredLabel: "Founder community",
    heroIllustrationAlt: "Two founders collaborating on a product idea",
    trust: ["Curated community", "Compatibility explained", "Privacy built in"],
    sample: "Sample match",
    recommended: "Recommended for you",
    strongFit: "Strong fit",
    matchReasons: ["Complementary product and technical skills", "Both available 15+ hours per week", "Aligned on early-stage risk"],
    viewProfile: "View example profile",
    discoverKicker: "Discover",
    discoverTitle: "Meet the person your founding team is missing.",
    discoverBody: "Skills are only the start. Compare commitment, decision-making, risk tolerance, and working style before you begin.",
    filters: { all: "All profiles", tech: "Technology", product: "Product", business: "Business" },
    sampleProfiles: "Illustrative profiles for the product preview",
    pathsKicker: "Start where you are",
    pathsTitle: "Bring the idea. Or bring what the idea needs.",
    paths: [
      ["I have an idea and need a partner", "Share what you have learned, define the role you need, and meet people who could strengthen your founding team.", "Post a cofounder opportunity"],
      ["I have skills and want to build", "Explore credible ideas that match your expertise, availability, ambition, and approach to risk.", "Create a founder profile"],
    ],
    opportunityKicker: "Opportunity preview",
    opportunityTitle: "Understand the opportunity before the first call.",
    opportunityBody: "Each opportunity explains the problem, stage, role, expected commitment, location, and partnership model upfront.",
    opportunityName: "Supply-chain intelligence for growing businesses",
    opportunityStage: "Validating",
    opportunityDescription: "Helping growing businesses predict stock needs and avoid costly shortages using practical, Arabic-first software.",
    seeking: "Seeking",
    seekingRole: "Technical cofounder",
    location: "Remote-friendly",
    commitment: "15–20 hrs/week",
    model: "Equity partnership",
    progress: "Founder progress",
    progressItems: ["12 customer interviews", "Problem validated", "Prototype scope ready"],
    howKicker: "How it works",
    howTitle: "Less guesswork. More clarity.",
    how: [
      ["Show who you really are", "Share your skills, values, availability, risk tolerance, and the kind of company you want to build."],
      ["See why the match could work", "Understand the common ground and the gaps—without relying on a mysterious compatibility score."],
      ["Build something small together", "Complete a short, structured sprint before making a long-term cofounder commitment."],
    ],
    sprintKicker: "The Cofounder Trial Sprint",
    sprintTitle: "Before equity and promises, build something small together.",
    sprintBody: "Choose a small outcome, agree on responsibilities, and spend three or seven days working as a team. Private reflection prompts help both people decide what comes next.",
    sprintSteps: ["Choose one outcome", "Divide responsibilities", "Check in together", "Reflect privately", "Decide what is next"],
    startSprint: "See the sprint flow",
    journeyKicker: "Founder journey",
    journeyTitle: "Useful actions build real trust.",
    journeyBody: "No popularity leaderboard. Your journey advances through useful actions that build trust and move a startup forward.",
    journey: ["Explorer", "Contributor", "Builder", "Partner", "Cofounder"],
    communityKicker: "Built for meaningful connections",
    communityTitle: "A founder community, not a directory.",
    communityBody: "Focused circles, practical sessions, and thoughtful introductions help committed builders meet beyond their existing networks.",
    events: [["AI builders roundtable", "Online · Open session", "18 SEP"], ["Meet a technical cofounder", "Online · Founder session", "24 SEP"]],
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
    ctaTitle: "Your next company may begin with: “What are you building?”",
    ctaBody: "Choose what you bring, create your profile, and meet people ready to build with intention.",
    emailPlaceholder: "Work email",
    requestInvite: "Request an invitation",
    choosePath: "Choose a path first",
    selectedIdea: "You are joining as an idea owner.",
    selectedSkill: "You are joining as a potential cofounder.",
    confirmation: "You’re on the list. We’ll keep you updated.",
    note: "Never share confidential idea details before trust is established.",
    footer: "Built for people ready to build together.",
  },
  ar: {
    nav: ["اكتشف", "كيف تعمل المنصة", "رحلة المؤسس", "المجتمع"],
    signIn: "دخول",
    join: "انضم للمجتمع",
    profile: "ملفي",
    dashboard: "لوحة التحكم",
    eyebrow: "للي ناوين يبنون بجد.",
    heroTitle: "لقّ الشخص المناسب، وابنوا القادم سوا.",
    heroBody: "سواء جاي بفكرة أو بمهارة، كفو يساعدك تلقى شريك مؤسس يكمّلك، وتقارنون أسلوب العمل والتوقعات، وتجربون الشراكة قبل الالتزام الطويل.",
    haveIdea: "معي الفكرة",
    joinIdea: "معي المهارة",
    searchLabel: "لقّ كفوك",
    searchPath: "وش جاي تبني؟",
    searchLocation: "وين تفضّل تبني؟",
    searchLocationValue: "أي مكان",
    searchExpertise: "وش المهارة الناقصة؟",
    searchExpertiseValue: "أي مهارة",
    searchAction: "لقّ كفوك",
    featuredLabel: "مجتمع المؤسسين",
    heroIllustrationAlt: "شريكان مؤسسان يتعاونان على تطوير فكرة منتج",
    trust: ["مجتمع منتقى", "توافق واضح", "خصوصية من البداية"],
    sample: "مثال على تطابق",
    recommended: "مقترح لك",
    strongFit: "توافق قوي",
    matchReasons: ["مهارات تقنية ومنتجية متكاملة", "التزام مشترك بأكثر من ١٥ ساعة أسبوعيًا", "توافق في تقبّل مخاطر المرحلة المبكرة"],
    viewProfile: "عرض الملف التجريبي",
    discoverKicker: "اكتشف",
    discoverTitle: "لقّ الشخص اللي يكمل فريقك المؤسس.",
    discoverBody: "المهارة هي البداية. قارن الالتزام، وطريقة القرار، وتقبّل المخاطرة، وأسلوب العمل قبل ما تبدأون.",
    filters: { all: "جميع الملفات", tech: "التقنية", product: "المنتج", business: "الأعمال" },
    sampleProfiles: "ملفات توضيحية لمعاينة المنتج",
    pathsKicker: "كل شخص يدخل من باب",
    pathsTitle: "هات الفكرة. أو هات اللي تحتاجه الفكرة.",
    paths: [
      ["معي فكرة وأدور شريك", "شارك اللي تعلمته، وحدد الدور اللي تحتاجه، وقابل أشخاص ممكن يقوّون فريقك المؤسس.", "انشر فرصة شراكة"],
      ["معي مهارة وأدور فكرة", "اكتشف أفكارًا جادة تناسب خبرتك ووقتك وطموحك وطريقتك في التعامل مع المخاطرة.", "أنشئ ملف مؤسس"],
    ],
    opportunityKicker: "معاينة الفرصة",
    opportunityTitle: "افهم الفرصة قبل أول مكالمة.",
    opportunityBody: "كل فرصة توضّح المشكلة والمرحلة والدور والالتزام المتوقع والموقع ونموذج الشراكة من البداية.",
    opportunityName: "ذكاء سلاسل الإمداد للشركات النامية",
    opportunityStage: "مرحلة التحقق",
    opportunityDescription: "مساعدة المنشآت النامية على توقع احتياجات المخزون وتفادي النقص المكلف عبر برنامج عملي يدعم العربية.",
    seeking: "نبحث عن",
    seekingRole: "شريك مؤسس تقني",
    location: "مناسب للعمل عن بُعد",
    commitment: "١٥–٢٠ ساعة أسبوعيًا",
    model: "شراكة بالملكية",
    progress: "تقدم المؤسس",
    progressItems: ["١٢ مقابلة مع عملاء", "تم التحقق من المشكلة", "نطاق النموذج الأولي جاهز"],
    howKicker: "كيف تعمل",
    howTitle: "تخمين أقل. وضوح أكثر.",
    how: [
      ["عرّف بنفسك بصدق", "وضّح مهاراتك وقيمك ووقتك وتقبلك للمخاطرة ونوع الشركة اللي ودك تبنيها."],
      ["افهم ليه ممكن تضبطون", "شوف نقاط الاتفاق والفجوات بوضوح، بدون الاعتماد على درجة توافق غامضة."],
      ["جرّبوا تشتغلون سوا", "سوّوا تجربة عملية قصيرة ومنظمة قبل قرار الشراكة طويل المدى."],
    ],
    sprintKicker: "تجربة الشريك المؤسس",
    sprintTitle: "قبل الحصص والوعود… ابنوا شيئًا صغيرًا سوا.",
    sprintBody: "اختاروا نتيجة صغيرة، وحددوا المسؤوليات، واعملوا كفريق لثلاثة أو سبعة أيام. تساعد الأسئلة الخاصة الطرفين على اتخاذ الخطوة التالية.",
    sprintSteps: ["اختيار نتيجة واحدة", "تقسيم المسؤوليات", "متابعة مشتركة", "تقييم خاص", "تحديد الخطوة التالية"],
    startSprint: "استعرض التجربة",
    journeyKicker: "رحلة المؤسس",
    journeyTitle: "كل خطوة مفيدة ترفع ثقة المجتمع فيك.",
    journeyBody: "لا توجد قائمة شعبية. تتقدم رحلتك عبر أفعال مفيدة تبني الثقة وتحرك المشروع إلى الأمام.",
    journey: ["مستكشف", "مساهم", "صانع", "شريك", "مؤسس مشارك"],
    communityKicker: "لعلاقات تأسيس لها معنى",
    communityTitle: "مجتمع مؤسسين، مو مجرد قائمة أسماء.",
    communityBody: "دوائر مركزة، وجلسات عملية، وترشيحات مدروسة تساعد البنّائين الجادين يتعرفون خارج شبكاتهم المعتادة.",
    events: [["جلسة صُنّاع الذكاء الاصطناعي", "عن بُعد · جلسة مفتوحة", "١٨ سبتمبر"], ["تعرّف على شريك تقني", "عن بُعد · جلسة مؤسسين", "٢٤ سبتمبر"]],
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
    ctaTitle: "يمكن شركتك الجاية تبدأ بسؤال: وش قاعد تبني؟",
    ctaBody: "اختر وش تضيف، وأنشئ ملفك، وتعرّف على أشخاص مستعدين يبنون بجد.",
    emailPlaceholder: "البريد المهني",
    requestInvite: "أرسل لي دعوة",
    choosePath: "اختر مسارك أولًا",
    selectedIdea: "ستنضم بصفتك صاحب فكرة.",
    selectedSkill: "ستنضم بصفتك شريكًا مؤسسًا محتملًا.",
    confirmation: "تم تسجيل اهتمامك. بنرسل لك آخر المستجدات.",
    note: "لا تشارك تفاصيل سرية عن فكرتك قبل ما تتكوّن الثقة.",
    footer: "لمن هم مستعدون للبناء معًا.",
  },
} as const;

const profiles = [
  { name: ["Amir N.", "أمير ن."], role: ["Full-stack engineer", "مهندس برمجيات متكامل"], filter: "tech", city: ["Remote", "عن بُعد"], time: ["15 hrs/week", "١٥ ساعة أسبوعيًا"], tags: [["Fintech", "AI", "B2B"], ["تقنية مالية", "ذكاء اصطناعي", "أعمال"]], image: "/profile-amir.jpg" },
  { name: ["Sara A.", "سارة أ."], role: ["Product & growth", "منتج ونمو"], filter: "product", city: ["Europe", "أوروبا"], time: ["Part-time to start", "دوام جزئي مبدئيًا"], tags: [["Marketplaces", "Consumer", "Travel"], ["منصات", "منتجات استهلاكية", "سفر"]], image: "/profile-sara.jpg" },
  { name: ["Maha R.", "مها ر."], role: ["Operations & strategy", "عمليات واستراتيجية"], filter: "business", city: ["MENA", "الشرق الأوسط وشمال أفريقيا"], time: ["Ready full-time", "مستعدة للتفرغ"], tags: [["Logistics", "Climate", "SMEs"], ["لوجستيات", "استدامة", "منشآت صغيرة"]], image: "/profile-maha.jpg" },
] as const;

const howIcons = [CircleUserRound, Search, Zap] as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState<"idea" | "skill" | null>(null);
  const [location, setLocation] = useState("all");
  const [expertise, setExpertise] = useState<FilterKey>("all");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [authState, setAuthState] = useState<AuthState>("loading");
  const t = content[language];
  const dashboardHref = "/login?returnTo=%2Fdashboard";
  const registrationHref = "/login?mode=signup&returnTo=%2Faccount";
  const arabic = language === "ar";
  const l = arabic ? 1 : 0;
  const Arrow = arabic ? ArrowLeft : ArrowRight;
  const signedIn = authState === "signed-in";
  const secondaryAuthHref = signedIn ? "/account" : dashboardHref;
  const primaryAuthHref = signedIn ? "/dashboard" : registrationHref;
  const secondaryAuthLabel = signedIn ? t.profile : t.signIn;
  const primaryAuthLabel = signedIn ? t.dashboard : t.join;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser()
      .then(({ data }) => {
        if (active) setAuthState(data.user ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active) setAuthState("signed-out");
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthState(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const visibleProfiles = useMemo(() => profiles.filter((profile) => activeFilter === "all" || profile.filter === activeFilter), [activeFilter]);

  function choosePath(next: "idea" | "skill") {
    setPath(next);
    setSubmitted(false);
    document.querySelector("#join")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!path || !email.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    const { error } = await createClient().from("waitlist").insert({ email: email.trim().toLowerCase(), path, source: "landing_page" });
    setSubmitting(false);
    if (error && error.code !== "23505") { setSubmitError(error.message); return; }
    setSubmitted(true);
  }

  function searchFounders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveFilter(expertise);
    document.querySelector("#discover")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="site-shell" dir={arabic ? "rtl" : "ltr"}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a>
        <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {t.nav.map((item, index) => <a key={item} href={["#discover", "#how", "#journey", "#community"][index]} onClick={() => setMenuOpen(false)}>{item}</a>)}
          <div className={`mobile-auth-links ${authState === "loading" ? "is-loading" : ""}`} aria-busy={authState === "loading"}><a className="button button-secondary" href={secondaryAuthHref}>{secondaryAuthLabel}</a><a className="button button-lime" href={primaryAuthHref}>{primaryAuthLabel}</a></div>
        </nav>
        <div className="header-actions">
          <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")} aria-label={arabic ? "Switch to English" : "التبديل إلى العربية"}><Languages size={18} /><span>{arabic ? "English" : "العربية"}</span></button>
          <div className={`header-auth-links ${authState === "loading" ? "is-loading" : ""}`} aria-busy={authState === "loading"}>
            <a className="button button-small button-secondary header-sign-in" href={secondaryAuthHref}>{secondaryAuthLabel}</a>
            <a className="button button-small" href={primaryAuthHref}>{primaryAuthLabel}</a>
          </div>
          <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <section className="hero section-frame" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><MapPin size={16} />{t.eyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-body">{t.heroBody}</p>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-topline"><span><UsersRound size={16} />{t.featuredLabel}</span><span className="hero-visual-count">01</span></div>
          <img src="/kufuo-founder-collaboration.png" alt={t.heroIllustrationAlt} />
          <div className="hero-visual-caption"><span>{arabic ? "فكرة + مهارة" : "Idea + skill"}</span><strong>{arabic ? "ابدأ بالبناء معًا" : "Start building together"}</strong></div>
        </div>
      </section>

      <section className="founder-search-wrap section-frame" id="founder-search" aria-label={t.searchLabel}>
        <form className="founder-search-panel" onSubmit={searchFounders}>
          <div className="search-path-block">
            <span className="search-field-label">{t.searchPath}</span>
            <div className="search-path-toggle">
              <button type="button" className={path === "idea" ? "is-selected" : ""} aria-pressed={path === "idea"} onClick={() => setPath("idea")}><Lightbulb size={17} />{t.haveIdea}</button>
              <button type="button" className={path === "skill" ? "is-selected" : ""} aria-pressed={path === "skill"} onClick={() => setPath("skill")}><BriefcaseBusiness size={17} />{t.joinIdea}</button>
            </div>
          </div>
          <label className="search-select-field"><span className="search-field-label"><MapPin size={15} />{t.searchLocation}</span><span className="select-control"><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="all">{t.searchLocationValue}</option><option value="europe">{arabic ? "أوروبا" : "Europe"}</option><option value="mena">{arabic ? "الشرق الأوسط وشمال أفريقيا" : "MENA"}</option><option value="americas">{arabic ? "الأمريكتان" : "Americas"}</option><option value="asia-pacific">{arabic ? "آسيا والمحيط الهادئ" : "Asia-Pacific"}</option><option value="remote">{arabic ? "عن بُعد" : "Remote"}</option></select><ChevronDown size={17} /></span></label>
          <label className="search-select-field"><span className="search-field-label"><Code2 size={15} />{t.searchExpertise}</span><span className="select-control"><select value={expertise} onChange={(event) => setExpertise(event.target.value as FilterKey)}><option value="all">{t.searchExpertiseValue}</option><option value="tech">{t.filters.tech}</option><option value="product">{t.filters.product}</option><option value="business">{t.filters.business}</option></select><ChevronDown size={17} /></span></label>
          <button className="search-submit" type="submit"><Search size={21} /><span>{t.searchAction}</span></button>
        </form>
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
          <form onSubmit={submit} className="invite-form"><label className="sr-only" htmlFor="email">{t.emailPlaceholder}</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.emailPlaceholder} required /><button className="button" type="submit" disabled={!path || submitting}>{submitting ? (arabic ? "جارٍ الحفظ…" : "Saving…") : t.requestInvite}<Arrow size={18} /></button></form>
          {submitted && <p className="confirmation" role="status"><CheckCircle2 size={18} />{arabic ? "تم حفظ طلبك. بنكون على تواصل." : "Your request is saved. We’ll be in touch."}</p>}{submitError && <p className="workspace-error" role="alert">{submitError}</p>}<p className="prototype-note">{t.note}</p>
        </div>
      </section>

      <footer className="site-footer section-frame"><div><a className="brand" href="#top" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-logo.svg" alt="Kufuo" /></span></a><p>{t.footer}</p></div><nav><a href="/community-guidelines">{arabic ? "الأمان" : "Safety"}</a><a href="#community">{arabic ? "المجتمع" : "Community"}</a><a href="/privacy">{arabic ? "الخصوصية" : "Privacy"}</a><a href="/terms">{arabic ? "الشروط" : "Terms"}</a></nav><span>© 2026 Kufuo | كفو</span></footer>
    </main>
  );
}
