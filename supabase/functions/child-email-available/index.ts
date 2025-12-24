// Supabase Edge Function: child-email-available
// Checks if an email is already registered in Supabase Auth.
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
//
// Request JSON: { "email": string }
// Response JSON: { "available": boolean }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json({ error: "Server misconfigured" }, { status: 500 });

    // Require an authenticated parent session to avoid turning this into a public email enumeration endpoint.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) return json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const email = String((body as any)?.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) return json({ available: false }, { status: 200 });

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data } = await admin.auth.admin.getUserByEmail(email).catch(() => ({ data: null }));
    const exists = Boolean((data as any)?.user?.id);
    return json({ available: !exists }, { status: 200 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


