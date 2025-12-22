// Supabase Edge Function: backup-export
// Creates a ZIP backup of the user's documents + metadata and stores it in the private `account-backups` bucket.
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { ZipWriter, BlobWriter, BlobReader, TextReader } from "jsr:@zip-js/zip-js@2.7.57";

type DocRow = {
  id: string;
  user_id: string;
  document_type: string;
  document_name: string;
  document_number: string | null;
  issue_date: string | null;
  expiration_date: string;
  category: string;
  notes: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
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

function extFromPath(path: string) {
  const m = path.toLowerCase().match(/\\.([a-z0-9]{1,8})(?:\\?|#|$)/);
  return m ? m[1] : "bin";
}

function sanitizeFilename(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
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

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Create backup row first
    const { data: backupRow, error: backupInsertErr } = await admin
      .from("account_backups")
      .insert({
        user_id: userId,
        status: "pending",
        object_bucket: "account-backups",
        object_path: null,
        expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
      })
      .select("id")
      .single();
    if (backupInsertErr) throw backupInsertErr;

    const backupId = backupRow.id as string;
    const objectPath = `${userId}/${backupId}.zip`;

    // Fetch documents
    const { data: docs, error: docsErr } = await admin
      .from("documents")
      .select("*")
      .eq("user_id", userId);
    if (docsErr) throw docsErr;
    const documents = (docs ?? []) as DocRow[];

    // Build zip in memory
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("metadata/documents.json", new TextReader(JSON.stringify({ documents }, null, 2)));

    // Download each document image/pdf (best-effort; skip failures)
    for (const d of documents) {
      try {
        // image_url is typically a signed URL or public URL. Try fetching it directly.
        const res = await fetch(d.image_url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const ext = extFromPath(d.image_url);
        const safeName = sanitizeFilename(d.document_name || d.id);
        await zipWriter.add(`documents/${safeName}-${d.id}.${ext}`, new BlobReader(blob));
      } catch {
        // ignore per-file failures
      }
    }

    const zipBlob = await zipWriter.close();
    const zipArrayBuf = await zipBlob.arrayBuffer();

    // Upload to storage
    const { error: uploadErr } = await admin.storage
      .from("account-backups")
      .upload(objectPath, zipArrayBuf, {
        contentType: "application/zip",
        upsert: true,
      });
    if (uploadErr) throw uploadErr;

    // Update row to ready
    const { error: updErr } = await admin
      .from("account_backups")
      .update({ status: "ready", object_path: objectPath })
      .eq("id", backupId);
    if (updErr) throw updErr;

    // Create signed URL (short-lived)
    const { data: signed, error: signErr } = await admin.storage
      .from("account-backups")
      .createSignedUrl(objectPath, 60 * 15); // 15 minutes
    if (signErr) throw signErr;

    return json({ ok: true, backup_id: backupId, signed_url: signed.signedUrl });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


