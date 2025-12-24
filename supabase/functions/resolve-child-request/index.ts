// Supabase Edge Function: resolve-child-request
// Parent approves/denies a pending child request.
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
//
// Request JSON:
// { "request_id": string, "action": "approve" | "deny", "denial_reason"?: string }

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

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) return json({ error: "Unauthorized" }, { status: 401 });
    const parentId = userData.user.id;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));
    const requestId = String((body as any)?.request_id ?? "");
    const action = String((body as any)?.action ?? "");
    const denialReason = (body as any)?.denial_reason ? String((body as any)?.denial_reason) : null;
    if (!requestId) return json({ error: "Missing request_id" }, { status: 400 });
    if (action !== "approve" && action !== "deny") return json({ error: "Invalid action" }, { status: 400 });

    // Load request + child account, ensure parent owns it.
    const { data: reqRow, error: reqErr } = await admin
      .from("child_account_requests")
      .select("id, child_account_id, request_type, document_id, message, status, requested_by_user_id")
      .eq("id", requestId)
      .single();
    if (reqErr || !reqRow) return json({ error: "Request not found" }, { status: 404 });
    if (reqRow.status !== "pending") return json({ error: "Request already resolved" }, { status: 409 });

    const { data: ca, error: caErr } = await admin
      .from("child_accounts")
      .select("id, parent_id, child_user_id, full_name")
      .eq("id", reqRow.child_account_id)
      .single();
    if (caErr || !ca) return json({ error: "Child account not found" }, { status: 404 });
    if (ca.parent_id !== parentId) return json({ error: "Forbidden" }, { status: 403 });

    const now = new Date().toISOString();

    // Execute action (minimal: currently only supports delete_document request_type).
    if (action === "approve") {
      if (reqRow.request_type === "delete_document" && reqRow.document_id) {
        await admin.from("documents").update({ deleted_at: now }).eq("id", reqRow.document_id).eq("user_id", ca.child_user_id);
      }

      await admin.from("child_account_requests").update({
        status: "approved",
        resolved_at: now,
        resolved_by_user_id: parentId,
      }).eq("id", requestId);

      await admin.from("child_account_activity").insert({
        child_account_id: ca.id,
        actor_user_id: parentId,
        action_type: `request_approved:${reqRow.request_type}`,
        document_id: reqRow.document_id ?? null,
        status: "success",
        details: { request_id: requestId },
      });

      // Notify child (best-effort)
      await admin.from("notifications").insert({
        user_id: ca.child_user_id,
        title: "Request approved",
        message: "Your request was approved.",
        type: "system",
        created_at: now,
      }).catch(() => {});
    } else {
      await admin.from("child_account_requests").update({
        status: "denied",
        denial_reason: denialReason,
        resolved_at: now,
        resolved_by_user_id: parentId,
      }).eq("id", requestId);

      await admin.from("child_account_activity").insert({
        child_account_id: ca.id,
        actor_user_id: parentId,
        action_type: `request_denied:${reqRow.request_type}`,
        document_id: reqRow.document_id ?? null,
        status: "denied",
        details: { request_id: requestId, denial_reason: denialReason },
      });

      await admin.from("notifications").insert({
        user_id: ca.child_user_id,
        title: "Request denied",
        message: denialReason ? `Reason: ${denialReason}` : "Your request was denied.",
        type: "system",
        created_at: now,
      }).catch(() => {});
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


