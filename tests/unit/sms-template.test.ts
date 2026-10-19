import { describe, expect, it } from "vitest";
import { renderSmsTemplate, uniqueRecipients } from "@/lib/sms/templates";

describe("SMS templates", () => {
  it("renders only supported placeholders", () => expect(renderSmsTemplate("Dear {{parent_name}}, {{student_name}} owes {{balance}}.", { parent_name: "Asha", student_name: "Neema", balance: "TZS 100,000" })).toBe("Dear Asha, Neema owes TZS 100,000."));
  it("rejects unknown placeholders", () => expect(() => renderSmsTemplate("{{constructor}}", { constructor: "x" })).toThrow("Unsupported placeholder"));
  it("deduplicates phone recipients", () => expect(uniqueRecipients([{ phone: "+255700000001" }, { phone: "+255700000001" }, { phone: "+255700000002" }])).toHaveLength(2));
});

