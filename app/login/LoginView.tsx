"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Languages, LockKeyhole, Mail, Phone, ShieldCheck } from "lucide-react";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import { createClient } from "../lib/supabase/client";
import { authRedirectOrigin, supabasePublishableKey, supabaseUrl } from "../lib/supabase/config";

type Language = "en" | "ar";
type Channel = "email" | "phone";
type EmailMethod = "otp" | "password";
type AuthAvailability = { google: boolean; linkedin: boolean; phone: boolean; loading: boolean };

const copy = {
  en: {
    title: "Welcome to Kufuo",
    subtitle: "Meet people who are ready to build with the same level of intent.",
    signupTitle: "Create your Kufuo account",
    signupSubtitle: "Create a profile that makes your skills, goals, and working preferences clear.",
    google: "Continue with Google",
    linkedin: "Continue with LinkedIn",
    or: "or continue with",
    email: "Email",
    mobile: "Mobile",
    emailAddress: "Email address",
    phoneNumber: "Mobile number with country code",
    password: "Password",
    otp: "One-time code",
    emailOtp: "Email code",
    passwordMethod: "Password",
    send: "Send verification code",
    startRegistration: "Start registration",
    signIn: "Sign in",
    create: "Create account",
    verify: "Verify and continue",
    codeSent: "We sent a secure login email. Enter the code if shown, or use the sign-in link in the email.",
    newHere: "New to Kufuo?",
    haveAccount: "Already have an account?",
    createLink: "Create an account",
    signInLink: "Sign in instead",
    back: "Back to home",
    privacy: "Your contact details stay private. You decide when to share them.",
    terms: "By continuing, you agree to Kufuo’s Terms and Privacy Policy.",
    loading: "Please wait…",
    setupRequired: "Unavailable",
    providerNotice: "Some sign-in options are not available yet. Use any enabled option below.",
    callbackError: "We couldn’t complete that sign-in. Try again or choose another method.",
    cancelledLogin: "LinkedIn sign-in was cancelled. Try again when you’re ready, or choose another method.",
  },
  ar: {
    title: "حيّاك في كفو",
    subtitle: "تعرّف على أشخاص مستعدين يبنون بنفس الجدية.",
    signupTitle: "أنشئ حسابك في كفو",
    signupSubtitle: "أنشئ ملفًا يوضّح مهاراتك وأهدافك وطريقتك في العمل.",
    google: "المتابعة عبر Google",
    linkedin: "المتابعة عبر LinkedIn",
    or: "أو تابع باستخدام",
    email: "البريد الإلكتروني",
    mobile: "الجوال",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الجوال مع مفتاح الدولة",
    password: "كلمة المرور",
    otp: "رمز التحقق",
    emailOtp: "رمز البريد",
    passwordMethod: "كلمة المرور",
    send: "إرسال رمز التحقق",
    startRegistration: "ابدأ التسجيل",
    signIn: "تسجيل الدخول",
    create: "إنشاء حساب",
    verify: "تحقق وتابع",
    codeSent: "أرسلنا رسالة دخول آمنة. أدخل الرمز إن ظهر، أو استخدم رابط تسجيل الدخول في الرسالة.",
    newHere: "جديد في كفو؟",
    haveAccount: "لديك حساب بالفعل؟",
    createLink: "أنشئ حسابًا",
    signInLink: "سجّل الدخول",
    back: "العودة للرئيسية",
    privacy: "بيانات تواصلك تبقى خاصة، وأنت تقرر متى تشاركها.",
    terms: "بمتابعتك، أنت توافق على شروط وسياسة خصوصية كفو.",
    loading: "يرجى الانتظار…",
    setupRequired: "غير متاح",
    providerNotice: "بعض خيارات الدخول غير متاحة حاليًا. استخدم أي خيار متاح أدناه.",
    callbackError: "ما قدرنا نكمل تسجيل الدخول. حاول مرة ثانية أو اختر طريقة أخرى.",
    cancelledLogin: "ألغيت تسجيل الدخول عبر LinkedIn. تقدر تحاول مرة ثانية أو تختار طريقة أخرى.",
  },
} as const;

export function LoginView() {
  const [language, setLanguage] = useState<Language>("en");
  const [channel, setChannel] = useState<Channel>("email");
  const [emailMethod, setEmailMethod] = useState<EmailMethod>("otp");
  const [accountMode, setAccountMode] = useState<"signin" | "signup">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "signin"
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [callbackError] = useState(() => {
    if (typeof window === "undefined") return "";
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return hash.get("error") ?? query.get("error") ?? "";
  });
  const [availability, setAvailability] = useState<AuthAvailability>({ google: false, linkedin: false, phone: false, loading: true });
  const ar = language === "ar";
  const t = copy[language];
  const callbackMessage = callbackError === "user_cancelled_login" ? t.cancelledLogin : t.callbackError;

  useEffect(() => {
    let active = true;
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabasePublishableKey } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Auth settings unavailable")))
      .then((settings) => {
        if (!active) return;
        setAvailability({
          google: Boolean(settings.external?.google),
          linkedin: Boolean(settings.external?.linkedin_oidc || settings.external?.linkedin),
          phone: Boolean(settings.external?.phone),
          loading: false,
        });
      })
      .catch(() => {
        if (active) setAvailability((current) => ({ ...current, loading: false }));
      });
    return () => { active = false; };
  }, []);

  function destination() {
    const value = new URLSearchParams(window.location.search).get("returnTo") ?? "/dashboard";
    return value.startsWith("/") ? value : "/dashboard";
  }

  async function destinationAfterAuthentication(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return destination();
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();
    return profile?.onboarding_complete ? destination() : "/onboarding";
  }

  async function social(provider: "google" | "linkedin_oidc") {
    const enabled = provider === "google" ? availability.google : availability.linkedin;
    if (!enabled) {
      setMessage(t.providerNotice);
      return;
    }
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const callback = `${authRedirectOrigin(window.location.origin)}/auth/callback?next=${encodeURIComponent(destination())}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback } });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();

    if (codeSent) {
      const result = channel === "email"
        ? await supabase.auth.verifyOtp({ email: identifier.trim(), token: code.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: normalizePhone(identifier), token: code.trim(), type: "sms" });
      if (result.error) setMessage(result.error.message);
      else window.location.assign(await destinationAfterAuthentication(supabase));
      setBusy(false);
      return;
    }

    if (channel === "email" && emailMethod === "password") {
      const credentials = { email: identifier.trim(), password };
      const result = accountMode === "signup"
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) setMessage(result.error.message);
      else if (result.data.session) window.location.assign(await destinationAfterAuthentication(supabase));
      else setMessage(ar ? "راجع بريدك لتأكيد الحساب." : "Check your email to confirm your account.");
      setBusy(false);
      return;
    }

    const emailCallback = `${authRedirectOrigin(window.location.origin)}/auth/callback?next=${encodeURIComponent(destination())}`;
    const result = channel === "email"
      ? await supabase.auth.signInWithOtp({ email: identifier.trim(), options: { shouldCreateUser: accountMode === "signup", emailRedirectTo: emailCallback } })
      : await supabase.auth.signInWithOtp({ phone: normalizePhone(identifier), options: { shouldCreateUser: accountMode === "signup" } });
    if (result.error) setMessage(result.error.message);
    else setCodeSent(true);
    setBusy(false);
  }

  function switchChannel(next: Channel) {
    if (next === "phone" && !availability.phone) {
      setMessage(t.providerNotice);
      return;
    }
    setChannel(next);
    setIdentifier("");
    setPassword("");
    setCode("");
    setCodeSent(false);
    setMessage("");
  }

  return (
    <main className="auth-shell" dir={ar ? "rtl" : "ltr"}>
      <section className="auth-brand-panel" aria-hidden="true">
        <img
          className="auth-brand-visual"
          src="/illustrations/kufuo-login-collaboration.png"
          alt=""
        />
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-top">
          <Link href="/" className="auth-back"><ArrowLeft size={18} />{t.back}</Link>
          <button className="language-button" type="button" onClick={() => setLanguage(ar ? "en" : "ar")}><Languages size={18} />{ar ? "English" : "العربية"}</button>
        </div>
        <div className="auth-card">
          <div className="auth-heading"><span className="auth-logo auth-logo-wide"><img src="/kufuo-logo.svg" alt="Kufuo" /></span><h2>{accountMode === "signup" ? t.signupTitle : t.title}</h2><p>{accountMode === "signup" ? t.signupSubtitle : t.subtitle}</p></div>
          <div className="auth-socials">
            <button className={!availability.google && !availability.loading ? "is-unavailable" : ""} type="button" onClick={() => social("google")} disabled={busy || availability.loading || !availability.google} title={!availability.google && !availability.loading ? t.setupRequired : undefined}><FaGoogle aria-hidden="true" />{t.google}</button>
            <button className={!availability.linkedin && !availability.loading ? "is-unavailable" : ""} type="button" onClick={() => social("linkedin_oidc")} disabled={busy || availability.loading || !availability.linkedin} title={!availability.linkedin && !availability.loading ? t.setupRequired : undefined}><FaLinkedin aria-hidden="true" />{t.linkedin}</button>
          </div>
          {!availability.loading && (!availability.google || !availability.linkedin || !availability.phone) ? <p className="auth-provider-notice"><ShieldCheck size={15} />{t.providerNotice}</p> : null}
          <div className="auth-divider"><span>{t.or}</span></div>
          <div className="auth-channel-tabs" role="tablist">
            <button className={channel === "email" ? "is-active" : ""} type="button" onClick={() => switchChannel("email")}><Mail size={17} />{t.email}</button>
            <button className={`${channel === "phone" ? "is-active" : ""} ${!availability.phone && !availability.loading ? "is-unavailable" : ""}`} type="button" onClick={() => switchChannel("phone")} disabled={availability.loading || !availability.phone} title={!availability.phone && !availability.loading ? t.setupRequired : undefined}><Phone size={17} />{t.mobile}</button>
          </div>
          {channel === "email" && !codeSent ? <div className="auth-method-toggle"><button type="button" className={emailMethod === "otp" ? "is-active" : ""} onClick={() => setEmailMethod("otp")}>{t.emailOtp}</button><button type="button" className={emailMethod === "password" ? "is-active" : ""} onClick={() => setEmailMethod("password")}>{t.passwordMethod}</button></div> : null}
          <form className="auth-form" onSubmit={submit}>
            {!codeSent ? <label><span>{channel === "email" ? t.emailAddress : t.phoneNumber}</span><div className="auth-input"><span>{channel === "email" ? <Mail size={18} /> : <Phone size={18} />}</span><input type={channel === "email" ? "email" : "tel"} inputMode={channel === "email" ? "email" : "tel"} autoComplete={channel === "email" ? "email" : "tel"} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={channel === "email" ? "name@example.com" : "+44 7700 900000"} required /></div></label> : <><p className="auth-code-note"><CheckCircle2 size={18} />{t.codeSent}</p><label><span>{t.otp}</span><div className="auth-input auth-code-input"><LockKeyhole size={18} /><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" minLength={6} required /></div></label></>}
            {channel === "email" && emailMethod === "password" && !codeSent ? <label><span>{t.password}</span><div className="auth-input"><LockKeyhole size={18} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete={accountMode === "signin" ? "current-password" : "new-password"} required /></div></label> : null}
            {message || callbackError ? <p className="auth-message" role="status">{message || callbackMessage}</p> : null}
            <button className="button auth-submit" type="submit" disabled={busy}>{busy ? t.loading : codeSent ? t.verify : channel === "email" && emailMethod === "password" ? accountMode === "signup" ? t.create : t.signIn : accountMode === "signup" ? t.startRegistration : t.send}</button>
          </form>
          {channel === "email" && emailMethod === "password" && !codeSent ? <p className="auth-switch">{accountMode === "signin" ? t.newHere : t.haveAccount} <button type="button" onClick={() => setAccountMode(accountMode === "signin" ? "signup" : "signin")}>{accountMode === "signin" ? t.createLink : t.signInLink}</button></p> : null}
          <p className="auth-private"><ShieldCheck size={16} />{t.privacy}</p>
          <p className="auth-terms">{t.terms}</p>
        </div>
      </section>
    </main>
  );
}

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  return `+${compact}`;
}
