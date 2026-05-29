import React, { useState } from "react";
import { Plus, Bell, Calendar, CreditCard, Loader2, Trash2, ShieldCheck, Zap, X } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { SectionCard } from "../components/SectionCard";
import { cn, formatMoney } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { auth, db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', icon: '🎬', color: 'bg-red-600' },
  { name: 'Spotify', icon: '🎵', color: 'bg-green-600' },
  { name: 'Amazon Prime', icon: '📦', color: 'bg-blue-600' },
  { name: 'YouTube Premium', icon: '📺', color: 'bg-red-500' },
  { name: 'Disney+', icon: '🏰', color: 'bg-blue-500' },
  { name: 'Hulu', icon: '▶️', color: 'bg-green-500' },
  { name: 'Apple Music', icon: '🎶', color: 'bg-gray-800' },
  { name: 'Microsoft 365', icon: '📊', color: 'bg-blue-700' },
  { name: 'Adobe Creative', icon: '🎨', color: 'bg-red-700' },
  { name: 'Gym Membership', icon: '💪', color: 'bg-orange-600' },
];

export function SubscriptionTrackerEnhancedScreen({ setActiveScreen, dark = false }) {
  const { userData, subscriptions, loading } = useUserData();
  const [showModal, setShowModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    cycle: 'monthly',
    nextBilling: '',
    icon: '💳',
  });

  const currency = userData?.currency || "NPR";
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

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setFormData({ ...formData, name: preset.name, icon: preset.icon });
  };

  const handleAddSubscription = async () => {
    if (!formData.name || !formData.amount || !formData.nextBilling) {
      alert('Please fill all fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const subsRef = collection(db, 'users', user.uid, 'subscriptions');
        await addDoc(subsRef, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          cycle: formData.cycle,
          nextBilling: new Date(formData.nextBilling).toISOString(),
          icon: formData.icon,
          createdAt: new Date().toISOString(),
        });
        
        setFormData({ name: '', amount: '', cycle: 'monthly', nextBilling: '', icon: '💳' });
        setShowModal(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Error adding subscription');
    }
  };

  const handleDeleteSubscription = async (subId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const subRef = doc(db, 'users', user.uid, 'subscriptions', subId);
        await deleteDoc(subRef);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Error deleting subscription');
    }
  };

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
                onClick={() => setShowModal(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {subscriptions.length === 0 ? (
              <div className={cn(
                "rounded-[2.25rem] border p-8 text-center",
                dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
              )}>
                <p className={cn("text-sm font-medium", dark ? "text-slate-400" : "text-slate-500")}>No subscriptions yet</p>
              </div>
            ) : (
              subscriptions.map((sub) => (
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
                      {sub.icon || '💳'}
                    </div>
                    <div>
                      <h4 className={cn("text-base font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>{sub.name}</h4>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", dark ? "text-slate-500" : "text-slate-400")}>
                        Next: {new Date(sub.nextBilling).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
                        {formatMoney(sub.amount, currency)}
                      </p>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest text-blue-500")}>
                        {sub.cycle}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={cn(
            "w-full max-w-lg rounded-t-[3rem] p-6 space-y-4 max-h-[90vh] overflow-y-auto",
            dark ? "bg-slate-900" : "bg-white"
          )}>
            <div className="flex items-center justify-between">
              <h2 className={cn("text-xl font-black", dark ? "text-white" : "text-slate-900")}>Add Subscription</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Popular Subscriptions Grid */}
            <div>
              <p className={cn("text-sm font-bold mb-3", dark ? "text-slate-400" : "text-slate-600")}>Popular Services</p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_SUBSCRIPTIONS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "p-3 rounded-xl flex flex-col items-center gap-2 transition-all text-xs font-bold",
                      selectedPreset?.name === preset.name
                        ? "bg-blue-600 text-white border-2 border-blue-400"
                        : dark 
                          ? "bg-slate-800 text-slate-300 border border-slate-700"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                    )}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 border-t pt-4" style={{borderColor: dark ? '#475569' : '#e2e8f0'}}>
              <div>
                <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                  Subscription Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix Premium"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border font-medium",
                    dark 
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                    Billing Cycle
                  </label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border font-medium",
                      dark 
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                  Next Billing Date
                </label>
                <input
                  type="date"
                  value={formData.nextBilling}
                  onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border font-medium",
                    dark 
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
              </div>

              <button
                onClick={handleAddSubscription}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
              >
                Add Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
