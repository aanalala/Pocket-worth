import React from "react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { formatMoney } from "../utils/utils";
import { cn } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { getBudgetStatus } from "../utils/dataTransform";
import { PieChart, Loader2 } from "lucide-react";

export function CategoriesScreen({ setActiveScreen }) {
  const { userData, transactions, loading } = useUserData();

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans tracking-tight", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Loading Categories</p>
        </div>
      </PhoneShell>
    );
  }

  // Calculate live budget status from transactions
  const budgetList = getBudgetStatus(transactions, 1000); // Defaulting budget to $1000 for each category
  const totalSpent = budgetList.reduce((sum, item) => sum + item.spent, 0);
  const totalBudget = budgetList.reduce((sum, item) => sum + item.budget, 0);
  const totalPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const hasTransactions = transactions.length > 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-6 pt-8 font-sans">
        <Header 
          title="Budgets" 
          subtitle="Monthly Spending" 
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className={cn(
          "mb-8 rounded-[2.5rem] border p-7 shadow-xl shadow-blue-500/5 transition-all duration-300",
          dark ? "bg-blue-600/10 border-blue-500/20 shadow-black/20" : "bg-blue-50/30 border-blue-100 shadow-blue-500/5 border-dashed"
        )}>
          <div className="flex items-center justify-between mb-5">
             <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-blue-400" : "text-blue-600")}>Total Spending Status</p>
                <p className={cn("mt-1 text-3xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                  {formatMoney(totalSpent, currency)} <span className="text-lg font-medium text-slate-400 tracking-tighter">/ {formatMoney(totalBudget || 1000, currency)}</span>
                </p>
             </div>
             <div className={cn(
               "h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl transition-all",
               totalPercent > 90 ? "bg-red-500 text-white shadow-red-500/40" : "bg-blue-600 text-white shadow-blue-500/40"
             )}>
               {totalPercent}%
             </div>
          </div>
          <div className={cn(
             "h-4 w-full rounded-full p-1 shadow-inner",
             dark ? "bg-slate-900 border border-white/5" : "bg-blue-100/50"
          )}>
             <div 
               className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-lg", totalPercent > 90 ? "bg-red-500" : "bg-blue-600")}
               style={{ width: `${Math.min(totalPercent, 100)}%` }}
             />
          </div>
        </div>

        <div className="space-y-5">
          <h3 className={cn("px-1 text-2xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Spending Categories</h3>
          
          {hasTransactions ? (
            budgetList.map((item, idx) => {
              const percent = Math.min(100, Math.round((item.spent / item.budget) * 100));
              return (
                <div key={idx} className={cn(
                   "group rounded-[2.5rem] border p-6 transition-all duration-300 hover:scale-[1.02] active:scale-95",
                   dark ? "bg-white/5 border-white/5 shadow-xl shadow-black/20" : "bg-white border-slate-100 shadow-sm shadow-slate-100/50"
                )}>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-2xl" style={{ backgroundColor: item.color, boxShadow: `0 12px 30px ${item.color}44` }}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className={cn("text-xl font-black leading-tight tracking-tight", dark ? "text-white" : "text-slate-900")}>{item.name}</h4>
                        <p className={cn("text-xs font-bold uppercase tracking-tighter", dark ? "text-slate-500" : "text-slate-500")}>
                          {formatMoney(item.spent, currency)} spent of {formatMoney(item.budget, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("text-lg font-black tracking-tighter leading-none", dark ? "text-white" : "text-slate-900")}>{percent}%</span>
                      <span className={cn("text-[10px] font-black uppercase tracking-tighter mt-1", dark ? "text-slate-500" : "text-slate-400")}>Budget</span>
                    </div>
                  </div>
                  <div className={cn(
                     "h-3 rounded-full shadow-inner p-0.5 border overflow-hidden",
                     dark ? "bg-slate-900 border-white/5" : "bg-slate-100 border-slate-50"
                  )}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/10" 
                      style={{ width: `${percent}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className={cn(
              "flex flex-col items-center justify-center h-72 rounded-[3.5rem] border-2 border-dashed p-10 text-center transition-all duration-500",
              dark ? "bg-white/5 border-white/10 shadow-black/20" : "bg-slate-50 border-slate-200"
            )}>
              <div className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-2xl border transition-all",
                dark ? "bg-slate-900 border-white/10 shadow-black/40" : "bg-white border-slate-100 shadow-slate-200"
              )}>
                <PieChart className="h-10 w-10 text-slate-300 animate-pulse" />
              </div>
              <h4 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>No Spending Logged</h4>
              <p className={cn("text-xs font-bold uppercase tracking-widest mt-2 px-8 leading-tight", dark ? "text-slate-500" : "text-slate-400")}>Add expenses to see your categories here</p>
              <button 
                onClick={() => setActiveScreen("expense")}
                className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                Log First Expense
              </button>
            </div>
          )}
        </div>

        <BottomNav active="categories" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}