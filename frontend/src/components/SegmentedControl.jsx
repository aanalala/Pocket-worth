import React from "react";
import { cn } from "../utils/utils";

export function SegmentedControl({
  options,
  value,
  onChange,
  activeClassName = "bg-blue-600 text-white shadow-lg shadow-blue-500/25",
  baseClassName = "bg-white/70 text-slate-600",
}) {
  return (
    <div className="grid grid-cols-2 rounded-full border border-blue-100 bg-blue-50/60 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
            value === option.value ? activeClassName : baseClassName
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}