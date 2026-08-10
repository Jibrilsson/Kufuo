"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Languages,
  Lightbulb,
  LockKeyhole,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { saveOwnProfile } from "../lib/kufuo/client";
import { normalizeLinkedinUrl, profileStrength } from "../lib/kufuo/profile";
import { emptyProfile, type FounderProfile, type Language } from "../lib/kufuo/types";

type FormState = {
  fullName: string;
  headline: string;
  city: string;
  availability: string;
  linkedinUrl: string;
  profileType: "idea" | "skill" | "both";
  bio: string;
  skills: string;
  industries: string;
  languages: string;
  lookingFor: string;
  startupStage: string;
  commitment: string;
  workingStyle: string;
  decisionStyle: string;
  equityApproach: string;
  isVisible: boolean;
};

type FieldKey = keyof FormState;
type FieldErrors = Partial<Record<FieldKey, string>>;

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

function toForm(profile: FounderProfile): FormState {
  return {
    fullName: profile.full_name ?? "",
    headline: profile.headline ?? "",
    city: profile.city ?? "",
    availability: profile.availability ?? "",
    linkedinUrl: profile.linkedin_url ?? "",
    profileType: profile.profile_type,
    bio: profile.bio ?? "",
    skills: profile.skills.join(", "),
    industries: profile.industries.join(", "),
    languages: profile.languages.join(", "),
    lookingFor: profile.looking_for ?? "",
    startupStage: profile.startup_stage ?? "",
    commitment: profile.commitment ?? "",
    workingStyle: profile.working_style ?? "",
    decisionStyle: profile.decision_style ?? "",
    equityApproach: profile.equity_approach ?? "",
    isVisible: profile.is_visible,
  };
}

const copy = {
  en: {
    eyebrow: "YOUR FOUNDER PROFILE",
    title: "Help the right person understand how you build.",
    intro: "Five focused steps. Your answers save as you go, and you review everything before your profile becomes visible.",
    steps: ["Your intent", "Professional identity", "What you bring", "Your cofounder", "Review"],
    stepTitles: [
      "What brings you to Kufuo?",
      "Introduce the builder behind the profile.",
      "Show what you can contribute.",
      "Describe the person and partnership you need.",
      "Review what other members will see.",
    ],
    stepBodies: [
      "This changes the questions and recommendations we show you.",
      "Keep it concise and factual. You can refine it later.",
      "Specific evidence builds more trust than broad titles.",
      "Compatibility depends on expectations as much as skills.",
      "Nothing is published until you confirm below.",
    ],
    back: "Back",
    continue: "Save and continue",
    finish: "Publish my profile",
    saved: "Saved",
    saving: "Saving…",
    saveError: "We could not save your progress. Check your connection and try again.",
    privacy: "You control what appears in your public profile.",
  },
  ar: {
    eyebrow: "ملفك كمؤسس",
    title: "خلّ الشخص المناسب يفهم كيف تبني وتشتغل.",
    intro: "خمس خطوات مركّزة. نحفظ إجاباتك أولًا بأول، وتراجع كل شيء قبل ظهور ملفك.",
    steps: ["هدفك", "هويتك المهنية", "ما تقدمه", "شريكك المناسب", "المراجعة"],
    stepTitles: [
      "وش جابك إلى كفو؟",
      "عرّف بالشخص خلف الملف.",
      "وضّح القيمة اللي تقدر تقدمها.",
      "صف الشريك والعلاقة اللي تبحث عنها.",
      "راجع المعلومات اللي بيشوفها الأعضاء.",
    ],
    stepBodies: [
      "إجابتك تغيّر الأسئلة والترشيحات اللي نعرضها لك.",
      "خلّها مختصرة ودقيقة، وتقدر تعدلها بعدين.",
      "الخبرة المحددة تبني ثقة أكثر من المسميات العامة.",
      "التوافق يعتمد على التوقعات مثل ما يعتمد على المهارات.",
      "ما ننشر أي شيء إلا بعد تأكيدك.",
    ],
    back: "رجوع",
    continue: "احفظ وتابع",
    finish: "انشر ملفي",
    saved: "تم الحفظ",
    saving: "جارٍ الحفظ…",
    saveError: "ما قدرنا نحفظ تقدمك. تأكد من الاتصال وحاول مرة ثانية.",
    privacy: "أنت تتحكم بالمعلومات التي تظهر في ملفك العام.",
  },
} as const;

export function OnboardingView({ userId, user, initialProfile }: {
  userId: string;
  user: { displayName: string; email: string };
  initialProfile: FounderProfile | null;
}) {
  const startingProfile = initialProfile ?? emptyProfile(userId, user.displayName);
  const [language, setLanguage] = useState<Language>("en");
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<FormState>(() => toForm(startingProfile));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hydrated, setHydrated] = useState(false);
  const initialRender = useRef(true);
  const arabic = language === "ar";
  const t = copy[language];
  const directionIcon = arabic ? ArrowRight : ArrowLeft;
  const forwardIcon = arabic ? ArrowLeft : ArrowRight;
  const progress = step * 20;
  const normalizedLinkedin = normalizeLinkedinUrl(details.linkedinUrl);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("kufuo:language");
    const storedStep = Number(window.localStorage.getItem(`kufuo:onboarding-step:${userId}`));
    const timer = window.setTimeout(() => {
      if (storedLanguage === "ar" || storedLanguage === "en") setLanguage(storedLanguage);
      if (storedStep >= 1 && storedStep <= 5) setStep(storedStep);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
    if (hydrated) window.localStorage.setItem("kufuo:language", language);
  }, [language, arabic, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(`kufuo:onboarding-step:${userId}`, String(step));
  }, [step, hydrated, userId]);

  const payload = useMemo(() => {
    const skills = splitList(details.skills);
    const industries = splitList(details.industries);
    const languages = splitList(details.languages);
    return {
      full_name: details.fullName.trim(),
      headline: details.headline.trim(),
      role: details.headline.trim(),
      city: details.city.trim(),
      availability: details.availability.trim() || null,
      linkedin_url: normalizedLinkedin,
      profile_type: details.profileType,
      bio: details.bio.trim(),
      skills,
      industries,
      languages,
      looking_for: details.lookingFor.trim(),
      startup_stage: details.startupStage.trim() || null,
      commitment: details.commitment.trim(),
      working_style: details.workingStyle.trim() || null,
      decision_style: details.decisionStyle.trim() || null,
      equity_approach: details.equityApproach.trim() || null,
      is_visible: details.isVisible,
      profile_strength: profileStrength({
        fullName: details.fullName,
        headline: details.headline,
        city: details.city,
        bio: details.bio,
        skills,
        industries,
        languages,
        lookingFor: details.lookingFor,
        commitment: details.commitment,
        startupStage: details.startupStage,
        workingStyle: details.workingStyle,
        decisionStyle: details.decisionStyle,
        equityApproach: details.equityApproach,
        linkedinUrl: normalizedLinkedin,
      }),
    };
  }, [details, normalizedLinkedin]);

  useEffect(() => {
    if (!hydrated) return;
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    if (details.linkedinUrl.trim() && !normalizedLinkedin) return;
    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        await saveOwnProfile(userId, { ...payload, onboarding_complete: false });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [details, hydrated, normalizedLinkedin, payload, userId]);

  function update<K extends FieldKey>(key: K, value: FormState[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveState("idle");
  }

  function validationFor(targetStep: number) {
    const nextErrors: FieldErrors = {};
    const required = arabic ? "هذا الحقل مطلوب" : "This field is required";
    if (targetStep === 2) {
      if (!details.fullName.trim()) nextErrors.fullName = required;
      if (!details.headline.trim()) nextErrors.headline = required;
      if (!details.city.trim()) nextErrors.city = required;
      if (!details.availability.trim()) nextErrors.availability = required;
      if (details.linkedinUrl.trim() && !normalizedLinkedin) nextErrors.linkedinUrl = arabic ? "أدخل رابط LinkedIn صحيحًا" : "Enter a valid LinkedIn URL";
    }
    if (targetStep === 3) {
      if (details.bio.trim().length < 50) nextErrors.bio = arabic ? "اكتب 50 حرفًا على الأقل" : "Write at least 50 characters";
      if (splitList(details.skills).length < 2) nextErrors.skills = arabic ? "أضف مهارتين على الأقل" : "Add at least two skills";
      if (!splitList(details.industries).length) nextErrors.industries = required;
      if (!splitList(details.languages).length) nextErrors.languages = required;
    }
    if (targetStep === 4) {
      if (!details.lookingFor.trim()) nextErrors.lookingFor = required;
      if (!details.startupStage.trim()) nextErrors.startupStage = required;
      if (!details.commitment.trim()) nextErrors.commitment = required;
      if (!details.workingStyle.trim()) nextErrors.workingStyle = required;
    }
    return nextErrors;
  }

  async function next() {
    const nextErrors = validationFor(step);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setSaveState("saving");
    try {
      await saveOwnProfile(userId, { ...payload, onboarding_complete: false });
      setSaveState("saved");
      setStep((current) => Math.min(5, current + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSaveState("error");
    }
  }

  async function finish() {
    const allErrors = { ...validationFor(2), ...validationFor(3), ...validationFor(4) };
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      const firstStep = [2, 3, 4].find((candidate) => Object.keys(validationFor(candidate)).length) ?? 2;
      setStep(firstStep);
      return;
    }
    setSaveState("saving");
    try {
      await saveOwnProfile(userId, { ...payload, onboarding_complete: true });
      window.localStorage.removeItem(`kufuo:onboarding-step:${userId}`);
      window.location.assign("/dashboard?welcome=1");
    } catch {
      setSaveState("error");
    }
  }

  const BackIcon = directionIcon;
  const ForwardIcon = forwardIcon;

  return (
    <main className="onboarding-page" dir={arabic ? "rtl" : "ltr"}>
      <header className="onboarding-topbar">
        <a href="/" className="onboarding-brand" aria-label="Kufuo home"><img src="/kufuo-logo.svg" alt="Kufuo" /></a>
        <div className="onboarding-top-actions">
          <span className={`onboarding-save-state is-${saveState}`} role="status">
            {saveState === "saving" ? <><Save size={16} />{t.saving}</> : saveState === "saved" ? <><Check size={16} />{t.saved}</> : saveState === "error" ? t.saveError : null}
          </span>
          <button className="language-button" type="button" onClick={() => setLanguage(arabic ? "en" : "ar")}><Languages size={18} />{arabic ? "English" : "العربية"}</button>
        </div>
      </header>

      <div className="onboarding-progress" aria-label={arabic ? `الخطوة ${step} من 5` : `Step ${step} of 5`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="onboarding-layout">
        <aside className="onboarding-rail" aria-label={arabic ? "خطوات إعداد الملف" : "Profile setup steps"}>
          <p className="kicker">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <ol>
            {t.steps.map((label, index) => {
              const number = index + 1;
              return <li className={number === step ? "is-current" : number < step ? "is-complete" : ""} key={label}><span>{number < step ? <Check size={16} /> : number}</span><b>{label}</b></li>;
            })}
          </ol>
          <div className="onboarding-trust"><ShieldCheck size={21} /><span>{t.privacy}</span></div>
        </aside>

        <section className="onboarding-card" aria-live="polite">
          <div className="onboarding-card-heading">
            <span>{arabic ? `الخطوة ${step} من 5` : `Step ${step} of 5`}</span>
            <h2>{t.stepTitles[step - 1]}</h2>
            <p>{t.stepBodies[step - 1]}</p>
          </div>

          {step === 1 && <IntentStep details={details} update={update} arabic={arabic} />}
          {step === 2 && <IdentityStep details={details} update={update} errors={errors} arabic={arabic} />}
          {step === 3 && <ContributionStep details={details} update={update} errors={errors} arabic={arabic} />}
          {step === 4 && <PreferencesStep details={details} update={update} errors={errors} arabic={arabic} />}
          {step === 5 && <ReviewStep details={details} update={update} arabic={arabic} strength={payload.profile_strength} />}

          {saveState === "error" && <p className="onboarding-error" role="alert">{t.saveError}</p>}
          <footer className="onboarding-footer">
            {step > 1 ? <button className="button button-secondary" type="button" onClick={() => setStep((current) => current - 1)}><BackIcon size={18} />{t.back}</button> : <span />}
            {step < 5
              ? <button className="button" type="button" onClick={next} disabled={saveState === "saving"}>{t.continue}<ForwardIcon size={18} /></button>
              : <button className="button" type="button" onClick={finish} disabled={saveState === "saving"}><Sparkles size={18} />{t.finish}</button>}
          </footer>
        </section>
      </div>
    </main>
  );
}

function IntentStep({ details, update, arabic }: StepProps) {
  const options = [
    { value: "idea", icon: Lightbulb, en: "I bring an idea", ar: "عندي فكرة", enBody: "I need people with complementary skills to shape and build it.", arBody: "أبحث عن أشخاص بمهارات مكملة نطوّر الفكرة ونبنيها سوا." },
    { value: "skill", icon: BriefcaseBusiness, en: "I bring a skill", ar: "عندي مهارة", enBody: "I want to join a credible idea where my experience matters.", arBody: "أبحث عن فكرة جادة تكون خبرتي فيها مؤثرة." },
    { value: "both", icon: Target, en: "A bit of both", ar: "الاثنان", enBody: "I have direction and skills, and I am open to the right partnership.", arBody: "عندي توجه ومهارات، ومنفتح على الشراكة المناسبة." },
  ] as const;
  return <div className="onboarding-choice-grid">{options.map(({ value, icon: Icon, en, ar, enBody, arBody }) => <button className={details.profileType === value ? "is-selected" : ""} type="button" onClick={() => update("profileType", value)} key={value}><span><Icon size={24} /></span><strong>{arabic ? ar : en}</strong><small>{arabic ? arBody : enBody}</small><CheckCircle2 className="choice-check" size={20} /></button>)}</div>;
}

type StepProps = { details: FormState; update: <K extends FieldKey>(key: K, value: FormState[K]) => void; arabic: boolean };
type ErrorStepProps = StepProps & { errors: FieldErrors };

function IdentityStep({ details, update, errors, arabic }: ErrorStepProps) {
  return <div className="onboarding-fields two-columns">
    <Field label={arabic ? "الاسم" : "Full name"} error={errors.fullName}><input autoComplete="name" aria-invalid={Boolean(errors.fullName)} value={details.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field>
    <Field label={arabic ? "العنوان المهني" : "Professional headline"} hint={arabic ? "مثال: مهندس برمجيات ومنتجات B2B" : "Example: Software engineer building B2B products"} error={errors.headline}><input aria-invalid={Boolean(errors.headline)} value={details.headline} onChange={(event) => update("headline", event.target.value)} /></Field>
    <Field label={arabic ? "الموقع" : "Location"} error={errors.city}><div className="field-with-icon"><MapPin size={18} /><input aria-invalid={Boolean(errors.city)} value={details.city} onChange={(event) => update("city", event.target.value)} placeholder={arabic ? "المدينة أو عن بُعد" : "City or remote"} /></div></Field>
    <Field label={arabic ? "الوقت المتاح" : "Availability"} error={errors.availability}><div className="field-with-icon"><Clock3 size={18} /><input aria-invalid={Boolean(errors.availability)} value={details.availability} onChange={(event) => update("availability", event.target.value)} placeholder={arabic ? "مثال: ١٠ ساعات أسبوعيًا" : "Example: 10 hours per week"} /></div></Field>
    <Field className="span-two" label={arabic ? "رابط LinkedIn (اختياري)" : "LinkedIn profile (optional)"} hint={arabic ? "يظهر تحت اسمك ويساعد الأعضاء على فهم خلفيتك." : "Shown beneath your name to help members understand your background."} error={errors.linkedinUrl}><div className="field-with-icon"><FaLinkedin aria-hidden="true" /><input type="url" inputMode="url" aria-invalid={Boolean(errors.linkedinUrl)} value={details.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} placeholder="linkedin.com/in/your-name" /></div></Field>
  </div>;
}

function ContributionStep({ details, update, errors, arabic }: ErrorStepProps) {
  return <div className="onboarding-fields">
    <Field label={arabic ? "نبذة مهنية" : "Professional summary"} hint={arabic ? "اذكر خبرتك وما تريد بناءه ودورك الحقيقي فيه." : "Describe your experience, what you want to build, and the role you play."} error={errors.bio}><textarea rows={5} aria-invalid={Boolean(errors.bio)} value={details.bio} onChange={(event) => update("bio", event.target.value)} /></Field>
    <Field label={arabic ? "أهم مهاراتك" : "Your strongest skills"} hint={arabic ? "افصل بينها بفاصلة، وأضف مهارتين على الأقل." : "Separate with commas and add at least two."} error={errors.skills}><input aria-invalid={Boolean(errors.skills)} value={details.skills} onChange={(event) => update("skills", event.target.value)} placeholder={arabic ? "المنتج، البرمجة، المبيعات" : "Product, engineering, sales"} /></Field>
    <div className="two-columns">
      <Field label={arabic ? "القطاعات" : "Sectors"} error={errors.industries}><input aria-invalid={Boolean(errors.industries)} value={details.industries} onChange={(event) => update("industries", event.target.value)} placeholder={arabic ? "تقنية مالية، تجارة" : "Fintech, commerce"} /></Field>
      <Field label={arabic ? "اللغات" : "Languages"} error={errors.languages}><input aria-invalid={Boolean(errors.languages)} value={details.languages} onChange={(event) => update("languages", event.target.value)} placeholder={arabic ? "العربية، الإنجليزية" : "Arabic, English"} /></Field>
    </div>
  </div>;
}

function PreferencesStep({ details, update, errors, arabic }: ErrorStepProps) {
  return <div className="onboarding-fields two-columns">
    <Field label={arabic ? "الدور الذي تبحث عنه" : "Role you are looking for"} error={errors.lookingFor}><input aria-invalid={Boolean(errors.lookingFor)} value={details.lookingFor} onChange={(event) => update("lookingFor", event.target.value)} placeholder={arabic ? "مثال: شريك تقني" : "Example: Technical cofounder"} /></Field>
    <Field label={arabic ? "مرحلة المشروع" : "Startup stage"} error={errors.startupStage}><select aria-invalid={Boolean(errors.startupStage)} value={details.startupStage} onChange={(event) => update("startupStage", event.target.value)}><option value="">{arabic ? "اختر المرحلة" : "Choose a stage"}</option><option value="Exploring">{arabic ? "استكشاف" : "Exploring"}</option><option value="Validating">{arabic ? "اختبار المشكلة" : "Validating"}</option><option value="MVP">MVP</option><option value="Early revenue">{arabic ? "إيرادات أولية" : "Early revenue"}</option><option value="Growing">{arabic ? "نمو" : "Growing"}</option></select></Field>
    <Field label={arabic ? "الالتزام المتوقع" : "Expected commitment"} error={errors.commitment}><select aria-invalid={Boolean(errors.commitment)} value={details.commitment} onChange={(event) => update("commitment", event.target.value)}><option value="">{arabic ? "اختر الالتزام" : "Choose commitment"}</option><option value="5–10 hrs/week">5–10 hrs/week</option><option value="10–20 hrs/week">10–20 hrs/week</option><option value="Part-time">{arabic ? "دوام جزئي" : "Part-time"}</option><option value="Full-time">{arabic ? "تفرغ كامل" : "Full-time"}</option></select></Field>
    <Field label={arabic ? "أسلوب العمل" : "Working style"} error={errors.workingStyle}><select aria-invalid={Boolean(errors.workingStyle)} value={details.workingStyle} onChange={(event) => update("workingStyle", event.target.value)}><option value="">{arabic ? "اختر الأسلوب" : "Choose a style"}</option><option value="Async-first">{arabic ? "غير متزامن أولًا" : "Async-first"}</option><option value="Regular collaboration">{arabic ? "تعاون واجتماعات منتظمة" : "Regular collaboration"}</option><option value="Hands-on together">{arabic ? "تنفيذ مشترك يومي" : "Hands-on together"}</option></select></Field>
    <Field label={arabic ? "طريقة اتخاذ القرار" : "Decision style"}><input value={details.decisionStyle} onChange={(event) => update("decisionStyle", event.target.value)} placeholder={arabic ? "مثال: بالنقاش ثم مسؤول واضح" : "Example: Discuss, then one clear owner"} /></Field>
    <Field label={arabic ? "نظرتك للحصص" : "Equity approach"}><input value={details.equityApproach} onChange={(event) => update("equityApproach", event.target.value)} placeholder={arabic ? "مثال: حسب الدور والالتزام" : "Example: Based on role and commitment"} /></Field>
  </div>;
}

function ReviewStep({ details, update, arabic, strength }: StepProps & { strength: number }) {
  const linkedin = normalizeLinkedinUrl(details.linkedinUrl);
  const rows = [
    [arabic ? "ما تقدمه" : "You bring", details.profileType === "idea" ? (arabic ? "فكرة" : "An idea") : details.profileType === "skill" ? (arabic ? "مهارة" : "A skill") : (arabic ? "فكرة ومهارة" : "An idea and a skill")],
    [arabic ? "الموقع" : "Location", details.city],
    [arabic ? "التفرغ" : "Availability", details.availability],
    [arabic ? "تبحث عن" : "Looking for", details.lookingFor],
    [arabic ? "المرحلة" : "Stage", details.startupStage],
    [arabic ? "الالتزام" : "Commitment", details.commitment],
  ];
  return <div className="onboarding-review">
    <article className="review-profile-card">
      <div className="review-avatar"><UserRound size={42} /></div>
      <div><span className="review-strength">{strength}% {arabic ? "مكتمل" : "complete"}</span><h3>{details.fullName}</h3><p>{details.headline}</p>{linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin aria-hidden="true" />LinkedIn</a>}</div>
    </article>
    <p className="review-bio">{details.bio}</p>
    <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="review-tags">{splitList(details.skills).map((skill) => <span key={skill}>{skill}</span>)}</div>
    <label className="review-visibility"><input type="checkbox" checked={details.isVisible} onChange={(event) => update("isVisible", event.target.checked)} /><span><LockKeyhole size={20} /><b>{arabic ? "إظهار ملفي للأعضاء بعد النشر" : "Make my profile discoverable after publishing"}</b><small>{arabic ? "بريدك ورسائلك وبيانات دخولك تبقى خاصة دائمًا." : "Your email, messages, and sign-in details always stay private."}</small></span></label>
  </div>;
}

function Field({ label, hint, error, className = "", children }: { label: string; hint?: string; error?: string; className?: string; children: ReactNode }) {
  return <label className={`onboarding-field ${className}`}><span>{label}</span>{children}{hint && !error ? <small>{hint}</small> : null}{error ? <small className="field-error" role="alert">{error}</small> : null}</label>;
}
