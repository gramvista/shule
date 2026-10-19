import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function CheckEmailPage() {
  return <AuthShell title="Check your email" description="We sent you a secure link. Open it in the same browser to continue."><div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-blue-700"><MailCheck size={23} /></span><p className="mt-4 text-sm text-blue-900">The link may take a minute to arrive. Check your spam folder if you do not see it.</p></div><Link href="/login" className="focus-ring mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 text-sm font-bold">Back to sign in</Link></AuthShell>;
}

