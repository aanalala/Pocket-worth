import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar as CalendarIcon, DollarSign, Bell, Plus, Trash2, Edit2 } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn, getLocalDateStr } from "../utils/utils";
import { useUserData } from "../hooks/useUserData";
import { auth, db } from "../firebase";
import { doc, deleteDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";

export function CalendarScreen({ setActiveScreen, dark = false, navParams, setNavParams }) {
  const { transactions, bills } = useUserData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDeleteTransaction = async (t) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      await deleteDoc(doc(db, "users", user.uid, "transactions", t.id));
      
      const isIncome = t.type === "income";
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        balance: increment(isIncome ? -t.amount : t.amount),
        income: increment(isIncome ? -t.amount : 0),
        expenses: increment(isIncome ? 0 : -t.amount),
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error deleting transaction", error);
      alert("Failed to delete transaction.");
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null });
    }
    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTransactions = transactions.filter(t => {
        return getLocalDateStr(t.date) === dateStr;
      });
      const dayBills = (bills || []).filter(b => b.dueDate === dateStr);

      
      days.push({ 
        day: i, 
        date: dateStr,
        hasTransaction: dayTransactions.length > 0,
        hasBill: dayBills.length > 0,
        transactions: dayTransactions,
        bills: dayBills
      });
    }
    return days;
  }, [currentDate, transactions, bills]);

  const [selectedDate, setSelectedDate] = useState(null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <PhoneShell dark={dark}>
      <div className="flex h-[840px] flex-col font-sans overflow-hidden">
        <div className="px-5 pt-8">
          <Header 
            title="Finance Calendar" 
            subtitle="Track events & deadlines"
            onBack={() => setActiveScreen("dashboard")} 
            dark={dark}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide">
          {/* Month Navigation */}
          <div className={cn(
            "mb-6 flex items-center justify-between rounded-3xl p-4 shadow-sm border",
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          )}>
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className={cn("h-5 w-5", dark ? "text-slate-400" : "text-slate-600")} />
            </button>
            <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>
              {monthName} {year}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className={cn("h-5 w-5", dark ? "text-slate-400" : "text-slate-600")} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={cn(
            "rounded-[2.5rem] border p-6 shadow-xl",
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          )}>
            <div className="mb-4 grid grid-cols-7 text-center">
              {daysOfWeek.map(d => (
                <span key={d} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthData.map((d, idx) => (
                <div 
                  key={idx} 
                  onClick={() => d.day && setSelectedDate(d)}
                  className={cn(
                    "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl text-sm transition-all active:scale-90",
                    !d.day && "cursor-default opacity-0",
                    selectedDate?.date === d.date ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : (dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-900 hover:bg-slate-50"),
                    d.day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && selectedDate?.date !== d.date && "border-2 border-blue-600/30 text-blue-600"
                  )}
                >
                  <span className="font-bold">{d.day}</span>
                  <div className="absolute bottom-2 flex gap-1">
                    {d.hasTransaction && <div className={cn("h-1 w-1 rounded-full", selectedDate?.date === d.date ? "bg-white" : "bg-blue-500")} />}
                    {d.hasBill && <div className={cn("h-1 w-1 rounded-full", selectedDate?.date === d.date ? "bg-white" : "bg-red-500")} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details for selected date */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className={cn("text-xs font-black uppercase tracking-widest text-slate-400 ml-2")}>
                {selectedDate ? `Activities for ${selectedDate.day} ${monthName}` : "Select a date"}
              </h4>
              {selectedDate && (
                <div className="flex gap-2">
                  <button onClick={() => {
                    setNavParams({ defaultDate: selectedDate.date });
                    setActiveScreen("expense");
                  }} className="flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    <Plus className="h-3 w-3" /> Manual
                  </button>
                  <button onClick={() => {
                    setNavParams({ defaultDate: selectedDate.date });
                    setActiveScreen("ocr");
                  }} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Plus className="h-3 w-3" /> Receipt
                  </button>
                </div>
              )}
            </div>
            
            {selectedDate ? (
              <div className="space-y-3">
                {selectedDate.transactions.length === 0 && selectedDate.bills.length === 0 && (
                  <div className={cn("rounded-3xl border p-8 text-center", dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50/50 border-slate-100")}>
                    <p className="text-sm font-bold text-slate-400">No activities scheduled</p>
                  </div>
                )}
                
                {selectedDate.transactions.map((t, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between rounded-3xl border p-4 shadow-sm",
                    dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        t.type === "income" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-black", dark ? "text-white" : "text-slate-900")}>{t.description}</p>
                        <p className="text-[10px] font-bold text-slate-400">{t.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className={cn("font-black", t.type === "income" ? "text-green-500" : "text-red-500")}>
                        {t.type === "income" ? "+" : "-"}${t.amount}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setNavParams({ editMode: true, transaction: t, defaultDate: selectedDate.date });
                          setActiveScreen(t.type || "expense");
                        }} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleDeleteTransaction(t)} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedDate.bills.map((b, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between rounded-3xl border border-red-100 bg-red-50/30 p-4 shadow-sm",
                    dark ? "bg-red-900/10 border-red-900/20" : ""
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-black", dark ? "text-white" : "text-slate-900")}>{b.name}</p>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Bill Due</p>
                      </div>
                    </div>
                    <p className="font-black text-red-600">-${b.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed p-12 text-center",
                dark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
              )}>
                <CalendarIcon className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">Tap a day to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
