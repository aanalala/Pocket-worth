import React from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { MetricHero } from "../components/MetricHero";
import { SectionCard } from "../components/SectionCard";
import { BottomNav } from "../components/BottomNav";
import { formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { getMonthlyTrends } from "../utils/dataTransform";
import { Loader2, TrendingUp, Sparkles, PieChart } from "lucide-react";
import { cn } from "../utils/utils";

export function SavingsTrackerScreen({ setActiveScreen }) {
  const { userData, transactions, loading } = useUserData();

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans tracking-tight", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-black leading-none uppercase tracking-widest">Analyzing Growth</h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Crunching Transaction Data</p>
        </div>
      </PhoneShell>
    );
  }

  // Calculate savings growth from monthly trends (Income - Expenses)
  const monthlyTrends = getMonthlyTrends(transactions);
  const savingsData = monthlyTrends.map(item => ({
    month: item.month,
    value: Math.max(0, item.income - item.expenses)
  }));

  const totalAnnualSavings = savingsData.reduce((sum, item) => sum + item.value, 0);
  const avgMonthlySavings = savingsData.length > 0 ? Math.round(totalAnnualSavings / savingsData.length) : 0;
  const hasData = transactions.length > 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Savings" 
          subtitle="Growth & Tracking" 
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <MetricHero 
          title="This Month's Savings" 
          value={formatMoney(userData?.income - userData?.expenses || 0, currency)} 
          subValue={hasData ? "Real-time accuracy" : "Start logging to see progress"} 
        />

        <div className="mt-6 space-y-6">
          <SectionCard title="Savings Growth" dark={dark}>
            {hasData ? (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsData}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8', fontWeight: 800 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8', fontWeight: 800 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '2rem', border: 'none', background: dark ? '#1e293b' : '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: '16px 20px' }}
                      formatter={(value) => formatMoney(value, currency)} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorSavings)" 
                      strokeWidth={4} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={cn(
                 "h-64 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed transition-all",
                 dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
              )}>
                <TrendingUp className="h-10 w-10 text-slate-300 mb-4" />
                <p className={cn("text-sm font-black uppercase tracking-widest text-center px-10 leading-tight", dark ? "text-white/40" : "text-slate-500")}>Your savings trend will appear here</p>
              </div>
            )}
          </SectionCard>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
               "rounded-[2.5rem] border p-6 shadow-sm shadow-slate-100/50 transition-all duration-300",
               dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-white border-slate-100 shadow-slate-100/50 hover:shadow-lg"
            )}>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>Total Period</p>
              <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(totalAnnualSavings, currency)}</p>
            </div>
            <div className={cn(
               "rounded-[2.5rem] border p-6 shadow-sm shadow-slate-100/50 transition-all duration-300",
               dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-white border-slate-100 shadow-slate-100/50 hover:shadow-lg"
            )}>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>Avg Monthly</p>
              <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(avgMonthlySavings, currency)}</p>
            </div>
          </div>

          <SectionCard title="Insights" dark={dark}>
            <div className="space-y-4 pt-2">
              {hasData ? (
                <>
                  <div className={cn(
                     "flex items-start gap-4 p-5 rounded-[2.25rem] border group transition-all",
                     dark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
                  )}>
                    <div className={cn(
                       "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-xl border",
                       dark ? "bg-slate-900 border-white/5 shadow-black/40 text-emerald-400" : "bg-white border-emerald-100 text-emerald-600"
                    )}>🎯</div>
                    <p className={cn("text-[13px] font-bold leading-snug", dark ? "text-slate-300" : "text-emerald-900")}>
                      Your current monthly average is <span className={cn("font-black underline underline-offset-4", dark ? "decoration-emerald-500" : "decoration-emerald-300")}>{formatMoney(avgMonthlySavings, currency)}</span>.
                    </p>
                  </div>
                  <div className={cn(
                     "flex items-start gap-4 p-5 rounded-[2.25rem] border group transition-all",
                     dark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
                  )}>
                    <div className={cn(
                       "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-xl border",
                       dark ? "bg-slate-900 border-white/5 shadow-black/40 text-blue-400" : "bg-white border-blue-100 text-blue-600"
                    )}>💪</div>
                    <p className={cn("text-[13px] font-bold leading-snug", dark ? "text-slate-300" : "text-blue-900")}>
                      You've successfully tracked {transactions.length} items. Keep building your financial history!
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center text-center px-6">
                  <Sparkles className="h-10 w-10 text-yellow-400 mb-4 animate-pulse shadow-2xl" />
                  <h4 className={cn("text-base font-black tracking-tight uppercase tracking-widest leading-none mb-2", dark ? "text-white" : "text-slate-900")}>Awaiting Data</h4>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest leading-tight", dark ? "text-slate-500" : "text-slate-400")}>Add your first income and expense to unlock real-time financial insights.</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <BottomNav active="savings" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}