// Supabase Edge Function: create-child-account
//
// Creates a supervised child auth user + child_accounts row + family connection (connections table).
//
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY
//
// Optional secrets:
// - RESEND_API_KEY (if set, will attempt to send emails via Resend)
// - RESEND_FROM (e.g. "DocuTrackr <no-reply@yourdomain.com>")
//
// Request JSON:
// {
//  full_name: string,
//  date_of_birth: "YYYY-MM-DD",
//  relationship: "son"|"daughter"|"dependent"|"other",
//  email: string,
//  auto_generate_password: boolean,
//  password?: string,
//  oversight_level: "full_supervision"|"monitored_access"|"limited_independence",
//  permissions: object,
//  notification_preferences: object,
//  legal_consent: boolean
// }

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

function calcAgeYears(dobISO: string) {
  const dob = new Date(`${dobISO}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
  return age;
}

function generatePassword(length = 16) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%^&*_-+=?";
  const all = upper + lower + numbers + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function passwordMeetsRequirements(pw: string) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

async function resendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM") ?? "";
  if (!apiKey || !from) return { ok: false as const, skipped: true as const };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false as const, skipped: false as const, error: t || "email failed" };
  }
  return { ok: true as const, skipped: false as const };
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
    const parentUser = userData.user;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));
    const full_name = String((body as any)?.full_name ?? "").trim();
    const date_of_birth = String((body as any)?.date_of_birth ?? "");
    const relationship = String((body as any)?.relationship ?? "");
    const email = String((body as any)?.email ?? "").trim().toLowerCase();
    const auto_generate_password = Boolean((body as any)?.auto_generate_password ?? true);
    const providedPassword = String((body as any)?.password ?? "");
    const oversight_level = String((body as any)?.oversight_level ?? "full_supervision");
    const permissions = (body as any)?.permissions ?? {};
    const notification_preferences = (body as any)?.notification_preferences ?? {};
    const legal_consent = Boolean((body as any)?.legal_consent ?? false);

    if (!legal_consent) return json({ error: "Legal consent required" }, { status: 400 });
    if (!full_name) return json({ error: "Full name is required" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) return json({ error: "Invalid date of birth" }, { status: 400 });
    if (!["son", "daughter", "dependent", "other"].includes(relationship)) return json({ error: "Invalid relationship" }, { status: 400 });
    if (!email || !email.includes("@")) return json({ error: "Invalid email" }, { status: 400 });
    if (!["full_supervision", "monitored_access", "limited_independence"].includes(oversight_level)) {
      return json({ error: "Invalid oversight level" }, { status: 400 });
    }

    const age = calcAgeYears(date_of_birth);
    if (age < 13 || age > 17) {
      return json({ error: "Child must be between 13 and 17 years old" }, { status: 400 });
    }

    const password = auto_generate_password ? generatePassword(16) : providedPassword;
    if (!passwordMeetsRequirements(password)) {
      return json({ error: "Password does not meet requirements" }, { status: 400 });
    }

    // Pre-check for email availability (best-effort)
    const { data: existingUser } = await admin.auth.admin.getUserByEmail(email).catch(() => ({ data: null }));
    if ((existingUser as any)?.user?.id) {
      return json({ error: "This email is already registered" }, { status: 409 });
    }

    // Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createErr || !created?.user?.id) {
      return json({ error: createErr?.message ?? "Failed to create auth user" }, { status: 400 });
    }
    const childUserId = created.user.id;

    // Ensure profile is updated with full_name/email + role (trigger may already do this)
    await admin.from("user_profiles").update({ full_name, email, account_role: "child" }).eq("user_id", childUserId);

    const consentIp =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      null;

    // Insert child account row
    const { data: childAccount, error: childErr } = await admin
      .from("child_accounts")
      .insert({
        parent_id: parentUser.id,
        child_user_id: childUserId,
        full_name,
        date_of_birth,
        relationship,
        oversight_level,
        permissions,
        notification_preferences,
        status: "active",
        consented_at: new Date().toISOString(),
        consent_ip: consentIp,
        auto_convert_on_18: true,
      })
      .select("id, child_user_id, full_name, date_of_birth, age_years, relationship, oversight_level, status")
      .single();

    if (childErr || !childAccount) {
      // Roll back auth user on failure (best-effort)
      await admin.auth.admin.deleteUser(childUserId);
      return json({ error: childErr?.message ?? "Failed to create child account" }, { status: 400 });
    }

    // Create family connections (accepted both ways)
    const now = new Date().toISOString();
    await admin.from("connections").upsert([
      { user_id: parentUser.id, connected_user_id: childUserId, status: "accepted", relationship: "child", accepted_at: now },
      { user_id: childUserId, connected_user_id: parentUser.id, status: "accepted", relationship: "parent", accepted_at: now },
    ], { onConflict: "user_id,connected_user_id" });

    // Attempt emails (optional)
    const emails: any[] = [];
    const childEmailHtml = auto_generate_password
      ? `<p>Welcome to DocuTrackr.</p><p>Your account has been created. Your temporary password is:</p><p><b>${password}</b></p><p>Please log in and change it.</p>`
      : `<p>Welcome to DocuTrackr.</p><p>Your account has been created. Please log in with the password provided by your parent/guardian.</p>`;
    emails.push(await resendEmail(email, "Welcome to DocuTrackr", childEmailHtml));
    if (parentUser.email) {
      emails.push(await resendEmail(parentUser.email, "Child account created", `<p>You created a supervised account for <b>${full_name}</b>.</p>`));
    }

    return json({
      child_account: childAccount,
      generated_password: auto_generate_password ? password : undefined,
      email_delivery: emails,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
});


