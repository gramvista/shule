import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RequestBody = { message_id?: string };

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const url = requiredEnv("SUPABASE_URL");
  const anonKey = requiredEnv("SUPABASE_ANON_KEY");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const userClient = createClient(url, anonKey, { global: { headers: { authorization } } });
  const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Authentication required" }, 401);

  const body = await request.json().catch(() => ({})) as RequestBody;
  if (!body.message_id || !/^[0-9a-f-]{36}$/i.test(body.message_id)) return json({ error: "A valid message_id is required" }, 400);
  const { data: message } = await serviceClient.from("sms_messages").select("id,organization_id,body,status").eq("id", body.message_id).maybeSingle();
  if (!message || message.status !== "QUEUED") return json({ error: "Queued message not found" }, 404);

  const { data: allowed } = await userClient.rpc("has_permission", { p_organization_id: message.organization_id, p_permission: "sms.send" });
  if (!allowed) return json({ error: "You are not allowed to send this message" }, 403);

  const [{ data: organization }, { data: subscription }, { data: settings }, { data: credentials }, { data: recipients }] = await Promise.all([
    serviceClient.from("organizations").select("active").eq("id", message.organization_id).single(),
    serviceClient.from("subscriptions").select("status").eq("organization_id", message.organization_id).in("status", ["TRIAL", "ACTIVE", "GRACE_PERIOD"]).maybeSingle(),
    serviceClient.from("sms_settings").select("sender_id,daily_limit,enabled").eq("organization_id", message.organization_id).single(),
    serviceClient.from("sms_provider_credentials").select("encrypted_api_key").eq("organization_id", message.organization_id).single(),
    serviceClient.from("sms_recipients").select("id,phone_e164,status").eq("sms_message_id", message.id).eq("status", "QUEUED"),
  ]);
  if (!organization?.active || !subscription || !settings?.enabled || !settings.sender_id) return json({ error: "Messaging is not available for this school" }, 409);
  if (!credentials || !recipients?.length) return json({ error: "Messaging credentials or recipients are missing" }, 409);

  const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
  const { count } = await serviceClient.from("sms_recipients").select("id", { count: "exact", head: true }).eq("organization_id", message.organization_id).gte("created_at", startOfDay.toISOString()).in("status", ["SUBMITTED", "DELIVERED"]);
  if ((count ?? 0) + recipients.length > settings.daily_limit) return json({ error: "Daily SMS limit reached" }, 429);

  const apiKey = await decryptSecret(credentials.encrypted_api_key);
  const endpoint = requiredEnv("GRAMVISTA_SMS_API_URL");
  let submitted = 0;
  for (const recipient of recipients) {
    const response = await fetch(endpoint, { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ sender_id: settings.sender_id, to: recipient.phone_e164, message: message.body, client_reference: recipient.id }) });
    const providerPayload = await response.json().catch(() => ({})) as Record<string, unknown>;
    const providerId = typeof providerPayload.message_id === "string" ? providerPayload.message_id : null;
    const status = response.ok && providerId ? "SUBMITTED" : "FAILED";
    await serviceClient.from("sms_recipients").update({ status, provider_message_id: providerId, failure_code: status === "FAILED" ? `HTTP_${response.status}` : null }).eq("id", recipient.id).eq("status", "QUEUED");
    if (status === "SUBMITTED") submitted += 1;
  }
  await serviceClient.from("sms_messages").update({ status: submitted === recipients.length ? "SUBMITTED" : submitted ? "SUBMITTED" : "FAILED", submitted_at: new Date().toISOString() }).eq("id", message.id).eq("status", "QUEUED");
  return json({ submitted, failed: recipients.length - submitted }, 200);
});

async function decryptSecret(encoded: string) {
  const keyBytes = Uint8Array.from(atob(requiredEnv("SMS_CREDENTIAL_ENCRYPTION_KEY")), (char) => char.charCodeAt(0));
  const payload = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: payload.slice(0, 12) }, key, payload.slice(12));
  return new TextDecoder().decode(plaintext);
}
function requiredEnv(name: string) { const value = Deno.env.get(name); if (!value) throw new Error(`${name} is not configured`); return value; }
function json(body: unknown, status: number) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }); }

