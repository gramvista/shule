export type SmsSubmission = { to: string; body: string; senderId: string; clientReference: string };
export type SmsSubmissionResult = { accepted: boolean; providerMessageId?: string; errorCode?: string };

export interface SmsProvider {
  submit(message: SmsSubmission): Promise<SmsSubmissionResult>;
}

export class GramvistaSmsProvider implements SmsProvider {
  constructor(private readonly options: { endpoint: string; apiKey: string }) {}

  async submit(message: SmsSubmission): Promise<SmsSubmissionResult> {
    const response = await fetch(this.options.endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${this.options.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ sender_id: message.senderId, to: message.to, message: message.body, client_reference: message.clientReference }),
      signal: AbortSignal.timeout(15000),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) return { accepted: false, errorCode: `HTTP_${response.status}` };
    if (!payload || typeof payload !== "object") return { accepted: false, errorCode: "INVALID_PROVIDER_RESPONSE" };
    const record = payload as Record<string, unknown>;
    const providerMessageId = typeof record.message_id === "string" ? record.message_id : undefined;
    return providerMessageId ? { accepted: true, providerMessageId } : { accepted: false, errorCode: "MISSING_PROVIDER_ID" };
  }
}

