import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Sparkles, MessageCircle, ArrowLeft, Bot } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn } from "../utils/utils";
import { auth, API_URL } from "../firebase";
import { useUserData } from "../hooks/useUserData";

export function ChatbotScreen({ setActiveScreen, dark = false }) {
  const { userData, transactions, goals } = useUserData();
  const [messages, setMessages] = useState([
    { role: "bot", content: `Hello ${userData?.displayName || "there"}! I'm your Pocket Worth assistant. Ask me anything about your spending or for financial advice!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const apiUrl = API_URL;
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: userMsg,
          context: {
            balance: userData?.balance,
            income: userData?.income,
            expenses: userData?.expenses,
            recentTransactions: transactions.slice(0, 10),
            goals: goals.map(g => ({ name: g.name, target: g.target, current: g.current }))
          }
        })
      });

      if (!response.ok) throw new Error("Chat failed");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "bot", content: data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to my brain. Please try again later!" }]);
    } finally {
      setLoading(false);
    }

  };

  return (
    <PhoneShell dark={dark}>
      <div className="flex h-[840px] flex-col font-sans">
        <div className="px-5 pt-8">
          <Header 
            title="AI Advisor" 
            subtitle="Pocket Worth Intelligence"
            onBack={() => setActiveScreen("dashboard")} 
            dark={dark}
          />
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide"
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex w-full items-end gap-2 animate-slide-up",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
                msg.role === "user" ? "bg-blue-600 text-white" : (dark ? "bg-slate-800 text-blue-400" : "bg-white text-blue-600 border border-slate-100")
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={cn(
                "max-w-[80%] rounded-3xl px-5 py-3 text-sm shadow-sm",
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : (dark ? "bg-slate-800 text-white border-slate-700 rounded-bl-none" : "bg-white text-slate-800 border border-slate-100 rounded-bl-none")
              )}>
                <p className="leading-relaxed font-medium">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2 animate-pulse">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", dark ? "bg-slate-800" : "bg-slate-100 text-blue-600")}>
                <Bot className="h-4 w-4" />
              </div>
              <div className={cn("rounded-3xl px-5 py-3", dark ? "bg-slate-800" : "bg-slate-100")}>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            </div>
          )}
        </div>

        <div className={cn(
          "p-5 border-t",
          dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        )}>
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className={cn(
                "w-full rounded-2xl border px-5 py-4 pr-14 text-sm font-bold outline-none transition-all shadow-sm",
                dark ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400"
              )}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-all active:scale-90 disabled:opacity-50",
                !input.trim() && "bg-slate-400 shadow-none"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            Powered by Pocket Worth Intelligence
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}
