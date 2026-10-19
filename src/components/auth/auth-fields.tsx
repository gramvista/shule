"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function TextField({ label, name, type = "text", autoComplete, placeholder, required = true }: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string; required?: boolean }) {
  const [show, setShow] = useState(false); const password = type === "password";
  return <label className="grid gap-1.5 text-sm font-bold text-slate-700">{label}<span className="relative"><input name={name} type={password && show ? "text" : type} autoComplete={autoComplete} placeholder={placeholder} required={required} className="focus-ring min-h-12 w-full rounded-xl border border-slate-300 px-3 pr-11 font-normal" />{password && <button type="button" onClick={() => setShow((current) => !current)} className="focus-ring absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-slate-500" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</span></label>;
}

