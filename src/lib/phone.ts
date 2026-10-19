export function normalizeTanzanianPhone(input: string): string | null {
  const compact = input.replace(/[\s().-]/g, "");
  let candidate = compact;
  if (candidate.startsWith("00")) candidate = `+${candidate.slice(2)}`;
  if (candidate.startsWith("0")) candidate = `+255${candidate.slice(1)}`;
  if (candidate.startsWith("255")) candidate = `+${candidate}`;
  if (!/^\+[1-9]\d{7,14}$/.test(candidate)) return null;
  return candidate;
}

