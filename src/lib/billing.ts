export type LedgerEntry = { kind: "CHARGE" | "PAYMENT" | "ADJUSTMENT"; amountMinor: number };

export function calculateStudentBalance(entries: LedgerEntry[]) {
  return entries.reduce((balance, entry) => {
    if (!Number.isSafeInteger(entry.amountMinor)) throw new Error("Ledger amounts must be integer minor units");
    return entry.kind === "PAYMENT" ? balance - entry.amountMinor : balance + entry.amountMinor;
  }, 0);
}

export function balanceStatus(balanceMinor: number, expectedMinor: number): "UNPAID" | "PARTIAL" | "PAID" | "OVERPAID" | "WAIVED" {
  if (expectedMinor === 0) return "WAIVED";
  if (balanceMinor < 0) return "OVERPAID";
  if (balanceMinor === 0) return "PAID";
  return balanceMinor === expectedMinor ? "UNPAID" : "PARTIAL";
}

