import React from "react";
import { Plus, Bell, Calendar, CreditCard, Loader2, Trash2, ShieldCheck, Zap } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SectionCard } from "../components/SectionCard";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";


export function SubscriptionTrackerScreen({ setActiveScreen, dark = false }) {
  const { userData, subscriptions, loading } = useUserData();
  const currency = userData?.currency || "USD";

  const totalMonthly = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Subscriptions" 
          subtitle="Manage recurring payments"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-500 p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Monthly Total</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight">{formatMoney(totalMonthly, currency)}</h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Zap className="h-8 w-8 text-yellow-300" />
              </div>
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-indigo-100">
              {subscriptions.length} Active Subscriptions
            </p>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Active</h3>
              <button 
                onClick={() => setActiveScreen("expense")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {subscriptions.map((sub) => (
              <div 
                key={sub.id}
                className={cn(
                  "group flex items-center justify-between rounded-[2.25rem] border p-5 transition-all hover:scale-[1.01] active:scale-100",
                  dark ? "bg-slate-800 border-slate-700 shadow-xl shadow-black/10" : "bg-white border-slate-100 shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-inner",
                    dark ? "bg-slate-900" : "bg-slate-50"
                  )}>
                    {sub.icon}
                  </div>
                  <div>
                    <h4 className={cn("text-base font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{sub.name}</h4>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>
                      Next: {new Date(sub.nextBilling).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                    {formatMoney(sub.amount, currency)}
                  </p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest text-blue-500")}>
                    {sub.cycle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Recommendations */}
          <div className={cn(
            "rounded-[2.5rem] border p-7",
            dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200 border-dashed"
          )}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className={cn("text-sm font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Optimization Insight</h4>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                  You have 3 entertainment subscriptions. Switching to a family plan could save you up to $12.00/month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
