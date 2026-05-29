import React, { useState } from "react";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SegmentedControl } from "../components/SegmentedControl";
import { InputField } from "../components/InputField";
import { cn } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function CreateBudgetScreen({ setActiveScreen, dark = false }) {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Fields state
  const [budgetName, setBudgetName] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const currency = userData?.currency || "NPR";

  const categories = [
    { name: "Food", color: "#ef4444", icon: "🍔" },
    { name: "Shopping", color: "#ec4899", icon: "🛍️" },
    { name: "Travel", color: "#14b8a6", icon: "✈️" },
    { name: "Entertainment", color: "#8b5cf6", icon: "🎬" },
    { name: "Rent & Bills", color: "#f59e0b", icon: "🏠" },
    { name: "Utilities", color: "#06b6d4", icon: "⚡" },
    { name: "Custom", color: "#64748b", icon: "✨" }
  ];

  const colors = [
    "#ef4444", // Red
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#64748b"  // Slate
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) {
      setError("Please enter a valid budget limit amount.");
      return;
    }

    const finalCategory = category === "Custom" ? (customCategory.trim() || "Custom") : category;
    const finalName = budgetName.trim() || `${finalCategory} Budget`;

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found");

      await addDoc(collection(db, "users", user.uid, "budgets"), {
        name: finalName,
        category: finalCategory,
        limit: Number(limit),
        spent: 0,
        color: selectedColor,
        period: period,
        createdAt: serverTimestamp()
      });

      // Redirect on success
      setActiveScreen("budgets");
    } catch (err) {
      console.error("Error creating budget:", err);
      setError("Failed to create budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat.name);
    setSelectedColor(cat.color);
  };

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Create Budget" 
          subtitle="Define spending limits"
          onBack={() => setActiveScreen("budgets")} 
          dark={dark}
        />

        <form onSubmit={handleCreate} className="mt-4 space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-100 dark:border-red-900/30 text-xs font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Budget Limit Amount */}
          <div className={cn(
            "rounded-[2.5rem] border p-6 text-center shadow-xl relative overflow-hidden",
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          )}>
            <label className={cn("text-[10px] font-black uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-500")}>
              Limit Amount ({currency})
            </label>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl font-black text-blue-500">
                {currency === "NPR" ? "Rs." : "$"}
              </span>
              <input 
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0"
                className={cn(
                  "text-5xl font-black outline-none w-48 text-center bg-transparent border-b-2 focus:border-blue-500 placeholder:text-slate-200 dark:placeholder:text-slate-800",
                  dark ? "text-white border-slate-800 focus:border-blue-500" : "text-slate-900 border-slate-100 focus:border-blue-500"
                )}
                required
              />
            </div>
          </div>

          {/* Budget Custom Name */}
          <div className="space-y-2">
            <label className={cn("text-xs font-black uppercase tracking-widest px-1", dark ? "text-slate-400" : "text-slate-500")}>
              Budget Name / Label
            </label>
            <input
              type="text"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="e.g. Monthly Grocery Stash"
              className={cn(
                "w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                dark ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-slate-100 text-slate-900 placeholder:text-slate-400"
              )}
            />
          </div>

          {/* Budget Period Toggles */}
          <div className="space-y-2">
            <label className={cn("text-xs font-black uppercase tracking-widest px-1", dark ? "text-slate-400" : "text-slate-500")}>
              Cycle Period
            </label>
            <SegmentedControl
              options={[
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" }
              ]}
              value={period}
              onChange={setPeriod}
              activeClassName={cn("text-white shadow-md", dark ? "bg-blue-500" : "bg-blue-600")}
              baseClassName={cn("transition-colors", dark ? "text-slate-400 hover:text-white" : "bg-transparent text-slate-600 hover:bg-white/50")}
            />
          </div>

          {/* Category Quick Grids */}
          <div className="space-y-3">
            <label className={cn("text-xs font-black uppercase tracking-widest px-1 block", dark ? "text-slate-400" : "text-slate-500")}>
              Select Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 shadow-sm text-center",
                    category === cat.name 
                      ? (dark ? "bg-blue-900/30 border-blue-500 text-white" : "bg-blue-50 border-blue-500 text-blue-900 font-bold") 
                      : (dark ? "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white" : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50")
                  )}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-tight">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Category Input if Custom Selected */}
            {category === "Custom" && (
              <div className="pt-1 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name..."
                  className={cn(
                    "w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 animate-pulse-once",
                    dark ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-slate-100 text-slate-900 placeholder:text-slate-400"
                  )}
                  required
                />
              </div>
            )}
          </div>

          {/* Color Palettes Picker */}
          <div className="space-y-2">
            <label className={cn("text-xs font-black uppercase tracking-widest px-1 block", dark ? "text-slate-400" : "text-slate-500")}>
              Budget Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5 px-1 py-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90",
                    selectedColor === c 
                      ? (dark ? "border-white scale-110 shadow-lg shadow-white/10" : "border-slate-900 scale-110 shadow-md") 
                      : "border-transparent"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={() => setActiveScreen("budgets")}
              className={cn(
                "flex-1 py-4 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center",
                dark ? "border-slate-800 hover:bg-white/5 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-500"
              )}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Budget
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PhoneShell>
  );
}
