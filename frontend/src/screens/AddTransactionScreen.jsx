import React, { useState } from "react";
import { Calendar, Tag, FileText, Repeat, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SegmentedControl } from "../components/SegmentedControl";
import { InputField } from "../components/InputField";
import { cn } from "../utils/utils";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { useUserData } from "../hooks/useUserData";

export function AddTransactionScreen({ type: initialType = "expense", setActiveScreen, dark: propDark }) {
  const { userData } = useUserData();
  const dark = propDark || userData?.isDarkMode || false;
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isIncome = type === "income";
  
  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const categories = isIncome
    ? ["Salary", "Freelance", "Investment", "Gift", "Other"]
    : ["Housing", "Food", "Transportation", "Entertainment", "Shopping", "Utilities", "Healthcare"];

  const handleAdd = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!category || category === "Select a category") {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user || !db) throw new Error("No user or database connection.");

      const numericAmount = parseFloat(amount);

      // 1. Log the transaction in the user's sub-collection
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type,
        amount: numericAmount,
        category,
        date,
        notes,
        isRecurring,
        createdAt: serverTimestamp(),
      });

      // 2. Atomically update the user's overall balance and totals
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        balance: isIncome ? increment(numericAmount) : increment(-numericAmount),
        income: isIncome ? increment(numericAmount) : increment(0),
        expenses: isIncome ? increment(0) : increment(numericAmount),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      console.log("🔥 Transaction saved and totals updated!");
      setActiveScreen("dashboard");
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currency = userData?.currency || "USD";
  const currencySymbol = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
  }[currency] || "$";

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title={isIncome ? "Add Income" : "Add Expense"} 
          subtitle="Record new activity"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="mb-6">
          <SegmentedControl
            value={type}
            onChange={(val) => {
              setType(val);
              setCategory(""); // Reset category when switching type
            }}
            options={[
              { label: "Income", value: "income" },
              { label: "Expense", value: "expense" },
            ]}
            activeClassName={isIncome ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-red-500 text-white shadow-lg shadow-red-500/30"}
            dark={dark}
          />
        </div>

        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 mb-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className={cn(
            "rounded-[2.5rem] border p-7 transition-all shadow-xl", 
            dark ? "bg-slate-800/40 border-slate-700/50 shadow-black/20" : 
            isIncome ? "bg-white border-blue-100 shadow-blue-500/5" : "bg-white border-red-100 shadow-red-500/5"
          )}>
            <p className={cn("text-xs font-black uppercase tracking-widest mb-2", dark ? "text-slate-500" : "text-slate-400")}>Amount</p>
            <div className="flex items-center gap-2">
              <span className={cn("text-5xl font-black", isIncome ? "text-blue-600" : "text-red-500")}>{currencySymbol}</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                   "w-full bg-transparent text-5xl font-black outline-none placeholder:text-slate-200",
                   dark ? "text-white" : "text-slate-900"
                )} 
                placeholder="0.00" 
                autoFocus
              />
            </div>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <label className={cn("text-sm font-black ml-1 flex items-center gap-2", dark ? "text-slate-400" : "text-slate-700")}>
                <Tag className="h-4 w-4 text-slate-400" /> Category
              </label>
              <div className="relative group">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    "w-full appearance-none rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm cursor-pointer",
                    dark ? "bg-slate-800/40 border-slate-700/50 text-white" : "bg-white border-slate-200 text-slate-900"
                  )}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className={dark ? "bg-slate-900 text-white" : "text-slate-900 font-bold"}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-black ml-1 flex items-center gap-2", dark ? "text-slate-400" : "text-slate-700")}>
                <Calendar className="h-4 w-4 text-slate-400" /> Date
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm",
                  dark ? "bg-slate-800/40 border-slate-700/50 text-white color-scheme-dark" : "bg-white border-slate-200 text-slate-900"
                )} 
              />
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-black ml-1 flex items-center gap-2", dark ? "text-slate-400" : "text-slate-700")}>
                <FileText className="h-4 w-4 text-slate-400" /> Notes
              </label>
              <textarea 
                rows={3} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(
                  "w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all shadow-sm resize-none",
                  dark ? "bg-slate-800/40 border-slate-700/50 text-white placeholder:text-slate-600" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-200"
                )} 
                placeholder="What was this for?" 
              />
            </div>

            <div className={cn(
              "rounded-[2.25rem] border p-5 shadow-sm mt-2",
              dark ? "bg-slate-800/40 border-slate-700/50" : "bg-white border-slate-100"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", dark ? "bg-slate-900/50 text-slate-400" : "bg-slate-100 text-slate-500")}>
                    <Repeat className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={cn("font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>Recurring</p>
                    <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-tighter", dark ? "text-slate-500" : "text-slate-400")}>Repeat monthly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={cn(
                    "relative h-8 w-14 rounded-full transition-all duration-300", 
                    isRecurring 
                      ? (isIncome ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-red-500 shadow-lg shadow-red-500/20") 
                      : (dark ? "bg-slate-800" : "bg-slate-200")
                  )}
                >
                  <span className={cn(
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300", 
                    isRecurring ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            disabled={loading}
            className={cn(
              "w-full rounded-[2.25rem] px-6 py-5 text-xl font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3",
              isIncome ? "bg-blue-600 shadow-blue-600/30" : "bg-red-500 shadow-red-600/30",
              loading && "opacity-80"
            )}
          >
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : (
              <>
                Confirm {isIncome ? "Income" : "Expense"}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}