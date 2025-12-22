// Supabase Edge Function: face-embedding-store
// Accepts a client-computed embedding and stores an encrypted ciphertext in public.face_embeddings.
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
// - FACE_EMBEDDING_KEY_B64 (32-byte base64 key for AES-256-GCM)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Body = {
  document_id?: string;
  object_bucket: string;
  object_path: string;
  model: string;
  dims: number;
  embedding: number[]; // Float array
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

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

async function getAesKey() {
  const keyB64 = Deno.env.get("FACE_EMBEDDING_KEY_B64");
  if (!keyB64) throw new Error("Missing FACE_EMBEDDING_KEY_B64 secret");
  const raw = base64ToBytes(keyB64);
  if (raw.length !== 32) throw new Error("FACE_EMBEDDING_KEY_B64 must be 32 bytes (AES-256)");
  return await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
}

function floatArrayToBytes(arr: number[]) {
  const f32 = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) f32[i] = arr[i];
  return new Uint8Array(f32.buffer);
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

    const body = (await req.json()) as Body;
    if (!body?.object_bucket || !body?.object_path || !body?.model || !body?.dims || !Array.isArray(body.embedding)) {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    if (body.embedding.length !== body.dims) {
      return json({ error: "dims does not match embedding length" }, { status: 400 });
    }

    // Encrypt embedding bytes with AES-GCM: store base64(iv||ciphertext)
    const key = await getAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = floatArrayToBytes(body.embedding);
    const ctBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    const ct = new Uint8Array(ctBuf);
    const combined = new Uint8Array(iv.length + ct.length);
    combined.set(iv, 0);
    combined.set(ct, iv.length);
    const ciphertextB64 = bytesToBase64(combined);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await admin
      .from("face_embeddings")
      .insert({
        user_id: userId,
        source: "document_image",
        document_id: body.document_id ?? null,
        object_bucket: body.object_bucket,
        object_path: body.object_path,
        model: body.model,
        dims: body.dims,
        embedding_ciphertext: ciphertextB64,
      })
      .select("id, created_at")
      .single();

    if (error) throw error;
    return json({ ok: true, id: data.id, created_at: data.created_at });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


