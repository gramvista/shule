import { Building2, CalendarRange, CreditCard, KeyRound, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

const settings = [
  ["School profile", "Name, registration details, address and logo", Building2],
  ["Branches", "Campuses and branch-level access", MapPin],
  ["Academic periods", "Years, terms, classes and streams", CalendarRange],
  ["Team & permissions", "Invitations, roles and branch assignments", UsersRound],
  ["Grading & subjects", "Subjects, grade boundaries and assessment rules", ShieldCheck],
  ["Subscription", "Plan, usage limits and account status", CreditCard],
  ["Integrations", "Gramvista SMS credentials and sending limits", KeyRound],
] as const;

export default function SettingsPage() {
  return <div className="space-y-6"><PageHeader eyebrow="Mwangaza Academy" title="Settings" description="Configure how your school operates. Sensitive changes are recorded in the audit log." /><div className="grid gap-4 md:grid-cols-2">{settings.map(([title, description, Icon]) => <button key={title} className="focus-ring flex min-h-28 items-center gap-4 rounded-2xl border border-[#dce4ee] bg-white p-5 text-left hover:border-blue-300 hover:shadow-sm"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={21} /></span><span><strong className="block">{title}</strong><span className="mt-1 block text-sm text-slate-500">{description}</span></span></button>)}</div></div>;
}

