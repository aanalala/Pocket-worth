import React from "react";

export function MetricHero({
  title,
  value,
  subValue,
  footer,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-5 text-white shadow-xl shadow-blue-500/25">
      <div className="absolute -left-6 top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-10 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <p className="relative z-10 text-sm text-blue-100">{title}</p>
      <div className="relative z-10 mt-2 flex items-end gap-3">
        <h3 className="text-4xl font-bold">{value}</h3>
        {subValue ? <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-blue-50">{subValue}</span> : null}
      </div>
      {footer ? <div className="relative z-10 mt-4">{footer}</div> : null}
    </div>
  );
}