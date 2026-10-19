"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
const students = ["Amina Joseph", "Baraka Mollel", "Daniel Mushi", "Faraja John", "Neema William", "Rehema Said"];
const statuses: { value: Status; label: string; color: string }[] = [
  { value: "PRESENT", label: "Present", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  { value: "ABSENT", label: "Absent", color: "border-red-500 bg-red-50 text-red-800" },
  { value: "LATE", label: "Late", color: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "EXCUSED", label: "Excused", color: "border-blue-500 bg-blue-50 text-blue-800" },
];

export function AttendanceRegister() {
  const [records, setRecords] = useState<Record<string, Status>>(() => Object.fromEntries(students.map((name) => [name, "PRESENT"])));
  const [saved, setSaved] = useState(false);
  return <section className="overflow-hidden rounded-2xl border border-[#dce4ee] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><div><h2 className="font-extrabold">Standard 7 · Stream A</h2><p className="text-sm text-slate-500">Monday, 19 October 2026 · 32 students</p></div><button onClick={() => { setRecords(Object.fromEntries(students.map((name) => [name, "PRESENT"]))); setSaved(false); }} className="focus-ring min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-bold">Mark all present</button></div><div className="divide-y divide-slate-100">{students.map((name, index) => <div key={name} className="p-4 sm:flex sm:items-center sm:gap-4 sm:px-5"><div className="mb-3 flex min-w-0 flex-1 items-center gap-3 sm:mb-0"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-600">{index + 1}</span><div><p className="font-bold">{name}</p><p className="text-xs text-slate-500">MA-2026-{String(142 - index).padStart(4, "0")}</p></div></div><div className="grid grid-cols-2 gap-2 sm:flex">{statuses.map((status) => <button type="button" key={status.value} onClick={() => { setRecords((current) => ({ ...current, [name]: status.value })); setSaved(false); }} className={cn("focus-ring min-h-10 rounded-xl border px-3 text-sm font-bold", records[name] === status.value ? status.color : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")} aria-pressed={records[name] === status.value}>{records[name] === status.value && <Check size={14} className="mr-1 inline" />}{status.label}</button>)}</div></div>)}</div><div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-4 sm:px-5"><p className="text-sm text-slate-500">{saved ? "Attendance saved securely." : "Changes have not been saved yet."}</p><button onClick={() => setSaved(true)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b63f3] px-4 text-sm font-bold text-white"><Save size={17} /> Save attendance</button></div></section>;
}

