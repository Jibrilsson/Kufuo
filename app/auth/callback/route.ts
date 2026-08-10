import { NextResponse } from "next/server";
import { authRedirectOrigin } from "../../lib/supabase/config";
import { createClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/dashboard";
  const next = requestedNext.startsWith("/") ? requestedNext : "/dashboard";
  const redirectOrigin = authRedirectOrigin(url.origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("onboarding_complete").eq("id", user.id).maybeSingle();
        if (!profile?.onboarding_complete) return NextResponse.redirect(new URL("/onboarding", redirectOrigin));
      }
      return NextResponse.redirect(new URL(next, redirectOrigin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", redirectOrigin));
}
