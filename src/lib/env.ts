const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function getSupabaseConfig() {
  if (!publicUrl || !publicKey) return null;
  return { url: publicUrl, anonKey: publicKey };
}

export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_APP_URL must be configured outside development.");
}

