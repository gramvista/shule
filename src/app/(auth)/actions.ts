"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const credentials = z.object({ email: z.string().trim().email().max(254), password: z.string().min(10).max(128) });

export async function login(formData: FormData) {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=Please+check+your+email+and+password");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Authentication+is+not+configured");
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/login?error=Email+or+password+is+incorrect");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const parsed = credentials.extend({ fullName: z.string().trim().min(2).max(120) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/signup?error=Please+check+the+details+and+password");
  const supabase = await createClient();
  if (!supabase) redirect("/signup?error=Authentication+is+not+configured");
  const { error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: `${getAppUrl()}/auth/callback`, data: { full_name: parsed.data.fullName } } });
  if (error) redirect("/signup?error=We+could+not+create+that+account");
  redirect("/check-email");
}

export async function forgotPassword(formData: FormData) {
  const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/forgot-password?error=Enter+a+valid+email+address");
  const supabase = await createClient();
  if (!supabase) redirect("/forgot-password?error=Authentication+is+not+configured");
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${getAppUrl()}/reset-password` });
  redirect("/check-email?mode=reset");
}

export async function updatePassword(formData: FormData) {
  const parsed = z.object({ password: z.string().min(10).max(128) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/reset-password?error=Use+at+least+10+characters");
  const supabase = await createClient();
  if (!supabase) redirect("/reset-password?error=Authentication+is+not+configured");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect("/reset-password?error=The+reset+link+may+have+expired");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}

