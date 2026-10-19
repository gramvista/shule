import { describe, expect, it } from "vitest";
import { balanceStatus, calculateStudentBalance } from "@/lib/billing";

describe("billing ledger", () => {
  it("calculates balances from trusted minor units", () => expect(calculateStudentBalance([{ kind: "CHARGE", amountMinor: 100000 }, { kind: "ADJUSTMENT", amountMinor: -10000 }, { kind: "PAYMENT", amountMinor: 30000 }])).toBe(60000));
  it("represents overpayments as credit", () => expect(balanceStatus(-5000, 100000)).toBe("OVERPAID"));
  it("rejects fractional money", () => expect(() => calculateStudentBalance([{ kind: "CHARGE", amountMinor: 1.2 }])).toThrow());
});

