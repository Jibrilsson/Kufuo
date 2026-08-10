export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://yikiywroobyywbowqppv.supabase.co";

export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? "sb_publishable_qKwA_F0QAMs0PA6rs0XF3Q_vG8tT2C5";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kufuo.com").replace(/\/+$/, "");

export function authRedirectOrigin(currentOrigin: string) {
  const { hostname } = new URL(currentOrigin);
  return hostname === "localhost" || hostname === "127.0.0.1" ? currentOrigin : siteUrl;
}
