"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { SPECIALTIES, type Expert } from "../lib/kufuo/types";
import { Field, Notice, errorText } from "../_ui/bits";
import { useT } from "../_ui/lang";

const LANGUAGE_OPTIONS = [
  ["ar", "Arabic", "العربية"],
  ["en", "English", "الإنجليزية"],
  ["fr", "French", "الفرنسية"],
] as const;

export function ApplyView({ userId, defaultName, existing }: { userId: string; defaultName: string; existing: Expert | null }) {
  const { t, arabic } = useT();
  const [form, setForm] = useState({
    full_name: existing?.full_name ?? defaultName,
    headline: existing?.headline ?? "",
    bio: existing?.bio ?? "",
    country_code: existing?.country_code ?? "",
    timezone: existing?.timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : ""),
    primary_specialty: existing?.primary_specialty ?? "",
    years_experience: existing?.years_experience?.toString() ?? "",
    linkedin_url: existing?.linkedin_url ?? "",
    weekly_hours_available: existing?.weekly_hours_available?.toString() ?? "",
    availability_notes: existing?.availability_notes ?? "",
  });
  const [languages, setLanguages] = useState<string[]>(existing?.languages?.length ? existing.languages : ["ar"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const isNew = !existing;
  const locked = existing && !["draft", "submitted"].includes(existing.status);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleLanguage(code: string) {
    setLanguages((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  function normalizedLinkedin() {
    const value = form.linkedin_url.trim();
    if (!value) return null;
    const url = /^https?:\/\//i.test(value) ? value.replace(/^http:/i, "https:") : `https://${value}`;
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return host === "linkedin.com" || host.endsWith(".linkedin.com") ? url : "invalid";
    } catch {
      return "invalid";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const linkedin = normalizedLinkedin();
    if (linkedin === "invalid") return setError(t("Enter a valid LinkedIn profile link.", "أدخل رابط LinkedIn صحيح."));
    if (!form.primary_specialty) return setError(t("Choose your main specialty.", "اختر تخصصك الأساسي."));
    if (!languages.length) return setError(t("Choose at least one working language.", "اختر لغة عمل وحدة على الأقل."));

    setBusy(true);
    const row = {
      full_name: form.full_name.trim(),
      headline: form.headline.trim() || null,
      bio: form.bio.trim() || null,
      country_code: form.country_code.trim().toUpperCase() || null,
      timezone: form.timezone.trim() || null,
      languages,
      primary_specialty: form.primary_specialty,
      specialties: [form.primary_specialty],
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      linkedin_url: linkedin,
      weekly_hours_available: form.weekly_hours_available ? Number(form.weekly_hours_available) : null,
      availability_notes: form.availability_notes.trim() || null,
    };
    const supabase = createClient();
    const result = isNew
      ? await supabase.from("experts").insert({ id: userId, ...row, status: "submitted" })
      : await supabase.from("experts").update(existing?.status === "draft" ? { ...row, status: "submitted" } : row).eq("id", userId);
    setBusy(false);
    if (result.error) return setError(errorText(result.error));
    if (isNew) window.location.assign("/expert");
    else setSaved(true);
  }

  return (
    <div className="kx-narrow">
      <p className="kx-kicker">{isNew ? t("Expert application", "طلب الانضمام كخبير") : t("Your expert profile", "ملفك كخبير")}</p>
      <h1 className="kx-title">{isNew ? t("Tell us about your expertise", "عرّفنا على خبرتك") : t("Keep your profile current", "حدّث ملفك")}</h1>
      <p className="kx-lead">
        {t(
          "After you apply, you'll get an invitation to a short AI interview. A person on the Kufuo team reviews every application; the AI never accepts or rejects anyone.",
          "بعد ما تقدّم، توصلك دعوة لمقابلة قصيرة مع المحاور الذكي. شخص من فريق كفو يراجع كل طلب، والذكاء الاصطناعي ما يقبل ولا يرفض أحد."
        )}
      </p>
      {locked ? <Notice>{t("Your application is being processed. You can still update your details.", "طلبك قيد المعالجة، وتقدر تحدّث بياناتك.")}</Notice> : null}
      <form className="kx-card kx-form" onSubmit={submit}>
        <div className="kx-grid-2">
          <Field label={t("Full name", "الاسم الكامل")}>
            <input required minLength={2} maxLength={120} value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
          </Field>
          <Field label={t("Main specialty", "التخصص الأساسي")}>
            <select required value={form.primary_specialty} onChange={(e) => update("primary_specialty", e.target.value)}>
              <option value="">{t("Choose…", "اختر…")}</option>
              {SPECIALTIES.map(([value, en, ar]) => <option key={value} value={value}>{arabic ? ar : en}</option>)}
            </select>
          </Field>
          <Field label={t("Headline", "المسمى المهني")} hint={t("e.g. Corporate lawyer, 12 years in GCC contracts", "مثال: محامي شركات، ١٢ سنة في عقود الخليج")} wide>
            <input maxLength={160} value={form.headline} onChange={(e) => update("headline", e.target.value)} />
          </Field>
          <Field label={t("Years of experience", "سنوات الخبرة")}>
            <input type="number" min={0} max={60} value={form.years_experience} onChange={(e) => update("years_experience", e.target.value)} />
          </Field>
          <Field label={t("Country (2-letter code)", "الدولة (رمز من حرفين)")} hint={t("e.g. SA, EG, JO, MA", "مثال: SA، EG، JO، MA")}>
            <input maxLength={2} value={form.country_code} onChange={(e) => update("country_code", e.target.value)} />
          </Field>
          <Field label={t("Time zone", "المنطقة الزمنية")}>
            <input value={form.timezone} onChange={(e) => update("timezone", e.target.value)} />
          </Field>
          <Field label={t("Hours available per week", "الساعات المتاحة أسبوعيًا")}>
            <input type="number" min={0} max={80} value={form.weekly_hours_available} onChange={(e) => update("weekly_hours_available", e.target.value)} />
          </Field>
          <Field label={t("LinkedIn profile (optional)", "رابط LinkedIn (اختياري)")} wide>
            <input inputMode="url" placeholder="linkedin.com/in/your-name" value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} />
          </Field>
          <fieldset className="kx-field kx-field-wide">
            <span>{t("Working languages", "لغات العمل")}</span>
            <div className="kx-chips">
              {LANGUAGE_OPTIONS.map(([code, en, ar]) => (
                <button type="button" key={code} className={languages.includes(code) ? "is-on" : ""} aria-pressed={languages.includes(code)} onClick={() => toggleLanguage(code)}>
                  {arabic ? ar : en}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label={t("Experience summary", "ملخص خبرتك")} hint={t("What you've done, for whom, and what you're best at.", "وش سويت، ولمين، ووش أقوى شي عندك.")} wide>
            <textarea rows={6} maxLength={3000} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </Field>
          <Field label={t("Availability notes", "ملاحظات عن وقتك")} hint={t("e.g. evenings Gulf time, not Fridays", "مثال: المساء بتوقيت الخليج، ما عدا الجمعة")} wide>
            <input maxLength={500} value={form.availability_notes} onChange={(e) => update("availability_notes", e.target.value)} />
          </Field>
        </div>
        <Notice kind="error">{error}</Notice>
        {saved ? <Notice kind="success">{t("Saved.", "تم الحفظ.")}</Notice> : null}
        <div className="kx-actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? t("Saving…", "جاري الحفظ…") : isNew ? t("Submit application", "أرسل الطلب") : t("Save changes", "احفظ التغييرات")}
          </button>
        </div>
      </form>
    </div>
  );
}
