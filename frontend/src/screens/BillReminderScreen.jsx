import React from "react";

import { Plus, Bell, Calendar, Home, Wifi, Zap, Smartphone, CheckCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";

export function BillReminderScreen({ setActiveScreen, dark = false }) {
  const { userData, bills, loading } = useUserData();
  const currency = userData?.currency || "USD";

  const unpaidTotal = bills.filter(b => b.status !== "paid").reduce((acc, b) => acc + b.amount, 0);

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
          title="Bill Reminders" 
          subtitle="Never miss a deadline"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="space-y-6">
          {/* Summary Box */}
          <div className={cn(
            "rounded-[2.5rem] border p-7 shadow-xl flex items-center justify-between",
            dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          )}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upcoming Total</p>
              <h3 className={cn("mt-1 text-3xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                {formatMoney(unpaidTotal, currency)}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-inner">
              <Clock className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Bills</h3>
              <button 
                onClick={() => setActiveScreen("expense")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {bills.length > 0 ? (
              bills.map((bill) => (
                <div 
                  key={bill.id}
                  className={cn(
                    "group flex items-center justify-between rounded-[2.25rem] border p-5 transition-all hover:scale-[1.01] active:scale-100",
                    dark ? "bg-slate-800 border-slate-700 shadow-xl shadow-black/10" : "bg-white border-slate-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-colors",
                      bill.status === "paid" ? "bg-green-50 text-green-500" : (bill.status === "due" ? "bg-amber-50 text-amber-500" : (dark ? "bg-slate-900 text-slate-400" : "bg-slate-50 text-slate-400"))
                    )}>
                      {bill.icon}
                    </div>
                    <div>
                      <h4 className={cn("text-base font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{bill.name}</h4>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", bill.status === "due" ? "text-amber-500" : "text-slate-400")}>
                        {bill.status === "paid" ? "Paid" : `Due ${new Date(bill.dueDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                      {formatMoney(bill.amount, currency)}
                    </p>
                    {bill.status !== "paid" && (
                      <button className="rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                        Pay Now
                      </button>
                    )}
                    {bill.status === "paid" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(
                "py-12 flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed",
                dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <p className="text-sm font-black uppercase tracking-widest text-slate-500">No Bills Tracked</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Add your first bill reminder above</p>
              </div>
            )}
          </div>

          {/* Calendar Integration Note */}
          <div className={cn(
            "rounded-[2.5rem] border p-7 text-center border-dashed",
            dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
          )}>
            <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <p className={cn("text-sm font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Sync with Google Calendar</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Enable auto-reminders for all bills</p>
            <button 
              onClick={() => alert("Calendar sync coming soon!")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-100 active:scale-95"
            >
              Connect Calendar <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
