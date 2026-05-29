import React, { useState } from "react";
import { ArrowLeft, User, X, Shield, Wallet, CreditCard, Bell, Sparkles } from "lucide-react";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";

export function Header({ title, subtitle, onBack, dark = false }) {
  const { userData, budgets, subscriptions, bills } = useUserData();
  const [showModal, setShowModal] = useState(false);

  const displayName = userData?.displayName || "Guest User";
  const email = userData?.email || "guest@pocketworth.com";
  const currency = userData?.currency || "NPR";
  const isDarkTheme = userData?.isDarkMode || false;
  const balance = userData?.balance || 0;

  return (
    <div className="mb-5 flex items-start justify-between relative">
      <div className="flex items-start gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className={cn(
              "mt-1 flex h-10 w-10 items-center justify-center rounded-full transition-all",
              dark ? "bg-slate-800/50 text-slate-100 hover:bg-slate-800" : "bg-white text-slate-700 shadow-sm"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}
        <div>
          {subtitle ? <p className={cn("text-xs font-black uppercase tracking-widest leading-none mb-1", dark ? "text-slate-500" : "text-slate-400")}>{subtitle}</p> : null}
          <h2 className={cn("text-4xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{title}</h2>
        </div>
      </div>
      
      <div 
        onClick={() => setShowModal(true)}
        className={cn(
          "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm border transition-all cursor-pointer hover:scale-105",
          dark ? "bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700" : "bg-white border-slate-100 text-blue-600 hover:bg-slate-50"
        )}
      >
        <User className="h-5 w-5" />
      </div>

      {/* Glassmorphic User Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className={cn(
            "w-full max-w-sm rounded-[2.5rem] border p-6 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden",
            dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
          )}>
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            <button 
              onClick={() => setShowModal(false)}
              className={cn(
                "absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                dark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700"
              )}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Profile Avatar & Primary Details */}
            <div className="flex flex-col items-center text-center mt-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg text-white mb-4">
                <User className="h-10 w-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{displayName}</h3>
              <p className={cn("text-xs font-semibold mt-1", dark ? "text-slate-400" : "text-slate-500")}>{email}</p>
              
              <div className={cn(
                "mt-4 rounded-2xl px-5 py-2.5 border font-bold text-xs uppercase tracking-widest shadow-sm",
                dark ? "bg-slate-950 border-slate-800 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
              )}>
                Net Balance: {formatMoney(balance, currency)}
              </div>
            </div>

            {/* Account Settings / Meta Stats */}
            <div className="mt-6 space-y-3.5">
              <h4 className={cn("text-[10px] font-black uppercase tracking-widest px-1", dark ? "text-slate-500" : "text-slate-400")}>Preferences</h4>
              <div className={cn("rounded-3xl border p-4 space-y-2.5", dark ? "bg-slate-950/50 border-slate-800/80" : "bg-slate-50/50 border-slate-100")}>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Display Currency</span>
                  <span className="text-blue-500">{currency}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Theme Preference</span>
                  <span>{isDarkTheme ? "Sleek Dark" : "Vibrant Light"}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Verification</span>
                  <span className="flex items-center gap-1 text-emerald-500"><Shield className="h-3 w-3" /> Secure</span>
                </div>
              </div>

              <h4 className={cn("text-[10px] font-black uppercase tracking-widest px-1 pt-2", dark ? "text-slate-500" : "text-slate-400")}>Active Asset Tracks</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className={cn("rounded-2xl border p-3 flex flex-col items-center justify-center text-center", dark ? "bg-slate-950/30 border-slate-800" : "bg-slate-50 border-slate-100")}>
                  <Wallet className="h-4 w-4 text-blue-500 mb-1" />
                  <span className="text-xs font-black">{budgets?.length || 0}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Budgets</span>
                </div>
                <div className={cn("rounded-2xl border p-3 flex flex-col items-center justify-center text-center", dark ? "bg-slate-950/30 border-slate-800" : "bg-slate-50 border-slate-100")}>
                  <CreditCard className="h-4 w-4 text-indigo-500 mb-1" />
                  <span className="text-xs font-black">{subscriptions?.length || 0}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Subs</span>
                </div>
                <div className={cn("rounded-2xl border p-3 flex flex-col items-center justify-center text-center", dark ? "bg-slate-950/30 border-slate-800" : "bg-slate-50 border-slate-100")}>
                  <Bell className="h-4 w-4 text-amber-500 mb-1" />
                  <span className="text-xs font-black">{bills?.length || 0}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Bills</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}