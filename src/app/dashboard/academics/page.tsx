import { BookOpenCheck, CheckCircle2, FileDown, Plus, TriangleAlert, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

const assessments = [
  { name: "Term 2 Midterm", className: "Form 2A", subject: "Mathematics", progress: "42 / 42", state: "Complete" },
  { name: "Terminal Exam", className: "Form 4A", subject: "Physics", progress: "33 / 38", state: "In progress" },
  { name: "Weekly Quiz 6", className: "Standard 7A", subject: "English", progress: "0 / 32", state: "Not started" },
];

const summary: { label: string; value: string; icon: LucideIcon; tone: string }[] = [
  { label: "Open assessments", value: "8", icon: BookOpenCheck, tone: "bg-blue-50 text-blue-700" },
  { label: "Results complete", value: "21", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Need attention", value: "3", icon: TriangleAlert, tone: "bg-amber-50 text-amber-700" },
];

export default function AcademicsPage() {
  return <div className="space-y-6">
    <PageHeader eyebrow="Results and report cards" title="Academics" description="Create weighted assessments, enter validated marks and publish results using the school's grading scale." action={<button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b63f3] px-4 text-sm font-bold text-white"><Plus size={18} /> New assessment</button>} />
    <div className="grid gap-4 sm:grid-cols-3">{summary.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={20} /></span><p className="mt-4 text-2xl font-extrabold">{value}</p><p className="text-sm text-slate-500">{label}</p></div>)}</div>
    <section className="rounded-2xl border border-[#dce4ee] bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold">Recent assessments</h2><p className="text-sm text-slate-500">Mark entry progress for your assigned classes</p></div><div className="divide-y divide-slate-100">{assessments.map((assessment) => <article key={assessment.name + assessment.subject} className="grid gap-3 p-5 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"><div><h3 className="font-bold">{assessment.name}</h3><p className="text-xs text-slate-500">{assessment.className}</p></div><div><p className="text-xs text-slate-500">Subject</p><p className="text-sm font-semibold">{assessment.subject}</p></div><div><p className="text-xs text-slate-500">Marks entered</p><p className="text-sm font-semibold">{assessment.progress}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${assessment.state === "Complete" ? "bg-emerald-50 text-emerald-700" : assessment.state === "In progress" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{assessment.state}</span></article>)}</div></section>
    <section className="flex flex-col gap-4 rounded-2xl bg-[#071a2f] p-5 text-white sm:flex-row sm:items-center"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[#23b8c5]"><FileDown size={23} /></span><div className="flex-1"><h2 className="font-extrabold">Report cards</h2><p className="text-sm text-slate-400">Generate secure term report cards with results, grades, attendance and comments.</p></div><button className="focus-ring min-h-11 rounded-xl bg-white px-4 text-sm font-bold text-[#071a2f]">Open report cards</button></section>
  </div>;
}

