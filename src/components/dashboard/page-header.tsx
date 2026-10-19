import type { LucideIcon } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-[#0b63f3]">{eyebrow}</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p></div>{action}</div>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon size={23} /></span><h2 className="mt-4 font-extrabold">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div></div>;
}

