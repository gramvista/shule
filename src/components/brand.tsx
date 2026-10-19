import { GraduationCap } from "lucide-react";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/product";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b63f3] text-white shadow-[0_8px_20px_rgba(11,99,243,.28)]"><GraduationCap size={22} strokeWidth={2.2} aria-hidden="true" /></span>{!compact && <span className="min-w-0"><span className={cn("block truncate text-[1.05rem] font-extrabold tracking-[-.025em]", inverse ? "text-white" : "text-[#071a2f]")}>{PRODUCT_NAME}</span><span className={cn("block truncate text-xs", inverse ? "text-slate-400" : "text-slate-500")}>{COMPANY_NAME}</span></span>}</div>;
}
