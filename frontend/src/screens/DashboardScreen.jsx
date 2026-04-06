import React from "react";
import { TrendingUp, TrendingDown, Plus, Sparkles, Loader2, PieChart as PieIcon, LayoutGrid } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { MetricHero } from "../components/MetricHero";
import { QuickAction } from "../components/QuickAction";
import { SectionCard } from "../components/SectionCard";
import { BottomNav } from "../components/BottomNav";
import { formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { getSpendingByCategory, getMonthlyTrends } from "../utils/dataTransform";
import { cn } from "../utils/utils";

export function DashboardScreen({ setActiveScreen }) {
  const { userData, transactions, goals, loading } = useUserData();

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans px-8 text-center", dark ? "bg-[#0f172a] text-slate-100" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest leading-none">Syncing Assets</h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected to Secure Stream</p>
        </div>
      </PhoneShell>
    );
  }

  // Live Metrics
  const balance = userData?.balance || 0;
  const income = userData?.income || 0;
  const expenses = userData?.expenses || 0;
  const displayName = userData?.displayName || "User";

  // Data Aggregation for Charts
  const spendingData = getSpendingByCategory(transactions);
  const monthlyTrends = getMonthlyTrends(transactions);
  const hasTransactions = transactions.length > 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-6 pt-6 font-sans">
        <Header 
          title="Dashboard" 
          subtitle={`Welcome back, ${displayName}`} 
          dark={dark} 
        />

        <MetricHero
          title="Current Balance"
          value={formatMoney(balance, currency)}
          footer={
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Income</p>
                <p className="mt-1 text-lg font-black tracking-tight">{formatMoney(income, currency)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Expenses</p>
                <p className="mt-1 text-lg font-black tracking-tight">{formatMoney(expenses, currency)}</p>
              </div>
            </div>
          }
        />

        <div className="mt-6">
          <h3 className={cn("mb-4 text-2xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={<TrendingUp className="h-6 w-6" />} title="Add Income" tone="blue" dark={dark} onClick={() => setActiveScreen("income")} />
            <QuickAction icon={<TrendingDown className="h-6 w-6" />} title="Add Expense" tone="red" dark={dark} onClick={() => setActiveScreen("expense")} />
            <QuickAction icon={<Plus className="h-6 w-6" />} title="Set Goal" tone="yellow" dark={dark} onClick={() => setActiveScreen("goals")} />
            <QuickAction icon={<Sparkles className="h-6 w-6" />} title="View Insights" tone="slate" dark={dark} onClick={() => setActiveScreen("insights")} />
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {/* Spending by Category */}
          <SectionCard 
            title="Spending Distribution" 
            action="Details →" 
            dark={dark} 
            onActionClick={() => setActiveScreen("categories")}
          >
            {hasTransactions ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendingData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={4} stroke="none">
                        {spendingData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '2rem', border: 'none', background: dark ? '#1e293b' : '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: '16px 20px' }}
                        itemStyle={{ fontWeight: 800, fontSize: '14px', color: dark ? '#fff' : '#0f172a' }}
                        formatter={(val) => formatMoney(val, currency)} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {spendingData.slice(0, 4).map((item, index) => (
                    <div key={index} className={cn(
                      "rounded-2xl border p-4 transition-all duration-300", 
                      dark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>{item.name}</span>
                      </div>
                      <p className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{formatMoney(item.value, currency)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={cn(
                "flex flex-col items-center justify-center h-64 rounded-[2.5rem] border-2 border-dashed",
                dark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
              )}>
                <PieIcon className="h-10 w-10 text-slate-300 mb-4" />
                <p className={cn("text-sm font-black uppercase tracking-widest", dark ? "text-white/40" : "text-slate-500")}>No spending data yet</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Add an expense to see your distribution</p>
              </div>
            )}
          </SectionCard>

          {/* Income vs Expenses Trend */}
          <SectionCard title="Cashflow Trend" dark={dark}>
            {hasTransactions ? (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid vertical={false} stroke={dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8', fontWeight: 800 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8', fontWeight: 800 }} />
                    <Tooltip 
                      cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
                      contentStyle={{ borderRadius: '2rem', border: 'none', background: dark ? '#1e293b' : '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: '16px 20px' }}
                      formatter={(val) => formatMoney(val, currency)} 
                    />
                    <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                    <Bar dataKey="expenses" radius={[4, 4, 0, 0]} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={cn(
                "flex flex-col items-center justify-center h-64 rounded-[2.5rem] border-2 border-dashed",
                dark ? "bg-slate-800/20 border-slate-700/50" : "bg-slate-50 border-slate-200"
              )}>
                <LayoutGrid className="h-10 w-10 text-slate-700 mb-4 opacity-20" />
                <p className={cn("text-xs font-black uppercase tracking-widest text-center px-8 leading-tight", dark ? "text-slate-500" : "text-slate-400")}>Your cashflow chart will appear here</p>
              </div>
            )}
          </SectionCard>

          {/* Savings Goals */}
          <SectionCard 
            title="Savings Progress" 
            action="View All →" 
            dark={dark}
            onActionClick={() => setActiveScreen("goals")}
          >
            {goals.length > 0 ? (
              <div className="space-y-6 pt-2">
                {goals.slice(0, 2).map((goal, idx) => {
                  const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                  return (
                    <div key={idx} className="group">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className={cn("text-sm font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{goal.name}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-wider", dark ? "text-slate-500" : "text-slate-400")}>
                            {formatMoney(goal.current, currency)} / {formatMoney(goal.target, currency)}
                          </p>
                        </div>
                        <span className={cn(
                          "text-xs font-black px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm",
                          dark ? "bg-slate-900 text-slate-100 border-white/10" : "bg-slate-50 text-slate-700 border-slate-200"
                        )}>{progress}%</span>
                      </div>
                      <div className={cn(
                        "h-3 rounded-full p-0.5 border shadow-inner overflow-hidden shadow-sm",
                        dark ? "bg-slate-900/50 border-white/5" : "bg-slate-100 border-slate-200"
                      )}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progress}%`, backgroundColor: goal.color || '#3b82f6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center mb-6 border shadow-inner transition-all",
                  dark ? "bg-slate-900 border-white/5 shadow-black/40" : "bg-yellow-50 border-yellow-100 shadow-yellow-200/50"
                )}>
                  <span className="text-3xl">🏆</span>
                </div>
                <h4 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900 font-bold")}>No Active Savings Goals</h4>
                <p className={cn("text-xs font-bold uppercase tracking-widest mt-1", dark ? "text-slate-500" : "text-slate-400")}>Start small and grow your worth</p>
                <button 
                  onClick={() => setActiveScreen("goals")}
                  className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </SectionCard>
        </div>

        <BottomNav active="dashboard" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}