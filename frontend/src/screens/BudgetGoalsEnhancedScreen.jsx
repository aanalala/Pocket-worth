import React, { useState } from "react";
import { Plus, Target, AlertTriangle, CheckCircle2, ChevronRight, TrendingDown, PieChart as PieIcon, Loader2, X, DollarSign } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SegmentedControl } from "../components/SegmentedControl";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { auth, db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

const BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Fitness',
  'Travel',
  'Personal Care',
  'Insurance',
  'Other'
];

export function BudgetGoalsEnhancedScreen({ setActiveScreen, dark = false }) {
  const { userData, budgets, transactions, loading } = useUserData();
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  const currency = userData?.currency || "NPR";

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
        </div>
      </PhoneShell>
    );
  }

  const getPeriodMultiplier = (period) => {
    if (period === "weekly") return 0.25;
    if (period === "yearly") return 12;
    return 1; // monthly
  };

  const periodMultiplier = getPeriodMultiplier(budgetPeriod);
  const now = new Date();

  // Calculate spent based on actual transactions
  const filteredTransactions = transactions.filter(t => {
    if (t.type !== "expense") return false;
    if (!t.date) return false;
    const tDate = new Date(t.date);
    
    if (budgetPeriod === "monthly") {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }
    if (budgetPeriod === "yearly") {
      return tDate.getFullYear() === now.getFullYear();
    }
    if (budgetPeriod === "weekly") {
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      return (now - tDate) < msInWeek && (now - tDate) >= 0;
    }
    return true;
  });

  // Get spending by category
  const spendingByCategory = {};
  filteredTransactions.forEach(t => {
    const cat = t.category || "Other";
    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + t.amount;
  });

  // Calculate budget with period adjustment
  const budgetsWithProgress = budgets.map(budget => {
    const adjustedLimit = budget.limit * periodMultiplier;
    const spent = spendingByCategory[budget.category] || 0;
    const percentage = (spent / adjustedLimit) * 100;
    
    return {
      ...budget,
      adjustedLimit,
      spent,
      remaining: Math.max(0, adjustedLimit - spent),
      percentage: Math.min(100, percentage),
      status: spent > adjustedLimit ? 'Over' : 'On Track',
      statusColor: spent > adjustedLimit ? 'text-red-500' : 'text-green-500'
    };
  });

  const totalLimit = budgetsWithProgress.reduce((sum, b) => sum + b.adjustedLimit, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalLimit - totalSpent;

  const handleAddBudget = async () => {
    if (!formData.category || !formData.limit) {
      alert('Please fill all fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const budgetsRef = collection(db, 'users', user.uid, 'budgets');
        await addDoc(budgetsRef, {
          category: formData.category,
          limit: parseFloat(formData.limit),
          period: formData.period,
          createdAt: new Date().toISOString(),
        });
        
        setFormData({ category: '', limit: '', period: 'monthly' });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Error adding budget');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const budgetRef = doc(db, 'users', user.uid, 'budgets', budgetId);
        await deleteDoc(budgetRef);
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error deleting budget');
    }
  };

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Budgets" 
          subtitle="Set and track spending limits"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex gap-2">
            {['weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => setBudgetPeriod(period)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                  budgetPeriod === period
                    ? "bg-blue-600 text-white"
                    : dark
                      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Summary Card */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white shadow-xl shadow-purple-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-purple-100">Budget Limit</p>
                  <h3 className="mt-1 text-3xl font-black tracking-tight">{formatMoney(totalLimit, currency)}</h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <DollarSign className="h-8 w-8 text-yellow-300" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-100">Spent</p>
                  <p className="mt-1 text-xl font-black">{formatMoney(totalSpent, currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-100">Remaining</p>
                  <p className="mt-1 text-xl font-black">{formatMoney(totalRemaining, currency)}</p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{((totalSpent / totalLimit) * 100).toFixed(0)}% Used</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (totalSpent / totalLimit) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                {budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)} Budgets
              </h3>
              <button 
                onClick={() => setShowModal(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {budgetsWithProgress.length === 0 ? (
              <div className={cn(
                "rounded-[2.25rem] border p-8 text-center",
                dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
              )}>
                <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className={cn("text-sm font-medium", dark ? "text-slate-400" : "text-slate-500")}>
                  No budgets set. Create one to get started!
                </p>
              </div>
            ) : (
              budgetsWithProgress.map((budget) => (
                <div 
                  key={budget.id}
                  className={cn(
                    "rounded-[2.25rem] border p-5 transition-all hover:scale-[1.01] active:scale-100",
                    dark ? "bg-slate-800 border-slate-700 shadow-xl shadow-black/10" : "bg-white border-slate-100 shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={cn("text-base font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                        {budget.category}
                      </h4>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", budget.statusColor)}>
                        {budget.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className={cn("font-bold", dark ? "text-slate-300" : "text-slate-600")}>
                        {formatMoney(budget.spent, currency)} of {formatMoney(budget.adjustedLimit, currency)}
                      </span>
                      <span className="font-bold text-slate-500">{budget.percentage.toFixed(0)}%</span>
                    </div>
                    <div className={cn(
                      "h-2 w-full rounded-full overflow-hidden",
                      dark ? "bg-slate-700" : "bg-slate-200"
                    )}>
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          budget.percentage > 100 ? "bg-red-500" : budget.percentage > 75 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(100, budget.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-widest" style={{color: dark ? '#94a3b8' : '#64748b'}}>
                    {budget.remaining > 0 ? `₨${budget.remaining.toFixed(0)} remaining` : `₨${Math.abs(budget.remaining).toFixed(0)} over`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={cn(
            "w-full max-w-lg rounded-t-[3rem] p-6 space-y-4",
            dark ? "bg-slate-900" : "bg-white"
          )}>
            <div className="flex items-center justify-between">
              <h2 className={cn("text-xl font-black", dark ? "text-white" : "text-slate-900")}>Create Budget</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border font-medium",
                    dark 
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                >
                  <option value="">Select a category...</option>
                  {BUDGET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                    Budget Limit
                  </label>
                  <input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="0.00"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border font-medium",
                      dark 
                        ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    )}
                  />
                </div>

                <div>
                  <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border font-medium",
                      dark 
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddBudget}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
