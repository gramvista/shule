import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { TextField } from "@/components/auth/auth-fields";
import { signup } from "../actions";

export default function SignupPage() {
  return <AuthShell title="Create your school account" description="Start with the school owner. You can invite the rest of the team later." footer={<>Already have an account? <Link className="font-bold text-[#0b63f3]" href="/login">Sign in</Link></>}><form action={signup} className="space-y-4"><TextField label="Your full name" name="fullName" autoComplete="name" placeholder="Neema Mushi" /><TextField label="Work email" name="email" type="email" autoComplete="email" placeholder="you@school.ac.tz" /><TextField label="Password" name="password" type="password" autoComplete="new-password" /><p className="text-xs leading-5 text-slate-500">Use at least 10 characters with a number and symbol.</p><button type="submit" className="focus-ring min-h-12 w-full rounded-xl bg-[#0b63f3] px-5 font-bold text-white">Create account</button><p className="text-xs leading-5 text-slate-500">By creating an account, you agree to your school&apos;s data being processed securely for service delivery.</p></form></AuthShell>;
}

