"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase browser environment variables are not configured.");
  return createBrowserClient(config.url, config.anonKey);
}

