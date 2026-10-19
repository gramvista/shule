const allowedPlaceholders = new Set(["parent_name", "student_name", "balance", "due_date"]);
const placeholderPattern = /{{\s*([a-z_]+)\s*}}/g;

export function renderSmsTemplate(template: string, values: Record<string, string | number>) {
  if (template.length > 1000) throw new Error("SMS template is too long");
  const referenced = [...template.matchAll(placeholderPattern)].map((match) => match[1]);
  for (const key of referenced) {
    if (!allowedPlaceholders.has(key)) throw new Error(`Unsupported placeholder: ${key}`);
    if (!(key in values)) throw new Error(`Missing placeholder value: ${key}`);
  }
  return template.replace(placeholderPattern, (_match, key: string) => String(values[key]).replace(/[{}]/g, "")).trim();
}

export function uniqueRecipients(recipients: { phone: string; guardianId?: string }[]) {
  return [...new Map(recipients.map((recipient) => [recipient.phone, recipient])).values()];
}

