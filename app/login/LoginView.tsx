"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Languages, LockKeyhole, Mail, Phone, ShieldCheck } from "lucide-react";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import { createClient } from "../lib/supabase/client";

type Language = "en" | "ar";
type Channel = "email" | "phone";
type EmailMethod = "otp" | "password";

const copy = {
  en: {
    title: "Welcome to Kufuo",
    subtitle: "Find someone worthy of building with.",
    google: "Continue with Google",
    linkedin: "Continue with LinkedIn",
    or: "or continue with",
    email: "Email",
    mobile: "Mobile",
    emailAddress: "Email address",
    phoneNumber: "Saudi mobile number",
    password: "Password",
    otp: "One-time code",
    emailOtp: "Email code",
    passwordMethod: "Password",
    send: "Send verification code",
    signIn: "Sign in",
    create: "Create account",
    verify: "Verify and continue",
    codeSent: "We sent a six-digit code. It may take a moment to arrive.",
    newHere: "New to Kufuo?",
    haveAccount: "Already have an account?",
    createLink: "Create an account",
    signInLink: "Sign in instead",
    back: "Back to home",
    privacy: "Your contact details stay private until you choose to share them.",
    terms: "By continuing, you agree to Kufuo’s Terms and Privacy Policy.",
    loading: "Please wait…",
  },
  ar: {
    title: "مرحبًا بك في كفو",
    subtitle: "ابحث عن شخص كفو تبني معه.",
    google: "المتابعة عبر Google",
    linkedin: "المتابعة عبر LinkedIn",
    or: "أو تابع باستخدام",
    email: "البريد الإلكتروني",
    mobile: "الجوال",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الجوال السعودي",
    password: "كلمة المرور",
    otp: "رمز التحقق",
    emailOtp: "رمز البريد",
    passwordMethod: "كلمة المرور",
    send: "إرسال رمز التحقق",
    signIn: "تسجيل الدخول",
    create: "إنشاء حساب",
    verify: "تحقق وتابع",
    codeSent: "أرسلنا رمزًا من ستة أرقام. قد يستغرق وصوله لحظات.",
    newHere: "جديد في كفو؟",
    haveAccount: "لديك حساب بالفعل؟",
    createLink: "أنشئ حسابًا",
    signInLink: "سجّل الدخول",
    back: "العودة للرئيسية",
    privacy: "تبقى بيانات التواصل خاصة حتى تختار مشاركتها.",
    terms: "بمتابعتك، أنت توافق على شروط وسياسة خصوصية كفو.",
    loading: "يرجى الانتظار…",
  },
} as const;

export function LoginView() {
  const [language, setLanguage] = useState<Language>("en");
  const [channel, setChannel] = useState<Channel>("email");
  const [emailMethod, setEmailMethod] = useState<EmailMethod>("otp");
  const [accountMode, setAccountMode] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const ar = language === "ar";
  const t = copy[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setMessage(ar ? "تعذر إكمال تسجيل الدخول. حاول مرة أخرى." : "We couldn’t complete sign in. Please try again.");
  }, [ar]);

  function destination() {
    const value = new URLSearchParams(window.location.search).get("returnTo") ?? "/dashboard";
    return value.startsWith("/") ? value : "/dashboard";
  }

  async function social(provider: "google" | "linkedin_oidc") {
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination())}`;
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
      else window.location.assign(destination());
      setBusy(false);
      return;
    }

    if (channel === "email" && emailMethod === "password") {
      const credentials = { email: identifier.trim(), password };
      const result = accountMode === "signup"
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) setMessage(result.error.message);
      else if (result.data.session) window.location.assign(destination());
      else setMessage(ar ? "راجع بريدك لتأكيد الحساب." : "Check your email to confirm your account.");
      setBusy(false);
      return;
    }

    const result = channel === "email"
      ? await supabase.auth.signInWithOtp({ email: identifier.trim(), options: { shouldCreateUser: true } })
      : await supabase.auth.signInWithOtp({ phone: normalizePhone(identifier), options: { shouldCreateUser: true } });
    if (result.error) setMessage(result.error.message);
    else setCodeSent(true);
    setBusy(false);
  }

  function switchChannel(next: Channel) {
    setChannel(next);
    setIdentifier("");
    setPassword("");
    setCode("");
    setCodeSent(false);
    setMessage("");
  }

  return (
    <main className="auth-shell" dir={ar ? "rtl" : "ltr"}>
      <section className="auth-brand-panel">
        <a className="brand auth-brand" href="/" aria-label="Kufuo home"><span className="brand-mark"><img src="/kufuo-mark-256.png" alt="" /></span><span dir="ltr">Kufuo <b lang="ar">| كفو</b></span></a>
        <div className="auth-brand-copy">
          <p className="eyebrow"><ShieldCheck size={16} />{ar ? "مجتمع مؤسسين موثوق" : "A trusted founder community"}</p>
          <h1>{t.subtitle}</h1>
          <ul>
            <li><CheckCircle2 size={19} />{ar ? "ملفات مؤسسين جادة" : "Serious founder profiles"}</li>
            <li><CheckCircle2 size={19} />{ar ? "توافق في المهارات والقيم" : "Skills and values compatibility"}</li>
            <li><CheckCircle2 size={19} />{ar ? "خصوصية وتحكم كامل" : "Privacy and full control"}</li>
          </ul>
        </div>
        <p className="auth-brand-foot">Kufuo | كفو · Saudi Arabia</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-top">
          <a href="/" className="auth-back"><ArrowLeft size={18} />{t.back}</a>
          <button className="language-button" type="button" onClick={() => setLanguage(ar ? "en" : "ar")}><Languages size={18} />{ar ? "English" : "العربية"}</button>
        </div>
        <div className="auth-card">
          <div className="auth-heading"><span className="auth-logo"><img src="/kufuo-mark-256.png" alt="" /></span><h2>{t.title}</h2><p>{t.subtitle}</p></div>
          <div className="auth-socials">
            <button type="button" onClick={() => social("google")} disabled={busy}><FaGoogle aria-hidden="true" />{t.google}</button>
            <button type="button" onClick={() => social("linkedin_oidc")} disabled={busy}><FaLinkedin aria-hidden="true" />{t.linkedin}</button>
          </div>
          <div className="auth-divider"><span>{t.or}</span></div>
          <div className="auth-channel-tabs" role="tablist">
            <button className={channel === "email" ? "is-active" : ""} type="button" onClick={() => switchChannel("email")}><Mail size={17} />{t.email}</button>
            <button className={channel === "phone" ? "is-active" : ""} type="button" onClick={() => switchChannel("phone")}><Phone size={17} />{t.mobile}</button>
          </div>
          {channel === "email" && !codeSent ? <div className="auth-method-toggle"><button type="button" className={emailMethod === "otp" ? "is-active" : ""} onClick={() => setEmailMethod("otp")}>{t.emailOtp}</button><button type="button" className={emailMethod === "password" ? "is-active" : ""} onClick={() => setEmailMethod("password")}>{t.passwordMethod}</button></div> : null}
          <form className="auth-form" onSubmit={submit}>
            {!codeSent ? <label><span>{channel === "email" ? t.emailAddress : t.phoneNumber}</span><div className="auth-input"><span>{channel === "email" ? <Mail size={18} /> : <Phone size={18} />}</span>{channel === "phone" ? <b dir="ltr">+966</b> : null}<input type={channel === "email" ? "email" : "tel"} inputMode={channel === "email" ? "email" : "tel"} autoComplete={channel === "email" ? "email" : "tel"} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={channel === "email" ? "name@example.com" : "5X XXX XXXX"} required /></div></label> : <><p className="auth-code-note"><CheckCircle2 size={18} />{t.codeSent}</p><label><span>{t.otp}</span><div className="auth-input auth-code-input"><LockKeyhole size={18} /><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" minLength={6} required /></div></label></>}
            {channel === "email" && emailMethod === "password" && !codeSent ? <label><span>{t.password}</span><div className="auth-input"><LockKeyhole size={18} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete={accountMode === "signin" ? "current-password" : "new-password"} required /></div></label> : null}
            {message ? <p className="auth-message" role="status">{message}</p> : null}
            <button className="button auth-submit" type="submit" disabled={busy}>{busy ? t.loading : codeSent ? t.verify : channel === "email" && emailMethod === "password" ? accountMode === "signup" ? t.create : t.signIn : t.send}</button>
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
  const digits = value.replace(/\D/g, "").replace(/^966/, "").replace(/^0/, "");
  return `+966${digits}`;
}
