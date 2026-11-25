import { NextResponse } from "next/server";
import { authRedirectOrigin } from "../../lib/supabase/config";
import { createClient } from "../../lib/supabase/server";

async function signOut(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", authRedirectOrigin(url.origin)), { status: 303 });
}

export const GET = signOut;
export const POST = signOut;
