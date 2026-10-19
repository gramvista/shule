import { CalendarDays, ChevronDown } from "lucide-react";
import { AttendanceRegister } from "@/components/dashboard/attendance-register";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AttendancePage() {
  return <div className="space-y-6"><PageHeader eyebrow="Daily register" title="Attendance" description="Mark today’s attendance quickly. Start with everyone present, then update the exceptions." action={<div className="flex gap-2"><button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold"><CalendarDays size={18} /> 19 Oct 2026</button><button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold">Standard 7A <ChevronDown size={17} /></button></div>} /><div className="grid gap-3 sm:grid-cols-3">{[["Submitted classes", "21 / 24", "text-emerald-700 bg-emerald-50"], ["Present", "1,217", "text-cyan-700 bg-cyan-50"], ["Absent", "39", "text-red-700 bg-red-50"]].map(([label, value, tone]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-extrabold ${tone}`}>{value}</p></div>)}</div><AttendanceRegister /></div>;
}

