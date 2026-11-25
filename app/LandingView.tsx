"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Clock3, FileCheck2, Languages, MessagesSquare, ShieldCheck, UserRoundSearch } from "lucide-react";
import { createClient } from "./lib/supabase/client";
import { SPECIALTIES } from "./lib/kufuo/types";
import { Field, Notice, errorText } from "./_ui/bits";
import { LangProvider, useT } from "./_ui/lang";

export function LandingView() {
  return (
    <LangProvider>
      <Landing />
    </LangProvider>
  );
}

function Landing() {
  const { t, arabic, switchLanguage } = useT();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => setSignedIn(Boolean(data.user))).catch(() => setSignedIn(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => setSignedIn(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const applyHref = signedIn ? "/apply" : "/login?mode=signup&returnTo=%2Fapply";
  const hireHref = signedIn ? "/company/new" : "/login?mode=signup&returnTo=%2Fcompany%2Fnew";

  return (
    <div className="kx-landing" dir={arabic ? "rtl" : "ltr"}>
      <header className="kx-landing-bar">
        <a className="kx-brand" href="/" aria-label="Kufuo"><img src="/kufuo-logo.svg" alt="Kufuo" /></a>
        <nav className="kx-landing-nav">
          <a href="#experts">{t("For experts", "للخبراء")}</a>
          <a href="#companies">{t("For companies", "للشركات")}</a>
          <a href="#request">{t("Request an expert", "اطلب خبير")}</a>
        </nav>
        <div className="kx-topbar-end">
          <button type="button" className="kx-ghost" onClick={switchLanguage}><Languages size={17} />{arabic ? "English" : "العربية"}</button>
          {signedIn ? <a className="button button-small" href="/home">{t("My account", "حسابي")}</a> : <><a className="kx-ghost" href="/login?returnTo=%2Fhome">{t("Log in", "دخول")}</a><a className="button button-small" href="/login?mode=signup&returnTo=%2Fhome">{t("Sign up", "سجّل")}</a></>}
        </div>
      </header>

      <section className="kx-hero">
        <div className="kx-hero-copy">
          <p className="kx-kicker">{t("Arab expert network", "شبكة الخبراء العرب")}</p>
          <h1>{t("Vetted Arab expertise, by the hour.", "خبرة عربية موثّقة، بالساعة.")}</h1>
          <p className="kx-lead">
            {t(
              "Kufuo finds Arab professionals in every country, checks their expertise with an Arabic-speaking AI interviewer and a human reviewer, and lets companies book their time by the hour.",
              "كفو يستقطب المحترفين العرب من كل الدول، ويتحقق من خبرتهم بمحاور ذكي يتكلم عربي ومراجع بشري، ويخلي الشركات تحجز وقتهم بالساعة."
            )}
          </p>
          <div className="kx-hero-actions">
            <a className="button" href="#request">{t("Request an expert", "اطلب خبير")}<ArrowRight size={17} /></a>
            <a className="button button-secondary" href={applyHref}>{t("Apply as an expert", "قدّم كخبير")}</a>
          </div>
          <ul className="kx-hero-facts">
            <li><BadgeCheck size={17} />{t("Every expert interviewed and reviewed by a person", "كل خبير مقابَل ومراجَع من شخص")}</li>
            <li><Clock3 size={17} />{t("Pay only for hours you approve", "تدفع بس على الساعات اللي تعتمدها")}</li>
            <li><MessagesSquare size={17} />{t("Arabic, English, or both", "عربي، إنجليزي، أو الاثنين")}</li>
          </ul>
        </div>
        <aside className="kx-demo" aria-label={t("Example booking", "مثال على حجز")}>
          <span className="kx-demo-label">{t("Booking · this week", "حجز · هذا الأسبوع")}</span>
          <div className="kx-demo-person">
            <span className="kx-demo-avatar" aria-hidden="true">{t("LH", "ل")}</span>
            <div>
              <strong>{t("Senior contracts lawyer", "محامية عقود أولى")}</strong>
              <span>{t("Law · Arabic + English · vetted", "القانون · عربي وإنجليزي · موثّقة")}</span>
            </div>
          </div>
          <div className="kx-demo-rows">
            <div><span>{t("Mon · Model answer review", "الإثنين · مراجعة إجابات النموذج")}</span><b dir="ltr">3.0 h</b></div>
            <div><span>{t("Tue · Arabic legal rubric", "الثلاثاء · معايير تقييم قانونية")}</span><b dir="ltr">2.5 h</b></div>
            <div><span>{t("Wed · Scoring session", "الأربعاء · جلسة تقييم")}</span><b dir="ltr">4.0 h</b></div>
          </div>
          <div className="kx-demo-total">
            <span className="kx-demo-label">{t("Approved this week", "معتمد هذا الأسبوع")}</span>
            <strong dir="ltr">9.5 h</strong>
          </div>
          <span className="kx-demo-toast"><BadgeCheck size={16} />{t("Hours approved by your team", "اعتمد فريقك الساعات")}</span>
        </aside>
      </section>

      <section className="kx-band" id="companies">
        <div className="kx-band-head">
          <p className="kx-kicker">{t("For companies", "للشركات")}</p>
          <h2>{t("Expert time, without hiring.", "وقت الخبير، بدون توظيف.")}</h2>
          <p className="kx-muted">{t("AI labs evaluating Arabic models, tech companies entering Arab markets, research and consulting firms that need the right person fast.", "مختبرات ذكاء اصطناعي تقيّم نماذج عربية، وشركات تقنية تدخل السوق العربي، وشركات أبحاث واستشارات تحتاج الشخص المناسب بسرعة.")}</p>
        </div>
        <ol className="kx-flow">
          <li><UserRoundSearch size={22} /><strong>{t("Tell us the expertise", "قل لنا وش الخبرة")}</strong><span>{t("Specialty, language, hours per week.", "التخصص، واللغة، والساعات الأسبوعية.")}</span></li>
          <li><FileCheck2 size={22} /><strong>{t("Review proposed experts", "راجع الخبراء المرشحين")}</strong><span>{t("Profile, interview summary and hourly price.", "الملف، وملخص المقابلة، وسعر الساعة.")}</span></li>
          <li><Clock3 size={22} /><strong>{t("Book hours", "احجز الساعات")}</strong><span>{t("Set a weekly cap. The expert logs hours as they work.", "حدّد سقف أسبوعي، والخبير يسجّل ساعاته أول بأول.")}</span></li>
          <li><ShieldCheck size={22} /><strong>{t("Approve and pay", "اعتمد وادفع")}</strong><span>{t("You approve hours; we invoice and pay the expert.", "أنت تعتمد الساعات، وإحنا نفوتر ونصرف للخبير.")}</span></li>
        </ol>
        <a className="button" href={hireHref}>{t("Create a company account", "أنشئ حساب شركة")}</a>
      </section>

      <section className="kx-band kx-band-dark" id="experts">
        <div className="kx-band-head">
          <p className="kx-kicker">{t("For experts", "للخبراء")}</p>
          <h2>{t("Get paid for what you know.", "خذ مقابل اللي تعرفه.")}</h2>
          <p>{t("Lawyers, doctors, engineers, analysts, linguists. Wherever you are in the Arab world, join a vetted network and work with companies abroad, remotely, by the hour.", "محامين، أطباء، مهندسين، محللين، لغويين. وين ما كنت في العالم العربي، انضم لشبكة موثّقة واشتغل مع شركات برّا، عن بُعد، بالساعة.")}</p>
        </div>
        <ol className="kx-flow">
          <li><strong>1</strong><span>{t("Apply with your experience and availability.", "قدّم بخبرتك ووقتك المتاح.")}</span></li>
          <li><strong>2</strong><span>{t("A 5-minute AI interview in Arabic or English.", "مقابلة ٥ دقائق مع المحاور الذكي بالعربي أو الإنجليزي.")}</span></li>
          <li><strong>3</strong><span>{t("A person on our team reviews it. AI never decides.", "شخص من فريقنا يراجعها، والذكاء الاصطناعي ما يقرر.")}</span></li>
          <li><strong>4</strong><span>{t("Accept bookings, log hours, get paid.", "اقبل الحجوزات، سجّل ساعاتك، واستلم فلوسك.")}</span></li>
        </ol>
        <a className="button" href={applyHref}>{t("Apply as an expert", "قدّم كخبير")}</a>
      </section>

      <section className="kx-band" id="request">
        <div className="kx-band-head">
          <p className="kx-kicker">{t("Request an expert", "اطلب خبير")}</p>
          <h2>{t("Tell us what you need.", "قل لنا وش تحتاج.")}</h2>
          <p className="kx-muted">{t("No account needed. Someone from Kufuo will reply by email.", "ما تحتاج حساب. بيرد عليك أحد من كفو بالإيميل.")}</p>
        </div>
        <LeadForm />
      </section>

      <footer className="kx-footer">
        <span>© {new Date().getFullYear()} Kufuo · كفو</span>
        <nav>
          <a href="/privacy">{t("Privacy", "الخصوصية")}</a>
          <a href="/terms">{t("Terms", "الشروط")}</a>
          <a href="/community-guidelines">{t("Guidelines", "الإرشادات")}</a>
        </nav>
      </footer>
    </div>
  );
}

function LeadForm() {
  const { t, arabic } = useT();
  const [form, setForm] = useState({ contact_name: "", email: "", company_name: "", specialty: "", language: "ar", need: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    const { error: insertError } = await createClient().from("company_leads").insert({
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      company_name: form.company_name.trim(),
      specialty: form.specialty || null,
      language: form.language,
      need: form.need.trim(),
    });
    if (insertError) {
      setState("idle");
      return setError(errorText(insertError));
    }
    setState("sent");
  }

  if (state === "sent") {
    return <div className="kx-card"><h3>{t("Thanks, we've got it.", "وصلنا طلبك، شكرًا.")}</h3><p className="kx-muted">{t("We'll email you within two working days.", "بنرد عليك بالإيميل خلال يومين عمل.")}</p></div>;
  }

  return (
    <form className="kx-card kx-form" onSubmit={submit}>
      <div className="kx-grid-3">
        <Field label={t("Your name", "اسمك")}><input required minLength={2} maxLength={120} autoComplete="name" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
        <Field label={t("Work email", "إيميل العمل")}><input required type="email" maxLength={320} autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label={t("Company", "الشركة")}><input required minLength={2} maxLength={160} autoComplete="organization" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></Field>
        <Field label={t("Specialty", "التخصص")}>
          <select value={form.specialty} onChange={(e) => set("specialty", e.target.value)}>
            <option value="">{t("Not sure yet", "مو متأكد")}</option>
            {SPECIALTIES.map(([v, en, ar]) => <option key={v} value={v}>{arabic ? ar : en}</option>)}
          </select>
        </Field>
        <Field label={t("Language", "اللغة")}>
          <select value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="ar">{t("Arabic", "العربية")}</option>
            <option value="ar_en">{t("Arabic + English", "العربية والإنجليزية")}</option>
            <option value="en">{t("English", "الإنجليزية")}</option>
          </select>
        </Field>
      </div>
      <Field label={t("What do you need?", "وش تحتاج؟")} hint={t("The work, roughly how many hours, and by when.", "الشغل، وكم ساعة تقريبًا، ومتى.")}>
        <textarea required minLength={10} maxLength={2000} rows={4} value={form.need} onChange={(e) => set("need", e.target.value)} />
      </Field>
      <Notice kind="error">{error}</Notice>
      <div className="kx-actions"><button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? t("Sending…", "جاري الإرسال…") : t("Send request", "أرسل الطلب")}</button></div>
    </form>
  );
}
