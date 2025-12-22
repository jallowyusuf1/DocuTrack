// Supabase Edge Function: onboarding-config
// Public endpoint to read non-sensitive onboarding flags from app_settings.
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type AppSettingRow = {
  setting_key: string;
  setting_value: unknown;
};

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

Deno.serve(async () => {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      return json({ error: "Server misconfigured" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    const keys = ["require_email_verification"];
    const { data, error } = await admin
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", keys);

    if (error) throw error;

    const rows = (data ?? []) as AppSettingRow[];
    const map: Record<string, unknown> = {};
    for (const r of rows) map[r.setting_key] = r.setting_value;

    return json({
      require_email_verification: (map["require_email_verification"] as any)?.enabled ?? true,
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
});


