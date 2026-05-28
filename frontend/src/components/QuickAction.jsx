import React from "react";
import { cn } from "../utils/utils";

export function QuickAction({ icon, title, tone = "blue", onClick, dark = false }) {
  const tones = {
    blue: dark ? "bg-blue-900 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/10",
    red: dark ? "bg-red-900 text-red-400 border-red-800" : "bg-red-50 text-red-500 border-red-100 shadow-red-500/10",
    yellow: dark ? "bg-amber-900 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10",
    slate: dark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-500/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-[2.5rem] border p-6 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg",
        tones[tone]
      )}
    >
      <div className="mb-3 transform transition-transform group-hover:scale-110">{icon}</div>
      <p className="text-sm font-black uppercase tracking-widest">{title}</p>
    </button>
  );
}