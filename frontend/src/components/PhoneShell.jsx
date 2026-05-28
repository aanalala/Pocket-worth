import React from "react";
import { cn } from "../utils/utils";

export function PhoneShell({ children, dark = false }) {
  return (
    <div className={cn(
      "mx-auto w-full max-w-[430px] overflow-hidden rounded-[48px] border transition-all duration-700 shadow-2xl",
      dark ? "border-slate-800/80 bg-[#0f172a] shadow-black/60" : "border-slate-200 bg-white shadow-slate-300/50"
    )}>
      <div
        className={cn(
          "h-[860px] w-full overflow-y-auto transition-colors duration-700 scrollbar-hide",
          dark ? "bg-[#0f172a] text-slate-100" : "bg-white text-slate-900"
        )}
      >
        {children}
      </div>
    </div>
  );
}