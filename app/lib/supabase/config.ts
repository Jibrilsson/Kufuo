export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://alivrxfwecotuksmhtwe.supabase.co";

export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? "sb_publishable_A2kAVxakZlWlXZHSosFB2w_EmS0lA8I";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kufuo.com").replace(/\/+$/, "");

export function authRedirectOrigin(currentOrigin: string) {
  const { hostname } = new URL(currentOrigin);
  return hostname === "localhost" || hostname === "127.0.0.1" ? currentOrigin : siteUrl;
}
