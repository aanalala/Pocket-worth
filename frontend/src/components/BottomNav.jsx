import React from "react";
import { Home, BarChart3, TrendingUp, Wallet, Settings } from "lucide-react";
import { cn } from "../utils/utils";

export function PieChartIcon(props) {
  return <BarChart3 {...props} />;
}

export function BottomNav({ active, setActiveScreen, dark = false }) {
  const items = [
    { key: "dashboard", label: "Home", icon: Home },
    { key: "budgets", label: "Budgets", icon: PieChartIcon },
    { key: "savings", label: "Savings", icon: TrendingUp },
    { key: "networth", label: "Net Worth", icon: Wallet },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={cn(
      "sticky bottom-0 mx-[-20px] mt-8 grid grid-cols-5 border-t px-2 py-4 transition-all duration-300 z-50",
      dark ? "border-slate-800 bg-slate-950 shadow-black/40" : "border-slate-100 bg-white shadow-slate-100/50 shadow-[0_-2px_20px_rgba(0,0,0,0.02)]"
    )}>
      {items.map((item) => {
        const Icon = item.icon;
        // Check for settings light/dark legacy keys
        const selected = active === item.key || (item.key === "settings" && (active === "settingsLight" || active === "settingsDark"));
        
        return (
          <button 
            key={item.key} 
            onClick={() => setActiveScreen && setActiveScreen(item.key)}
            className={cn(
               "flex flex-col items-center gap-2 px-1 py-1 transition-all group active:scale-90",
               selected ? "" : "opacity-60"
            )}
          >
            <div className={cn(
               "p-2 rounded-2xl transition-all duration-300",
               selected ? (dark ? "bg-blue-600 shadow-blue-500/20" : "bg-blue-600 shadow-blue-600/30") : "bg-transparent"
            )}>
               <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", selected ? "text-white" : (dark ? "text-slate-400 font-black" : "text-slate-400 font-bold"))} />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter leading-none transition-all", 
              selected ? (dark ? "text-blue-400" : "text-blue-600") : (dark ? "text-slate-500" : "text-slate-500")
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}