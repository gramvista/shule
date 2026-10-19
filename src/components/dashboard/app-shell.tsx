"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, BookOpenCheck, ChartNoAxesCombined, ChevronDown, ClipboardCheck, GraduationCap, LayoutDashboard, Menu, MessageSquareText, Search, Settings, WalletCards, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { appNav } from "@/lib/product";
import { cn, initials } from "@/lib/utils";

const icons = { LayoutDashboard, GraduationCap, ClipboardCheck, WalletCards, BookOpenCheck, MessageSquareText, ChartNoAxesCombined };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return <div className="min-h-screen bg-[#f3f6fa] lg:grid lg:grid-cols-[248px_1fr]">
    <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className={cn("fixed inset-0 z-40 bg-[#071a2f]/55 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")} />
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col bg-[#071a2f] px-4 py-5 text-white shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-2"><Brand inverse /><button className="focus-ring rounded-lg p-2 text-slate-300 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={21} /></button></div>
      <div className="mt-7 rounded-xl border border-white/10 bg-white/[.055] p-3"><div className="flex items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#23b8c5] text-sm font-extrabold text-[#071a2f]">MA</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Mwangaza Academy</p><p className="truncate text-xs text-slate-400">Arusha Campus</p></div><ChevronDown size={16} className="text-slate-400" /></div></div>
      <nav className="mt-6 flex-1 space-y-1" aria-label="Main navigation">{appNav.map((item) => { const Icon = icons[item.icon]; const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", active ? "bg-white text-[#071a2f] shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white")}><Icon size={19} strokeWidth={active ? 2.35 : 1.9} aria-hidden="true" />{item.label}</Link>; })}</nav>
      <div className="border-t border-white/10 pt-3"><Link href="/dashboard/settings" className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><Settings size={19} /> Settings</Link><div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3"><span className="grid size-9 place-items-center rounded-full bg-[#f4a600] text-xs font-extrabold text-[#071a2f]">{initials("Neema Mushi")}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">Neema Mushi</span><span className="block truncate text-xs text-slate-400">School owner</span></span></div></div>
    </aside>
    <div className="min-w-0"><header className="sticky top-0 z-30 flex h-[70px] items-center gap-3 border-b border-[#dce4ee] bg-white/95 px-4 backdrop-blur lg:px-7"><button onClick={() => setOpen(true)} className="focus-ring grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="Open menu"><Menu size={21} /></button><div className="relative hidden max-w-md flex-1 sm:block"><Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400" placeholder="Search students, guardians or receipts" aria-label="Search" /></div><div className="ml-auto flex items-center gap-2"><span className="hidden rounded-full bg-[#e7f8f5] px-3 py-1.5 text-xs font-bold text-[#087a50] md:inline-flex">2026 · Term 2</span><button className="focus-ring relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 size-2 rounded-full bg-[#dc3545] ring-2 ring-white" /></button></div></header><main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main></div>
  </div>;
}

