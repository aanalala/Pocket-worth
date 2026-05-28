import React from "react";

import { Plus, Target, AlertTriangle, CheckCircle2, ChevronRight, TrendingDown, PieChart as PieIcon, Loader2 } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";

export function BudgetGoalsScreen({ setActiveScreen, dark = false }) {
  const { userData, budgets, loading } = useUserData();
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
        </div>
      </PhoneShell>
    );
  }

  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalProgress = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Budgets" 
          subtitle="Control your spending"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="space-y-6">
          {/* Main Progress Card */}
          <div className={cn(
            "rounded-[2.5rem] border p-8 shadow-xl",
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Budget Use</p>
                <h3 className={cn("mt-1 text-3xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{totalProgress}%</h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PieIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 p-1 border border-slate-200 shadow-inner overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg transition-all duration-1000" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>By Category</h3>
              <button 
                onClick={() => setActiveScreen("expense")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {budgets.length > 0 ? (
              budgets.map((budget) => {
                const progress = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
                const isWarning = progress >= 80 && progress < 100;
                const isOver = progress >= 100;

                return (
                  <div 
                    key={budget.id}
                    className={cn(
                      "rounded-[2.25rem] border p-6 transition-all hover:scale-[1.01] active:scale-100",
                      dark ? "bg-slate-800 border-slate-700 shadow-xl" : "bg-white border-slate-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.color }} />
                        <h4 className={cn("text-base font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{budget.category}</h4>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border",
                          isOver ? "bg-red-50 text-red-600 border-red-100" : (isWarning ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-100")
                        )}>
                          {progress}% Used
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-3 px-1">
                      <p className={cn("text-sm font-black tracking-tight", dark ? "text-slate-300" : "text-slate-600")}>
                        {formatMoney(budget.spent, currency)} <span className="text-slate-400 font-bold">/ {formatMoney(budget.limit, currency)}</span>
                      </p>
                      {isOver && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
                    </div>

                    <div className={cn(
                      "h-2 w-full rounded-full overflow-hidden p-0.5 border shadow-inner",
                      dark ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"
                    )}>
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 shadow-lg",
                          isOver ? "bg-red-500" : (isWarning ? "bg-amber-500" : "bg-blue-600")
                        )} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={cn(
                "py-12 flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed",
                dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">No Budgets Defined</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Set a spending limit to start tracking</p>
                <button 
                  onClick={() => setActiveScreen("expense")}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Create Budget
                </button>
              </div>
            )}
          </div>

          {/* AI Tip */}
          <div className="rounded-[2.5rem] bg-slate-950 p-7 text-white shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">Budget Strategy</h4>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
                  You've spent 90% of your Entertainment budget with 10 days left in the month. Consider postponing non-essential plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
