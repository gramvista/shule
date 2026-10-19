import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { TextField } from "@/components/auth/auth-fields";
import { login } from "../actions";

export default function LoginPage() {
  return <AuthShell title="Welcome back" description="Sign in to continue managing your school." footer={<>New to Shule Connect? <Link className="font-bold text-[#0b63f3]" href="/signup">Create your school account</Link></>}><form action={login} className="space-y-4"><TextField label="Email address" name="email" type="email" autoComplete="email" placeholder="you@school.ac.tz" /><TextField label="Password" name="password" type="password" autoComplete="current-password" /><div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-bold text-[#0b63f3]">Forgot password?</Link></div><button type="submit" className="focus-ring min-h-12 w-full rounded-xl bg-[#0b63f3] px-5 font-bold text-white">Sign in</button></form></AuthShell>;
}

