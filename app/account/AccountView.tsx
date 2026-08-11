"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  Languages,
  Lightbulb,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Save,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { MemberHeader } from "../_components/MemberHeader";
import { saveOwnProfile } from "../lib/kufuo/client";
import { normalizeLinkedinUrl, profileStrength } from "../lib/kufuo/profile";
import { emptyProfile, type FounderProfile } from "../lib/kufuo/types";

type Language = "en" | "ar";

const copy = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    signOut: "Sign out",
    kicker: "Your founder profile",
    role: "Product builder and aspiring founder",
    location: "Remote",
    availability: "10–15 hrs/week",
    language: "Arabic & English",
    verified: "Kufuo member profile",
    intro: "I turn promising problems into focused product experiments. I’m looking for a technical cofounder who values customer evidence, direct communication, and thoughtful execution.",
    edit: "Edit profile",
    cancel: "Cancel",
    save: "Save changes",
    saved: "Profile saved",
    about: "About",
    aboutBody: "I have experience shaping digital products, validating early ideas, and turning complex workflows into clear experiences. I’m especially interested in practical B2B products that solve measurable customer problems.",
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
      ["Product & UX", "Shaped digital products and service experiences for diverse users."],
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
    fields: { role: "Professional headline", location: "Location", availability: "Availability", intro: "Short introduction", about: "About you", linkedin: "LinkedIn profile (optional)" },
  },
  ar: {
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    kicker: "ملف المؤسس",
    role: "باني منتجات ومؤسس طموح",
    location: "عن بُعد",
    availability: "١٠–١٥ ساعة أسبوعيًا",
    language: "العربية والإنجليزية",
    verified: "ملف عضو في كفو",
    intro: "أحوّل المشكلات الواعدة إلى تجارب منتج مركزة. أبحث عن شريك مؤسس تقني يقدّر أدلة العملاء والتواصل المباشر والتنفيذ المتقن.",
    edit: "تعديل الملف",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    saved: "تم حفظ الملف",
    about: "نبذة",
    aboutBody: "لدي خبرة في تشكيل المنتجات الرقمية والتحقق من الأفكار المبكرة وتحويل العمليات المعقدة إلى تجارب واضحة. أهتم بمنتجات الأعمال العملية التي تحل مشكلة عميل قابلة للقياس.",
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
      ["المنتج والتجربة", "تشكيل منتجات رقمية وتجارب خدمات لمستخدمين متنوعين."],
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
    fields: { role: "العنوان المهني", location: "الموقع", availability: "التفرغ", intro: "مقدمة قصيرة", about: "نبذة عنك", linkedin: "رابط LinkedIn (اختياري)" },
  },
} as const;

type ProfileForm = {
  fullName: string;
  headline: string;
  city: string;
  availability: string;
  linkedinUrl: string;
  bio: string;
  skills: string;
  industries: string;
  languages: string;
  profileType: "idea" | "skill" | "both";
  lookingFor: string;
  startupStage: string;
  commitment: string;
  workingStyle: string;
  decisionStyle: string;
  equityApproach: string;
};

function profileToForm(profile: FounderProfile): ProfileForm {
  return {
    fullName: profile.full_name ?? "",
    headline: profile.headline ?? "",
    city: profile.city ?? "",
    availability: profile.availability ?? "",
    linkedinUrl: profile.linkedin_url ?? "",
    bio: profile.bio ?? "",
    skills: profile.skills.join(", "),
    industries: profile.industries.join(", "),
    languages: profile.languages.join(", "),
    profileType: profile.profile_type,
    lookingFor: profile.looking_for ?? "",
    startupStage: profile.startup_stage ?? "",
    commitment: profile.commitment ?? "",
    workingStyle: profile.working_style ?? "",
    decisionStyle: profile.decision_style ?? "",
    equityApproach: profile.equity_approach ?? "",
  };
}

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function AccountView({ userId, user, initialProfile }: { userId: string; user: { displayName: string; email: string }; initialProfile: FounderProfile | null; signOutHref: string }) {
  const startingProfile = initialProfile ?? emptyProfile(userId, user.displayName);
  const [language, setLanguage] = useState<Language>("en");
  const [editing, setEditing] = useState(!startingProfile.onboarding_complete);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(startingProfile);
  const arabic = language === "ar";
  const t = copy[language];
  const [details, setDetails] = useState<ProfileForm>(() => profileToForm(startingProfile));

  useEffect(() => {
    const stored = window.localStorage.getItem("kufuo:language");
    if (stored === "ar" || stored === "en") setLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
    window.localStorage.setItem("kufuo:language", language);
  }, [language, arabic]);

  function cancelEdit() {
    setDetails(profileToForm(profile));
    setEditing(false);
    setError("");
  }

  async function saveProfile() {
    setError("");
    const required = [details.fullName, details.headline, details.city, details.bio, details.skills, details.lookingFor, details.commitment];
    if (required.some((value) => !value.trim())) {
      setError(arabic ? "أكمل الحقول الأساسية قبل حفظ الملف." : "Complete the required founder fields before saving.");
      return;
    }
    const linkedinUrl = normalizeLinkedinUrl(details.linkedinUrl);
    if (details.linkedinUrl.trim() && !linkedinUrl) {
      setError(arabic ? "أدخل رابط LinkedIn صحيحًا." : "Enter a valid LinkedIn profile URL.");
      return;
    }
    setSaving(true);
    try {
      const skills = splitList(details.skills);
      const industries = splitList(details.industries);
      const languages = splitList(details.languages);
      const strength = profileStrength({ fullName: details.fullName, headline: details.headline, city: details.city, bio: details.bio, skills, industries, languages, lookingFor: details.lookingFor, commitment: details.commitment, startupStage: details.startupStage, workingStyle: details.workingStyle, decisionStyle: details.decisionStyle, equityApproach: details.equityApproach, linkedinUrl });
      const saved = await saveOwnProfile(userId, {
        full_name: details.fullName.trim(),
        headline: details.headline.trim(),
        role: details.headline.trim(),
        city: details.city.trim(),
        availability: details.availability.trim() || null,
        linkedin_url: linkedinUrl,
        bio: details.bio.trim(),
        skills,
        industries,
        languages,
        profile_type: details.profileType,
        looking_for: details.lookingFor.trim(),
        startup_stage: details.startupStage.trim() || null,
        commitment: details.commitment.trim(),
        working_style: details.workingStyle.trim() || null,
        decision_style: details.decisionStyle.trim() || null,
        equity_approach: details.equityApproach.trim() || null,
        onboarding_complete: true,
        profile_strength: strength,
        is_visible: profile.is_visible,
      });
      setProfile(saved);
      setEditing(false);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 3000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the profile.");
    } finally {
      setSaving(false);
    }
  }

  const input = (key: keyof ProfileForm, label: string, required = false, type = "text") => (
    <label className="member-field"><span>{label}{required ? " *" : ""}</span><input type={type} value={details[key]} onChange={(event) => setDetails({ ...details, [key]: event.target.value })} /></label>
  );

  const skills = splitList(details.skills);
  const industries = splitList(details.industries);
  const completion = profile.onboarding_complete ? profile.profile_strength : 20;
  const linkedinUrl = normalizeLinkedinUrl(details.linkedinUrl);

  return (
    <main className="member-profile-page" dir={arabic ? "rtl" : "ltr"}>
      <MemberHeader user={user} active="profile" avatarUrl={profile.avatar_url} language={language} onLanguageChange={setLanguage} />

      <section className="member-hero section-frame">
        <div className="member-avatar"><UserRound size={54} /></div>
        <div className="member-identity"><p className="kicker">{profile.onboarding_complete ? t.kicker : (arabic ? "ابدأ ملفك" : "Build your founder profile")}</p><span className="account-verified"><ShieldCheck size={16} />{t.verified}</span>{editing ? <div className="member-edit-grid">{input("fullName", arabic ? "الاسم" : "Full name", true)}{input("headline", t.fields.role, true)}<div className="member-linkedin-field">{input("linkedinUrl", t.fields.linkedin, false, "url")}</div></div> : <><h1>{details.fullName || user.displayName}</h1><h2>{details.headline || (arabic ? "أضف عنوانك المهني" : "Add your professional headline")}</h2>{linkedinUrl && <a className="member-linkedin-link" href={linkedinUrl} target="_blank" rel="noopener noreferrer"><FaLinkedin aria-hidden="true" />LinkedIn</a>}</>}<div className="member-meta"><span><MapPin size={16} />{details.city || t.location}</span><span><Clock3 size={16} />{details.availability || t.availability}</span><span><Languages size={16} />{details.languages || t.language}</span></div>{editing ? <div className="member-edit-grid">{input("city", t.fields.location, true)}{input("availability", t.fields.availability)}<label className="member-field"><span>{arabic ? "ما الذي تقدمه؟" : "What do you bring?"} *</span><select value={details.profileType} onChange={(event) => setDetails({ ...details, profileType: event.target.value as ProfileForm["profileType"] })}><option value="idea">{arabic ? "لدي فكرة" : "I bring an idea"}</option><option value="skill">{arabic ? "لدي مهارة" : "I bring a skill"}</option><option value="both">{arabic ? "الاثنان" : "Both"}</option></select></label></div> : <p className="member-intro">{details.bio}</p>}<div className="member-actions">{editing ? <><button className="button" type="button" onClick={saveProfile} disabled={saving}><Save size={17} />{saving ? (arabic ? "جارٍ الحفظ…" : "Saving…") : t.save}</button>{profile.onboarding_complete && <button className="button button-secondary" type="button" onClick={cancelEdit}>{t.cancel}</button>}</> : <button className="button" type="button" onClick={() => setEditing(true)}><Pencil size={17} />{t.edit}</button>}<a className="button button-secondary" href={`/profile/${userId}`}>{t.preview}<ChevronRight size={17} /></a></div>{error && <p className="member-save-error" role="alert">{error}</p>}{savedNotice && <p className="member-save-notice" role="status"><Check size={16} />{t.saved}</p>}</div>
      </section>

      <div className="member-content section-frame">
        <div className="member-main">
          <section className="member-section"><div className="member-section-title"><span className="side-icon"><UserRound size={20} /></span><h2>{t.about}</h2></div>{editing ? <textarea aria-label={t.fields.about} value={details.bio} onChange={(event) => setDetails({ ...details, bio: event.target.value })} rows={6} placeholder={arabic ? "عرّف عن خبرتك وما الذي تريد بناءه…" : "Describe your experience and what you want to build…"} /> : <p>{details.bio}</p>}</section>
          <section className="member-two-column"><article><div className="member-section-title"><span className="side-icon"><Target size={20} /></span><h2>{t.skills}</h2></div>{editing ? input("skills", arabic ? "المهارات، افصل بينها بفاصلة" : "Skills, separated by commas", true) : <div className="member-tag-list">{skills.map((item) => <span key={item}>{item}</span>)}</div>}</article><article><div className="member-section-title"><span className="side-icon"><Lightbulb size={20} /></span><h2>{t.interests}</h2></div>{editing ? input("industries", arabic ? "القطاعات، افصل بينها بفاصلة" : "Sectors, separated by commas") : <div className="member-tag-list">{industries.map((item) => <span key={item}>{item}</span>)}</div>}</article></section>
          <section className="member-section"><div className="member-section-title"><span className="side-icon inverse"><BriefcaseBusiness size={20} /></span><h2>{t.preferences}</h2></div>{editing ? <div className="member-edit-grid">{input("lookingFor", arabic ? "أبحث عن" : "Looking for", true)}{input("startupStage", arabic ? "مرحلة المشروع" : "Startup stage")}{input("commitment", arabic ? "نوع الالتزام" : "Commitment", true)}{input("workingStyle", arabic ? "أسلوب العمل" : "Working style")}{input("decisionStyle", arabic ? "أسلوب اتخاذ القرار" : "Decision style")}{input("equityApproach", arabic ? "نهج الحصص" : "Equity approach")}{input("languages", arabic ? "اللغات" : "Languages")}</div> : <dl className="member-preferences">{[[arabic ? "أبحث عن" : "Looking for", details.lookingFor], [arabic ? "المرحلة" : "Stage", details.startupStage], [arabic ? "الالتزام" : "Commitment", details.commitment], [arabic ? "أسلوب العمل" : "Working style", details.workingStyle], [arabic ? "أسلوب القرار" : "Decision style", details.decisionStyle], [arabic ? "نهج الحصص" : "Equity approach", details.equityApproach]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}</dl>}</section>
        </div>

        <aside className="member-sidebar">
          <section className="member-side-card"><div className="member-side-heading"><Target size={21} /><span>{t.strength}</span></div><strong>{completion}%</strong><div className="member-progress"><span style={{ width: `${completion}%` }} /></div><p>{t.strengthBody}</p><small>{profile.onboarding_complete ? (arabic ? "ملفك ظاهر للمجتمع" : "Your profile is discoverable") : (arabic ? "أكمل الحقول الأساسية للظهور" : "Complete the required fields to be discovered")}</small><button className="button button-small" type="button" onClick={() => setEditing(true)}>{t.edit}<Pencil size={15} /></button></section>
          <section className="member-side-card"><div className="member-side-heading"><LockKeyhole size={21} /><span>{t.account}</span></div><dl><div><dt><Mail size={16} />{t.email}</dt><dd>{user.email}</dd></div><div><dt><ShieldCheck size={16} />{t.authentication}</dt><dd>{t.authValue}</dd></div><div><dt><LockKeyhole size={16} />{t.privacy}</dt><dd>{t.privacyValue}</dd></div></dl><p className="member-secure-note">{t.secure}</p></section>
        </aside>
      </div>
    </main>
  );
}
