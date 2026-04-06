import React, { useState } from "react";
import { Target, Plus, Calendar, ArrowRight, TrendingUp, Loader2, X, DollarSign, Palette } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { MetricHero } from "../components/MetricHero";
import { BottomNav } from "../components/BottomNav";
import { formatMoney } from "../utils/utils";
import { cn } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function SavingsGoalsScreen({ setActiveScreen }) {
  const { userData, goals, loading } = useUserData();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const dark = userData?.isDarkMode || false;
  const currency = userData?.currency || "USD";

  const handleCreateGoal = async () => {
    if (!name || !target || parseFloat(target) <= 0) return;

    setAddingLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "users", user.uid, "goals"), {
        name,
        target: parseFloat(target),
        current: 0,
        deadline: deadline || "Monthly Goal",
        color,
        createdAt: serverTimestamp(),
      });

      setIsAddingGoal(false);
      setName("");
      setTarget("");
      setDeadline("");
    } catch (err) {
      console.error("Error creating goal:", err);
    } finally {
      setAddingLoading(false);
    }
  };

  if (loading) {
    return (
      <PhoneShell dark={dark}>
        <div className={cn("flex h-[600px] flex-col items-center justify-center font-sans tracking-tighter", dark ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-widest">Syncing Your Goals</h2>
          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-Time Data Stream Active</p>
        </div>
      </PhoneShell>
    );
  }

  const overallCurrent = goals.reduce((sum, goal) => sum + (goal.current || 0), 0);
  const overallTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
  const overallProgress = overallTarget > 0 ? Math.min(100, Math.round((overallCurrent / overallTarget) * 100)) : 0;
  const hasGoals = goals.length > 0;

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Goals" 
          subtitle="Financial Targets" 
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <MetricHero 
          title="Overall Progress" 
          value={formatMoney(overallCurrent, currency)} 
          subValue={hasGoals ? `${overallProgress}% of ${formatMoney(overallTarget, currency)} target` : "No active goals found"} 
          footer={
            hasGoals ? (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-100">
                 <TrendingUp className="h-4 w-4" />
                 <span>On track for all {goals.length} goals</span>
              </div>
            ) : null
          }
        />

        <div className="mt-8 space-y-6">
          <h3 className={cn("px-1 text-2xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Active Goals</h3>
          
          {hasGoals ? (
            goals.map((goal, idx) => {
              const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const remaining = Math.max(0, goal.target - goal.current);
              return (
                <div key={idx} className={cn(
                   "group rounded-[3rem] border p-7 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm shadow-slate-100/50",
                   dark ? "bg-white/5 border-white/5 shadow-black/20" : "bg-white border-slate-100 hover:shadow-xl"
                )}>
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-2xl" style={{ backgroundColor: goal.color || '#3b82f6', boxShadow: `0 12px 30px ${goal.color || '#3b82f6'}44` }}>
                        <Target className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className={cn("text-xl font-black tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{goal.name}</h4>
                        <p className={cn("text-xs font-black uppercase tracking-widest mt-2 px-1 py-0.5 rounded-lg w-fit", dark ? "text-slate-500 bg-slate-900" : "text-slate-400 bg-slate-50")}>
                           {formatMoney(remaining, currency)} to go
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                       "px-4 py-2 rounded-xl font-black text-sm shadow-inner transition-all duration-300 border",
                       dark ? "bg-slate-900 text-blue-400 border-white/5 shadow-black" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {progress}%
                    </div>
                  </div>

                  <div className={cn(
                     "mb-8 h-4 overflow-hidden rounded-full p-1 border shadow-inner",
                     dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-slate-100 border-slate-50 shadow-slate-200/50"
                  )}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg" 
                      style={{ width: `${progress}%`, backgroundColor: goal.color || '#3b82f6' }} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className={cn(
                       "rounded-[1.75rem] border p-5 shadow-sm transition-all duration-300",
                       dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-white border-slate-100"
                    )}>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 text-center", dark ? "text-slate-500" : "text-slate-400")}>Saved</p>
                      <p className={cn("text-xl font-black text-center tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(goal.current, currency)}</p>
                    </div>
                    <div className={cn(
                       "rounded-[1.75rem] border p-5 shadow-sm transition-all duration-300",
                       dark ? "bg-slate-900 border-white/5 shadow-black" : "bg-white border-slate-100"
                    )}>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 text-center", dark ? "text-slate-500" : "text-slate-400")}>Target</p>
                      <p className={cn("text-xl font-black text-center tracking-tight leading-none", dark ? "text-white" : "text-slate-900")}>{formatMoney(goal.target, currency)}</p>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Calendar className={cn("h-4 w-4", dark ? "text-slate-600" : "text-slate-400")} />
                      <span className={cn("text-xs font-black uppercase tracking-widest", dark ? "text-slate-600" : "text-slate-500")}>{goal.deadline || 'Monthly Goal'}</span>
                    </div>
                    <button className={cn("font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all", dark ? "text-blue-400" : "text-blue-600")}>
                      Details <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={cn(
              "flex flex-col items-center justify-center py-20 rounded-[3.5rem] border-2 border-dashed p-10 text-center transition-all duration-500",
              dark ? "bg-white/5 border-white/10 shadow-black/20" : "bg-white border-slate-200"
            )}>
              <div className={cn(
                "h-24 w-24 rounded-full flex items-center justify-center mb-8 shadow-2xl border transition-all",
                dark ? "bg-slate-900 border-white/10 shadow-black/60" : "bg-slate-50 border-white shadow-slate-200"
              )}>
                <Target className={cn("h-12 w-12", dark ? "text-white/20" : "text-slate-200")} />
              </div>
              <h4 className={cn("text-xl font-black tracking-tight leading-none mb-3", dark ? "text-white" : "text-slate-900")}>No Active Goals</h4>
              <p className={cn("text-xs font-bold uppercase tracking-widest leading-tight", dark ? "text-slate-500" : "text-slate-400")}>Start your first savings target today</p>
              
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className={cn("rounded-2xl p-4 border transition-all duration-300", dark ? "bg-white/5 border-white/5" : "bg-white border-slate-100")}>
                  <p className={cn("text-[10px] font-black uppercase mb-1", dark ? "text-slate-600" : "text-slate-400")}>Step 1</p>
                  <p className={cn("text-xs font-black", dark ? "text-slate-300" : "text-slate-700")}>Set Name</p>
                </div>
                <div className={cn("rounded-2xl p-4 border transition-all duration-300", dark ? "bg-white/5 border-white/5" : "bg-white border-slate-100")}>
                  <p className={cn("text-[10px] font-black uppercase mb-1", dark ? "text-slate-600" : "text-slate-400")}>Step 2</p>
                  <p className={cn("text-xs font-black", dark ? "text-slate-300" : "text-slate-700")}>Set Target</p>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsAddingGoal(true)}
            className={cn(
              "flex w-full items-center justify-center gap-4 rounded-[3rem] border-2 border-dashed px-8 py-10 transition-all active:scale-95 group shadow-lg",
              dark ? "bg-blue-600/10 border-blue-500/20 text-blue-400" : "bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-50"
            )}
          >
            <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" />
            <span className="text-lg font-black uppercase tracking-widest">Create Your First Goal</span>
          </button>
        </div>

        {/* Create Goal Overlay */}
        {isAddingGoal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 p-4 sm:p-0">
            <div className={cn(
              "w-full max-w-md animate-slide-up rounded-t-[3.5rem] p-8 shadow-2xl transition-all duration-500 border-t",
              dark ? "bg-[#0f172a] border-white/5 shadow-black/80" : "bg-white border-slate-100 shadow-slate-200"
            )}>
              <div className="flex items-center justify-between mb-8">
                <h3 className={cn("text-2xl font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>New Savings Goal</h3>
                <button 
                  onClick={() => setIsAddingGoal(false)}
                  className={cn("h-12 w-12 rounded-full flex items-center justify-center transition-all", dark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={cn("text-xs font-black uppercase tracking-widest ml-1 mb-2 block", dark ? "text-slate-500" : "text-slate-400")}>Goal Name</label>
                  <div className="relative">
                    <Target className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. New Macbook" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        "w-full rounded-[1.75rem] border px-14 py-5 text-sm font-bold outline-none transition-all shadow-sm",
                        dark ? "bg-white/5 border-white/5 text-white focus:border-blue-500/50" : "bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500/50"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1 mb-2 block", dark ? "text-slate-500" : "text-slate-400")}>Target Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className={cn(
                          "w-full rounded-[1.75rem] border px-14 py-5 text-sm font-bold outline-none transition-all shadow-sm",
                          dark ? "bg-white/5 border-white/5 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1 mb-2 block", dark ? "text-slate-500" : "text-slate-400")}>Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Oct 2024" 
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={cn(
                          "w-full rounded-[1.75rem] border px-14 py-5 text-sm font-bold outline-none transition-all shadow-sm",
                          dark ? "bg-white/5 border-white/5 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                   <label className={cn("text-xs font-black uppercase tracking-widest ml-1 mb-3 block", dark ? "text-slate-500" : "text-slate-400")}>Accent Color</label>
                   <div className="flex gap-4">
                      {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                         <button 
                            key={c}
                            onClick={() => setColor(c)}
                            className={cn(
                               "h-10 w-10 rounded-full transition-all border-2",
                               color === c ? "scale-125 border-white shadow-xl" : "border-transparent opacity-60"
                            )}
                            style={{ backgroundColor: c }}
                         />
                      ))}
                   </div>
                </div>

                <button 
                  onClick={handleCreateGoal}
                  disabled={addingLoading}
                  className={cn(
                    "w-full rounded-[2.25rem] px-8 py-5 text-lg font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3 mt-4",
                    dark ? "bg-blue-600 shadow-blue-900/40" : "bg-blue-600 shadow-blue-400/40",
                    addingLoading && "opacity-80"
                  )}
                >
                  {addingLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Save New Goal"}
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNav active="savings" setActiveScreen={setActiveScreen} dark={dark} />
      </div>
    </PhoneShell>
  );
}