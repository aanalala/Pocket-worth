import React from "react";
import { Calendar, TrendingUp, DollarSign, TrendingDown, Zap, PieChart as PieChartIcon, Loader2, Sparkles } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SectionCard } from "../components/SectionCard";
import { BottomNav } from "../components/BottomNav";
import { formatMoney, cn } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { getMonthlyTrends, getBudgetStatus } from "../utils/dataTransform";

export function InsightsScreen({ setActiveScreen }) {
  const { userData, transactions, loading } = useUserData();

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans tracking-tight", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-widest leading-none">Crunching Numbers</h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Smart Insights</p>
        </div>
      </PhoneShell>
    );
  }

  const trends = getMonthlyTrends(transactions);
  const currentMonthData = trends.length > 0 ? trends[trends.length - 1] : { income: 0, expenses: 0 };
  const prevMonthData = trends.length > 1 ? trends[trends.length - 2] : { income: 0, expenses: 0 };

  const currentMonthSpending = currentMonthData.expenses;
  const previousMonthSpending = prevMonthData.expenses;
  const delta = previousMonthSpending - currentMonthSpending;

  const budgetList = getBudgetStatus(transactions, 1000);
  const hasTransactions = transactions.length > 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Insights" 
          subtitle="Smart Analysis" 
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className={cn(
             "rounded-[2.5rem] border p-6 shadow-sm shadow-slate-100/50 transition-all duration-300",
             dark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-slate-100/50"
          )}>
            <div className={cn(
               "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm border",
               dark ? "bg-slate-900 border-white/5 text-blue-400 shadow-black/40" : "bg-blue-50 border-blue-100 text-blue-600"
            )}>
              <Calendar className="h-6 w-6" />
            </div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", dark ? "text-slate-500" : "text-slate-400")}>Daily Avg</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>
              {formatMoney(currentMonthSpending / 30, currency)}
            </p>
          </div>
          <div className={cn(
             "rounded-[2.5rem] border p-6 shadow-sm shadow-slate-100/50 transition-all duration-300",
             dark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-slate-100/50"
          )}>
            <div className={cn(
               "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm border",
               dark ? "bg-slate-900 border-white/5 text-amber-400 shadow-black/40" : "bg-amber-50 border-amber-100 text-amber-600 shadow-sm"
            )}>
              <Zap className="h-6 w-6" />
            </div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", dark ? "text-slate-500" : "text-slate-400")}>Efficiency</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>
              {currentMonthData.income > 0 ? Math.round((currentMonthData.income - currentMonthData.expenses) / currentMonthData.income * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h3 className={cn("px-1 mb-5 text-2xl font-black tracking-tight", dark ? "text-white" : "text-slate-900 font-bold")}>Personalized Tips</h3>
            {hasTransactions ? (
              <div className="space-y-4">
                {[
                  {
                    title: "Income vs Spend",
                    text: `You've spent ${Math.round((currentMonthSpending / (currentMonthData.income || 1)) * 100)}% of your income so far.`,
                    icon: <TrendingUp className="h-6 w-6" />,
                    bg: dark ? "bg-blue-600/10 border-blue-500/20" : "bg-blue-50/50 border-blue-100",
                    iconBg: dark ? "bg-blue-600/30 text-blue-400" : "bg-blue-600 text-white",
                  },
                  {
                    title: "Top Category",
                    text: budgetList.length > 0 ? `${budgetList[0].name} accounts for ${formatMoney(budgetList[0].spent, currency)}.` : "Add expenses to see top category.",
                    icon: <DollarSign className="h-6 w-6" />,
                    bg: dark ? "bg-amber-600/10 border-amber-500/20" : "bg-amber-50/50 border-amber-100",
                    iconBg: dark ? "bg-amber-600/30 text-amber-400" : "bg-amber-600 text-white",
                  },
                  {
                    title: "Spending Velocity",
                    text: delta >= 0 ? `You're ${formatMoney(delta, currency)} below last month's pace. Solid work!` : `You're ${formatMoney(Math.abs(delta), currency)} above last month. Focus up!`,
                    icon: <TrendingDown className="h-6 w-6" />,
                    bg: delta >= 0 ? (dark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100") : (dark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"),
                    iconBg: delta >= 0 ? (dark ? "bg-emerald-500/30 text-emerald-400" : "bg-emerald-600 text-white") : (dark ? "bg-red-500/30 text-red-400" : "bg-red-500 text-white"),
                  },
                ].map((item, idx) => (
                  <div key={idx} className={cn("rounded-[2.5rem] p-6 border shadow-sm transition-all duration-300 hover:shadow-xl", item.bg)}>
                    <div className="flex gap-5">
                      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xl transition-transform hover:scale-110", item.iconBg)}>
                         {item.icon}
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className={cn("text-lg font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{item.title}</p>
                        <p className={cn("mt-2 text-sm font-bold leading-snug", dark ? "text-slate-400" : "text-slate-600")}>{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                 "py-16 rounded-[4rem] border-2 border-dashed flex flex-col items-center text-center px-10 transition-all",
                 dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-slate-50 border-slate-200"
              )}>
                 <Sparkles className="h-10 w-10 text-slate-300 mb-4 animate-pulse duration-[3000ms]" />
                 <h4 className={cn("text-lg font-black leading-none tracking-tight", dark ? "text-white" : "text-slate-900")}>Awaiting Activity</h4>
                 <p className={cn("text-[10px] font-black uppercase tracking-widest mt-2 px-6 leading-tight", dark ? "text-slate-500" : "text-slate-400")}>Smart tips will be generated after your first 3 transactions</p>
              </div>
            )}
          </section>

          <SectionCard title="Monthly Spending Alpha" dark={dark}>
            <div className="space-y-10 pt-2">
              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>Previous Month</span>
                  <span className={cn("text-sm font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{formatMoney(previousMonthSpending, currency)}</span>
                </div>
                <div className={cn("h-4 rounded-full p-1 border shadow-inner transition-all", dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-slate-100 border-slate-50")}>
                  <div className="h-full w-full rounded-full bg-slate-400 shadow-sm transition-all" />
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-blue-500" : "text-blue-600")}>Current Period</span>
                  <span className={cn("text-sm font-black tracking-tight", dark ? "text-blue-600" : "text-blue-600 font-bold")}>{formatMoney(currentMonthSpending, currency)}</span>
                </div>
                <div className={cn("h-4 rounded-full p-1 border shadow-inner transition-all", dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-blue-50 border-blue-100/50 shadow-inner")}>
                  <div 
                    className="h-full rounded-full bg-blue-600 shadow-2xl shadow-blue-500/40 transition-all duration-1000 ease-in-out" 
                    style={{ width: `${Math.min(100, Math.round((currentMonthSpending / (previousMonthSpending || 1)) * 100))}%` }}
                  />
                </div>
              </div>
              {hasTransactions && (
                <div className={cn(
                  "rounded-[2.5rem] p-7 text-white shadow-2xl flex items-center gap-6 transition-all hover:scale-[1.02] shadow-xl",
                  delta >= 0 ? (dark ? "bg-emerald-600/90 shadow-emerald-500/20" : "bg-emerald-600") : (dark ? "bg-red-500/90 shadow-red-500/20" : "bg-red-500")
                )}>
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-2xl shadow-black shadow-inner">
                     <Zap className="h-9 w-9 text-white group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="flex flex-col justify-center">
                     <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Observation</p>
                     <p className="text-lg font-black leading-tight tracking-tight">
                        {delta >= 0 
                          ? `You've saved ${formatMoney(delta, currency)} more than last month!` 
                          : `Spending is up by ${formatMoney(Math.abs(delta), currency)} this month.`}
                     </p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Budget Alpha" action="Details →" dark={dark} onActionClick={() => setActiveScreen("categories")}>
            <div className="space-y-6 pt-4">
              {budgetList.length > 0 ? (
                budgetList.slice(0, 4).map((category, idx) => (
                  <div key={idx} className="flex flex-col gap-2 group transition-all">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-4 rounded-full shadow-2xl transition-all group-hover:scale-125" style={{ backgroundColor: category.color }} />
                        <span className={cn("text-sm font-black tracking-tight leading-none", dark ? "text-slate-300" : "text-slate-800")}>{category.name}</span>
                      </div>
                      <span className={cn("text-[10px] font-black tracking-widest uppercase leading-none shadow-sm px-2 py-0.5 rounded-lg border", dark ? "text-slate-500 bg-slate-900 border-white/5" : "text-slate-400 bg-slate-50 border-slate-100")}>{category.percent}% used</span>
                    </div>
                    <div className={cn(
                       "h-4 rounded-full p-1 border shadow-inner overflow-hidden",
                       dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-slate-100 border-slate-200 shadow-slate-100"
                    )}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-2xl" 
                        style={{ width: `${category.percent}%`, backgroundColor: category.color }} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 flex flex-col items-center">
                   <PieChartIcon className="h-10 w-10 text-slate-200 mb-3 animate-[spin_4s_linear_infinite]" />
                   <p className={cn("text-xs font-black uppercase tracking-widest", dark ? "text-slate-600" : "text-slate-400")}>No Category Data</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <BottomNav active="insights" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}