"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { normalizeTanzanianPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(2).max(160), registrationNumber: z.string().trim().max(100).optional(),
  phone: z.string().trim().min(7), email: z.string().trim().email().max(254), region: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100), ward: z.string().trim().max(100).optional(), address: z.string().trim().min(2).max(300),
  schoolLevel: z.enum(["PRE_PRIMARY", "PRIMARY", "SECONDARY", "COLLEGE"]), ownershipType: z.enum(["PRIVATE", "GOVERNMENT", "FAITH_BASED", "COMMUNITY", "OTHER"]),
});

export async function onboardSchool(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/onboarding?error=Please+check+the+school+details");
  const phone = normalizeTanzanianPhone(parsed.data.phone);
  if (!phone) redirect("/onboarding?error=Enter+a+valid+school+phone+number");
  const supabase = await createClient();
  if (!supabase) redirect("/onboarding?error=Supabase+is+not+configured");
  const year = new Date().getFullYear();
  const { error } = await supabase.rpc("onboard_school", {
    p_name: parsed.data.name, p_registration_number: parsed.data.registrationNumber ?? "", p_phone_e164: phone,
    p_email: parsed.data.email, p_region: parsed.data.region, p_district: parsed.data.district, p_ward: parsed.data.ward ?? "",
    p_physical_address: parsed.data.address, p_school_level: parsed.data.schoolLevel, p_ownership_type: parsed.data.ownershipType,
    p_branch_name: "Main Campus", p_academic_year_name: String(year), p_year_starts_on: `${year}-01-01`, p_year_ends_on: `${year}-12-31`,
    p_term_name: "Term 1", p_term_starts_on: `${year}-01-01`, p_term_ends_on: `${year}-04-30`,
  });
  if (error) redirect("/onboarding?error=We+could+not+create+the+school");
  redirect("/dashboard");
}

