import React, { useState } from "react";
import { Moon, Sparkles, DollarSign, Calendar, CreditCard, Wallet, ChevronRight, Home, TrendingUp, Settings, LogOut, Check, ChevronDown } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { BottomNav, PieChartIcon } from "../components/BottomNav";
import { cn } from "../utils/utils";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useUserData } from "../hooks/useUserData";


export function SettingsRow({ icon, title, value, trailing, onClick, dark = false }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-[2rem] px-5 py-4 transition-all cursor-pointer", 
        dark ? "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 shadow-xl shadow-black/10" : "bg-white hover:bg-slate-50 border border-slate-100 shadow-sm shadow-slate-100/50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors", 
          dark ? "bg-slate-900 text-blue-400 border border-slate-700/50" : "bg-blue-50 text-blue-600 shadow-sm"
        )}>
          {icon}
        </div>
        <div>
          <p className={cn("font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>{title}</p>
          {value ? <p className={cn("text-sm font-medium mt-0.5", dark ? "text-slate-400" : "text-slate-500")}>{value}</p> : null}
        </div>
      </div>
      {trailing !== undefined ? trailing : <ChevronRight className={cn("h-5 w-5", dark ? "text-slate-500" : "text-slate-400")} />}
    </div>
  );
}

export function SettingsScreen({ setActiveScreen }) {
  const { userData } = useUserData();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  
  const dark = userData?.isDarkMode || false;
  const currentCurrency = userData?.currency || "USD";
  const currentDateFormat = userData?.dateFormat || "MM/DD/YYYY";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("🔥 User signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleDarkMode = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { isDarkMode: !dark }, { merge: true });
  };

  const updateCurrency = async (code) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { currency: code }, { merge: true });
    setShowCurrencyModal(false);
  };

  const updateDateFormat = async (fmt) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { dateFormat: fmt }, { merge: true });
    setShowDateModal(false);
  };

  const currencies = [
    { code: "NPR", symbol: "Rs.", name: "Nepalese Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  ];

  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-6 pt-8 font-sans">
        <Header 
          title="Settings" 
          subtitle="Preferences & Account"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark} 
        />

        <div className="space-y-8 mt-4">
          <section>
            <h3 className={cn("mb-4 px-1 text-xl font-bold tracking-tight", dark ? "text-slate-200" : "text-slate-800")}>Appearance</h3>
            <SettingsRow
              dark={dark}
              icon={dark ? <Moon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              title="Dark Mode"
              onClick={toggleDarkMode}
              trailing={
                <div 
                  className={cn("relative h-8 w-14 rounded-full transition-all duration-300", dark ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-slate-200")}
                >
                  <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300", dark ? "right-1" : "left-1")} />
                </div>
              }
            />
          </section>

          <section>
            <h3 className={cn("mb-4 px-1 text-xl font-bold tracking-tight", dark ? "text-slate-200" : "text-slate-800")}>Preferences</h3>
            <div className="space-y-4">
              <div className="relative">
                <SettingsRow 
                  dark={dark} 
                  icon={<DollarSign className="h-5 w-5" />} 
                  title="Currency" 
                  value={`${currentCurrency} (${currencies.find(c => c.code === currentCurrency)?.symbol})`} 
                  onClick={() => setShowCurrencyModal(!showCurrencyModal)}
                  trailing={<ChevronDown className={cn("h-5 w-5 transition-transform", showCurrencyModal && "rotate-180", dark ? "text-slate-500" : "text-slate-400")} />}
                />
                
                {showCurrencyModal && (
                  <div className={cn(
                    "absolute top-full left-0 right-0 z-20 mt-2 overflow-hidden rounded-[2rem] border p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300",
                    dark ? "bg-slate-800 border-slate-700 shadow-black/60" : "bg-white border-slate-100 shadow-slate-200/50"
                  )}>
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => updateCurrency(c.code)}
                        className={cn(
                          "flex w-full items-center justify-between px-5 py-4 rounded-[1.5rem] transition-colors",
                          currentCurrency === c.code 
                            ? (dark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") 
                            : (dark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50")
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">{c.symbol}</span>
                          <span className="font-bold">{c.name}</span>
                        </div>
                        {currentCurrency === c.code && <Check className="h-5 w-5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative mt-2">
                <SettingsRow 
                  dark={dark} 
                  icon={<Calendar className="h-5 w-5" />} 
                  title="Date Format" 
                  value={currentDateFormat} 
                  onClick={() => setShowDateModal(!showDateModal)}
                  trailing={<ChevronDown className={cn("h-5 w-5 transition-transform", showDateModal && "rotate-180", dark ? "text-slate-500" : "text-slate-400")} />}
                />
                
                {showDateModal && (
                  <div className={cn(
                    "absolute top-full left-0 right-0 z-20 mt-2 overflow-hidden rounded-[2rem] border p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300",
                    dark ? "bg-slate-800 border-slate-700 shadow-black/60" : "bg-white border-slate-100 shadow-slate-200/50"
                  )}>
                    {dateFormats.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => updateDateFormat(fmt)}
                        className={cn(
                          "flex w-full items-center justify-between px-5 py-4 rounded-[1.5rem] transition-colors",
                          currentDateFormat === fmt 
                            ? (dark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") 
                            : (dark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50")
                        )}
                      >
                        <span className="font-bold text-sm">{fmt}</span>
                        {currentDateFormat === fmt && <Check className="h-5 w-5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className={cn("mb-4 px-1 text-xl font-bold tracking-tight", dark ? "text-slate-200" : "text-slate-800")}>Account</h3>
            <div className="space-y-4">
              <button 
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center justify-between rounded-[2rem] px-5 py-4 transition-all hover:scale-[1.01] active:scale-100 border group",
                  dark ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-100/50 hover:bg-red-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    dark ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-100 text-red-600 group-hover:bg-red-200"
                  )}>
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold tracking-tight">Sign Out</span>
                </div>
                <ChevronRight className={cn("h-5 w-5", dark ? "text-red-900/40" : "text-red-300")} />
              </button>
            </div>
          </section>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/30">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h4 className={cn("text-3xl font-extrabold tracking-tighter", dark ? "text-white" : "text-slate-900")}>Pocket Worth</h4>
            <p className={cn("mt-2 text-lg font-medium", dark ? "text-slate-400" : "text-slate-500")}>Version 1.2.0</p>
          </div>
        </div>

        <BottomNav active="settings" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}