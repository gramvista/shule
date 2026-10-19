import { BarChart3, BookOpenCheck, CalendarCheck2, Download, GraduationCap, MessageSquareText, ReceiptText, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

const reports = [
  ["Student register", "Active, archived and enrollment history", GraduationCap],
  ["Attendance summary", "Daily, class and individual attendance", CalendarCheck2],
  ["Fee balances", "Expected, paid, waived and outstanding", ReceiptText],
  ["Academic performance", "Subject, class and student results", BookOpenCheck],
  ["Teachers & staff", "Assignments and employment status", UsersRound],
  ["SMS communication", "Recipients, delivery status and usage", MessageSquareText],
] as const;

export default function ReportsPage() {
  return <div className="space-y-6"><PageHeader eyebrow="School information" title="Reports" description="Filter every report by academic year, term, class, stream and branch before exporting." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map(([title, description, Icon]) => <article key={title} className="rounded-2xl border border-[#dce4ee] bg-white p-5"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={21} /></span><h2 className="mt-4 font-extrabold">{title}</h2><p className="mt-1 min-h-10 text-sm text-slate-500">{description}</p><div className="mt-5 flex gap-2"><button className="focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#071a2f] px-3 text-sm font-bold text-white"><BarChart3 size={16} /> View</button><button className="focus-ring grid size-10 place-items-center rounded-xl border border-slate-300" aria-label={`Export ${title}`}><Download size={17} /></button></div></article>)}</div></div>;
}

