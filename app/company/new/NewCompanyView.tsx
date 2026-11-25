"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { Field, Notice, errorText } from "../../_ui/bits";
import { useT } from "../../_ui/lang";

export function NewCompanyView() {
  const { t } = useT();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: rpcError } = await createClient().rpc("create_company", {
      company_name: name.trim(),
      company_website: website.trim() || null,
    });
    setBusy(false);
    if (rpcError) return setError(errorText(rpcError));
    window.location.assign("/company");
  }

  return (
    <div className="kx-narrow">
      <p className="kx-kicker">{t("Company account", "حساب شركة")}</p>
      <h1 className="kx-title">{t("Set up your company", "أنشئ حساب شركتك")}</h1>
      <p className="kx-lead">{t("You'll be the owner. You can request experts as soon as it's created.", "بتكون المالك، وتقدر تطلب خبراء أول ما ينشأ الحساب.")}</p>
      <form className="kx-card kx-form" onSubmit={submit}>
        <Field label={t("Company name", "اسم الشركة")}>
          <input required minLength={2} maxLength={160} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("Website (optional)", "الموقع (اختياري)")}>
          <input inputMode="url" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Field>
        <Notice kind="error">{error}</Notice>
        <div className="kx-actions">
          <button className="button" type="submit" disabled={busy}>{busy ? t("Creating…", "جاري الإنشاء…") : t("Create company", "أنشئ الشركة")}</button>
        </div>
      </form>
    </div>
  );
}
