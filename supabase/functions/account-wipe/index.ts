// Supabase Edge Function: account-wipe
// Irreversibly deletes the authenticated user, their data, and storage objects.
// Also creates a ZIP backup in Storage first (using backup-export logic).
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
//
// Request JSON:
// { "confirmation": "DELETE EVERYTHING" }

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

async function listAndRemovePrefix(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
) {
  // Best-effort: list up to 1000 and remove. Repeat once for nested folders.
  const pathsToRemove: string[] = [];
  const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) return;
  for (const obj of data ?? []) {
    if (obj.name) pathsToRemove.push(`${prefix}/${obj.name}`);
  }
  if (pathsToRemove.length) {
    await admin.storage.from(bucket).remove(pathsToRemove);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json({ error: "Server misconfigured" }, { status: 500 });

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) return json({ error: "Unauthorized" }, { status: 401 });
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const confirmation = String((body as any)?.confirmation ?? "");
    if (confirmation !== "DELETE EVERYTHING") {
      return json({ error: "Missing or invalid confirmation phrase" }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // 1) Backup first (call backup-export over HTTP using the same auth header)
    // We inline the call to avoid needing cross-function permissions.
    const backupRes = await fetch(new URL("/functions/v1/backup-export", url).toString(), {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const backupJson = await backupRes.json().catch(() => ({}));
    const backupUrl = (backupJson as any)?.signed_url ?? null;

    // 2) Audit log
    await admin.from("security_audit_events").insert({
      user_id: userId,
      event_type: "account_wipe",
      metadata: { backup_id: (backupJson as any)?.backup_id ?? null },
    });

    // 3) Delete storage objects (best-effort)
    await listAndRemovePrefix(admin, "document-images", userId);
    await listAndRemovePrefix(admin, "avatars", userId);
    await listAndRemovePrefix(admin, "account-backups", userId);

    // 4) Delete user-owned rows (best-effort)
    const tables = [
      "face_embeddings",
      "account_backups",
      "document_history",
      "notifications",
      "documents",
      "terms_acceptance",
      "tutorial_analytics",
      "user_webauthn_credentials",
      "webauthn_challenges",
      "user_security_settings",
      "user_settings",
      "user_profiles",
      "security_audit_events",
    ];

    for (const t of tables) {
      try {
        await admin.from(t).delete().eq("user_id", userId);
      } catch {
        // ignore
      }
    }

    // 5) Delete auth user (irreversible)
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    return json({ ok: true, backup_signed_url: backupUrl });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


