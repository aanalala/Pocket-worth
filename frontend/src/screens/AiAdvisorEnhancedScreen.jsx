import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Sparkles, MessageCircle, ArrowLeft, Bot, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn, formatMoney } from "../utils/utils";
import { auth, API_URL } from "../firebase";
import { useUserData } from "../hooks/useUserData";

const QUICK_ADVICE = [
  "How can I save more money?",
  "Analyze my spending patterns",
  "Budget recommendations",
  "Financial health check",
  "Investment tips"
];

export function AiAdvisorEnhancedScreen({ setActiveScreen, dark = false }) {
  const { userData, transactions, goals, budgets, subscriptions } = useUserData();
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: `👋 Hello ${userData?.displayName || "there"}! I'm your PocketWorth AI Advisor. I can help you with spending analysis, budget optimization, and personalized financial recommendations.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [messages]);

  // Generate local AI advice based on user data
  const generateLocalAdvice = (userInput) => {
    const input_lower = userInput.toLowerCase();
    
    // Spending analysis
    if (input_lower.includes('spending') || input_lower.includes('analysis') || input_lower.includes('patterns')) {
      const topCategories = getTopSpendingCategories(transactions, 3);
      let advice = `📊 **Your Spending Analysis:**\n\n`;
      advice += `Total Expenses This Month: ${formatMoney(userData?.expenses || 0, userData?.currency)}\n\n`;
      advice += `**Top 3 Spending Categories:**\n`;
      topCategories.forEach((cat, idx) => {
        advice += `${idx + 1}. ${cat.category}: ${formatMoney(cat.amount, userData?.currency)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      
      if (topCategories[0]?.percentage > 40) {
        advice += `\n⚠️ Your top category accounts for ${topCategories[0].percentage.toFixed(1)}% of spending. Consider reviewing this area.`;
      }
      
      return advice;
    }

    // Budget recommendations
    if (input_lower.includes('budget') || input_lower.includes('recommend') || input_lower.includes('allocation')) {
      let advice = `💡 **Budget Recommendations:**\n\n`;
      
      if (budgets.length === 0) {
        advice += `You don't have any budgets set yet. Here are recommended allocations:\n\n`;
        advice += `• Food & Dining: 15-20% of income\n`;
        advice += `• Transportation: 10-15% of income\n`;
        advice += `• Entertainment: 5-10% of income\n`;
        advice += `• Utilities: 5-10% of income\n`;
        advice += `• Savings: 20-30% of income\n`;
        advice += `• Other: 15-20% of income\n`;
      } else {
        const overspendingBudgets = budgets.filter(b => {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);
          return spent > b.limit;
        });
        
        if (overspendingBudgets.length > 0) {
          advice += `You're overspending in:\n`;
          overspendingBudgets.forEach(b => {
            advice += `• ${b.category}\n`;
          });
          advice += `\nConsider reducing expenses or increasing your budget limits.`;
        } else {
          advice += `✅ Great job! You're staying within your budgets!`;
        }
      }
      
      return advice;
    }

    // Savings recommendations
    if (input_lower.includes('save') || input_lower.includes('savings') || input_lower.includes('goal')) {
      let advice = `🎯 **Savings Strategy:**\n\n`;
      
      const monthlyIncome = userData?.income || 0;
      const monthlyExpenses = userData?.expenses || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
      
      advice += `Monthly Savings: ${formatMoney(monthlySavings, userData?.currency)}\n`;
      advice += `Savings Rate: ${savingsRate.toFixed(1)}%\n\n`;
      
      if (savingsRate < 10) {
        advice += `⚠️ Your savings rate is below 10%. Financial experts recommend saving 20% of income.\n\n`;
        advice += `Ways to improve:\n`;
        advice += `1. Review and reduce non-essential spending\n`;
        advice += `2. Look for recurring subscriptions to cancel\n`;
        advice += `3. Set a specific savings goal\n`;
      } else if (savingsRate < 20) {
        advice += `Good progress! Try to reach 20% savings rate.\n`;
      } else {
        advice += `✨ Excellent savings rate! Keep up the great work!`;
      }
      
      return advice;
    }

    // Health check
    if (input_lower.includes('health') || input_lower.includes('financial health') || input_lower.includes('check')) {
      let advice = `💪 **Financial Health Check:**\n\n`;
      
      const monthlyIncome = userData?.income || 0;
      const monthlyExpenses = userData?.expenses || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      const subscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      
      let score = 50;
      
      // Income assessment
      if (monthlyIncome > 0) {
        score += 10;
        advice += `✅ Regular income detected\n`;
      }
      
      // Savings assessment
      if (monthlySavings > 0) {
        score += 10;
        advice += `✅ Positive monthly savings\n`;
      }
      
      // Subscription assessment
      if (subscriptionCost > 0) {
        advice += `⚠️ Monthly subscriptions: ${formatMoney(subscriptionCost, userData?.currency)}\n`;
        if (subscriptionCost > monthlyIncome * 0.1) {
          advice += `   (Over 10% of income)\n`;
          score -= 5;
        }
      }
      
      // Goals assessment
      if (goals.length > 0) {
        score += 10;
        advice += `✅ Savings goals set\n`;
      }
      
      // Budgets assessment
      if (budgets.length > 0) {
        score += 10;
        advice += `✅ Budgets configured\n`;
      }
      
      score = Math.min(100, Math.max(0, score));
      
      advice += `\n**Overall Score: ${score}/100**\n`;
      
      if (score >= 80) {
        advice += `Excellent financial health! 🌟`;
      } else if (score >= 60) {
        advice += `Good financial habits. Keep improving!`;
      } else {
        advice += `Room for improvement. Focus on budgeting and savings.`;
      }
      
      return advice;
    }

    // Default response
    return `I can help you with:\n\n` +
           `• Spending pattern analysis\n` +
           `• Budget recommendations\n` +
           `• Savings strategies\n` +
           `• Financial health checks\n` +
           `• Investment tips\n\n` +
           `Try asking: "How can I save more money?" or "Analyze my spending patterns"`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      // First try local advice generation
      const localAdvice = generateLocalAdvice(userMsg);
      
      // Add local response
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: localAdvice,
        timestamp: new Date()
      }]);

      // Try to get API response if available
      if (API_URL && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await fetch(`${API_URL}/api/ai/chat`, {
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

          if (response.ok) {
            const data = await response.json();
            // Replace local response with API response if available
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "bot",
                content: data.reply || localAdvice,
                timestamp: new Date()
              };
              return updated;
            });
          }
        } catch (apiError) {
          console.log("API unavailable, using local advice");
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    }

    setLoading(false);
  };

  const handleQuickAdvice = (advice) => {
    setInput(advice);
  };

  return (
    <PhoneShell dark={dark}>
      <div className="flex flex-col h-full px-5 pt-8 pb-4 font-sans">
        <Header 
          title="AI Advisor" 
          subtitle="Get personalized financial insights"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        {/* Quick Advice Buttons - Show if no conversation started */}
        {messages.length <= 1 && (
          <div className="mt-4 mb-4 space-y-2">
            <p className={cn("text-xs font-bold uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-600")}>
              Quick Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ADVICE.map((advice) => (
                <button
                  key={advice}
                  onClick={() => handleQuickAdvice(advice)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    dark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  )}
                >
                  {advice}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto space-y-4 mb-4 px-2 py-4 rounded-2xl",
            dark ? "bg-slate-900/50" : "bg-slate-50/50"
          )}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 animate-fade-in",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "bot" && (
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 mt-1",
                  dark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                )}>
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-xs text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? dark
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-blue-500 text-white rounded-br-none"
                    : dark
                      ? "bg-slate-800 text-slate-200 rounded-bl-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                dark ? "bg-blue-600" : "bg-blue-500"
              )}>
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-3 rounded-bl-none",
                dark ? "bg-slate-800" : "bg-white border border-slate-200"
              )}>
                <div className="flex gap-1">
                  <div className={cn("h-2 w-2 rounded-full animate-bounce", dark ? "bg-slate-500" : "bg-slate-400")} />
                  <div className={cn("h-2 w-2 rounded-full animate-bounce animation-delay-100", dark ? "bg-slate-500" : "bg-slate-400")} />
                  <div className={cn("h-2 w-2 rounded-full animate-bounce animation-delay-200", dark ? "bg-slate-500" : "bg-slate-400")} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your finances..."
            className={cn(
              "flex-1 px-4 py-3 rounded-xl border font-medium text-sm",
              dark
                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            )}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-all",
              loading || !input.trim()
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </PhoneShell>
  );
}

// Helper function to get top spending categories
function getTopSpendingCategories(transactions, limit = 3) {
  const categoryTotals = {};
  let totalExpenses = 0;

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
      totalExpenses += t.amount;
    });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
