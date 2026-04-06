import React from "react";

export function FeaturePill({ icon, title }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white/80 px-4 py-4 shadow-sm shadow-slate-200/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-600">{icon}</div>
      <span className="text-sm font-medium text-slate-700">{title}</span>
    </div>
  );
}