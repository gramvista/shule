import { describe, expect, it } from "vitest";
import { normalizeTanzanianPhone } from "@/lib/phone";

describe("normalizeTanzanianPhone", () => {
  it.each([["0754 123 456", "+255754123456"], ["255754123456", "+255754123456"], ["+255 754 123 456", "+255754123456"], ["00255754123456", "+255754123456"]])("normalizes %s", (input, expected) => expect(normalizeTanzanianPhone(input)).toBe(expected));
  it.each(["", "123", "+0255123456", "phone"]) ("rejects %s", (input) => expect(normalizeTanzanianPhone(input)).toBeNull());
});

