import React from "react";
import { cn } from "../utils/utils";

export function SectionCard({ title, action, children, onActionClick, dark = false }) {
  return (
    <div className={cn(
      "rounded-[2.25rem] border p-6 transition-all duration-300",
      dark ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/10 hover:bg-slate-800/60" : "bg-white border-slate-100 shadow-sm shadow-slate-100/50"
    )}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={cn("text-xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{title}</h3>
        {action ? (
          <button 
            onClick={onActionClick} 
            className={cn("text-sm font-black uppercase tracking-widest transition-opacity hover:opacity-70", dark ? "text-blue-400" : "text-blue-600")}
          >
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}