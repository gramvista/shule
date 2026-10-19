import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, note, icon: Icon, tone = "blue" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: "blue" | "teal" | "amber" | "red" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", teal: "bg-cyan-50 text-cyan-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700" };
  return <article className="rounded-2xl border border-[#dce4ee] bg-white p-4 shadow-[0_1px_2px_rgba(7,26,47,.03)] sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-[1.65rem] font-extrabold tracking-[-.04em] text-[#071a2f]">{value}</p></div><span className={cn("grid size-10 place-items-center rounded-xl", tones[tone])}><Icon size={20} /></span></div><p className="mt-3 text-xs font-medium text-slate-500">{note}</p></article>;
}

