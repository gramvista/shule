import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { TextField } from "@/components/auth/auth-fields";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  return <AuthShell title="Reset your password" description="Enter your account email and we will send a secure reset link." footer={<Link className="font-bold text-[#0b63f3]" href="/login">Back to sign in</Link>}><form action={forgotPassword} className="space-y-4"><TextField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@school.ac.tz" /><button type="submit" className="focus-ring min-h-12 w-full rounded-xl bg-[#0b63f3] px-5 font-bold text-white">Send reset link</button></form></AuthShell>;
}
