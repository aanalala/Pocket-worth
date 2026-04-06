import React, { useMemo } from "react";
import { Lightbulb } from "lucide-react";

export function ProjectNotes() {
  const notes = useMemo(
    () => [
      "Single-file React + Tailwind implementation for the Pocket Worth UI.",
      "Charts use Recharts to match the proposal's emphasis on visual reports and insights.",
      "Authentication, dashboard, transactions, goals, analytics, budgets, savings, net worth, and settings are included.",
      "The screen selector preserves the same order as the uploaded UI PDFs.",
      "Ready to split into route-based pages or reusable modules for production.",
    ],
    []
  );

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Implementation Notes</h3>
          <p className="text-sm text-slate-500">Built around the uploaded UI flow and project proposal.</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        {notes.map((note) => (
          <div key={note} className="rounded-xl bg-slate-50 px-3 py-2">• {note}</div>
        ))}
      </div>
    </div>
  );
}