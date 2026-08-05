import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  browserClient ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return browserClient;
}
