import React from "react";
import { Wallet, CreditCard, ArrowUpRight, TrendingUp, PieChart as PieChartIcon, Activity, Loader2, Sparkles, Plus } from "lucide-react";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { MetricHero } from "../components/MetricHero";
import { SectionCard } from "../components/SectionCard";
import { BottomNav } from "../components/BottomNav";
import { formatMoney } from "../utils/utils";
import { cn } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { getNetWorthHistory } from "../utils/dataTransform";

export function NetWorthScreen({ setActiveScreen }) {
  const { userData, transactions, loading } = useUserData();

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans tracking-tight", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-widest leading-none">Mapping Assets</h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-Time Valuation Active</p>
        </div>
      </PhoneShell>
    );
  }

  const currentBalance = userData?.balance || 0;
  const history = getNetWorthHistory(currentBalance, transactions);
  const diff = history.length >= 2 ? history[history.length - 1].value - history[history.length - 2].value : 0;
  const hasHistory = transactions.length > 0;

  // Derive assets from current balance and other metrics
  const assets = [
    { name: "Cash & Savings", subtitle: "Bank accounts", value: currentBalance, icon: Wallet, color: "#3b82f6" },
    { name: "Investments", subtitle: "Stocks, crypto", value: 0, icon: TrendingUp, color: "#8b5cf6" },
    { name: "Property", subtitle: "Real estate", value: 0, icon: Activity, color: "#06b6d4" },
  ];

  const totalAssets = assets.reduce((sum, item) => sum + item.value, 0);

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Net Worth" 
          subtitle="Financial Standing" 
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <MetricHero 
          title="Total Net Worth" 
          value={formatMoney(currentBalance, currency)} 
          subValue={
            <div className="flex items-center gap-1 font-bold">
              {diff >= 0 ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : <div className="h-4 w-4 bg-red-400 rounded-full" />}
              <span className={diff >= 0 ? "text-emerald-400" : "text-red-400"}>
                {formatMoney(Math.abs(diff), currency)} this month
              </span>
            </div>
          } 
        />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={cn(
             "rounded-[2.5rem] border p-6 shadow-sm transition-all duration-300 shadow-slate-100/50",
             dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-white border-slate-100"
          )}>
            <div className={cn(
               "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border",
               dark ? "bg-slate-900 border-white/5 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
            )}>
              <Wallet className="h-7 w-7" />
            </div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", dark ? "text-slate-500" : "text-slate-400")}>Total Assets</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(totalAssets, currency)}</p>
          </div>
          <div className={cn(
             "rounded-[2.5rem] border p-6 shadow-sm transition-all duration-300 shadow-slate-100/50",
             dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-white border-slate-100"
          )}>
            <div className={cn(
               "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border",
               dark ? "bg-slate-900 border-white/5 text-red-100" : "bg-red-50 border-red-100 text-red-500"
            )}>
              <CreditCard className="h-7 w-7" />
            </div>
            <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", dark ? "text-slate-500" : "text-slate-400")}>Debt</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(0, currency)}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <SectionCard title="Net Worth Progression" dark={dark}>
            {hasHistory ? (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorNetWorth)" 
                      strokeWidth={4} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={cn(
                "h-64 flex flex-col items-center justify-center rounded-[3.5rem] border-2 border-dashed p-10 text-center transition-all duration-500",
                dark ? "bg-white/5 border-white/10 shadow-black/20" : "bg-slate-50 border-slate-200"
              )}>
                <TrendingUp className="h-10 w-10 text-slate-200 mb-4 animate-bounce duration-[2000ms]" />
                <p className={cn("text-sm font-black uppercase tracking-widest leading-tight", dark ? "text-white/40" : "text-slate-400")}>Growth history will appear as you log transactions</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Asset Breakdown" dark={dark}>
            <div className="space-y-4 pt-2">
              {assets.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={cn(
                    "group flex items-center justify-between rounded-[2.5rem] p-5 border transition-all duration-300 shadow-sm shadow-slate-100/50",
                    dark ? "bg-white/5 border-white/5 hover:bg-white/10 shadow-black/20" : "bg-slate-50 border-slate-100 hover:bg-white"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 border",
                        dark ? "bg-slate-900 border-white/5 text-blue-400 shadow-black/40" : "bg-white border-slate-50 text-blue-600 shadow-slate-200/50"
                      )}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className={cn("font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{item.name}</p>
                        <p className={cn("mt-1 text-[10px] font-black uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={cn("text-xl font-black tracking-tighter leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(item.value, currency)}</p>
                       <p className="mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</p>
                    </div>
                  </div>
                );
              })}
              
              <button 
                onClick={() => setActiveScreen("income")}
                className={cn(
                  "w-full mt-4 flex items-center justify-center gap-4 rounded-[2rem] border p-7 text-xs font-black uppercase tracking-widest transition-all duration-300 group shadow-lg active:scale-95",
                  dark ? "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20" : "bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50 cursor-pointer"
                )}
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 group-hover:scale-125" />
                Add More Assets
              </button>
            </div>
          </SectionCard>

          <div className={cn(
             "rounded-[3.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500",
             dark ? "bg-slate-900 shadow-black/60" : "bg-slate-900 shadow-slate-900/40"
          )}>
             <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                <Sparkles className="h-32 w-32" />
             </div>
             <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-2xl shadow-blue-500/40 animate-pulse transition-all">🎉</div>
                   <p className="text-xl font-black tracking-tight leading-none text-white">Net Worth Milestone</p>
                </div>
                <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[280px]">
                  {hasHistory ? `Your net worth has shifted by ${formatMoney(Math.abs(diff), currency)} recently. Every log brings you closer to your multi-figure goals!` : "Your wealth journey begins today. Start logging transactions to visualize your growth charts."}
                </p>
                <button 
                  onClick={() => setActiveScreen("goals")}
                  className="mt-2 w-fit bg-white text-slate-900 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  Set New Goal
                </button>
             </div>
          </div>
        </div>

        <BottomNav active="networth" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}