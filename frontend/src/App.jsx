import React, { useState, useEffect } from "react";
import { AuthScreen } from "./screens/AuthScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { AddTransactionScreen } from "./screens/AddTransactionScreen";
import { SavingsGoalsScreen } from "./screens/SavingsGoalsScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { CategoriesScreen } from "./screens/CategoriesScreen";
import { SavingsTrackerScreen } from "./screens/SavingsTrackerScreen";
import { NetWorthScreen } from "./screens/NetWorthScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SettingsScreenEnhanced } from "./screens/SettingsScreenEnhanced";
import { ReceiptScannerScreen } from "./screens/ReceiptScannerScreen";
import { ChatbotScreen } from "./screens/ChatbotScreen";
import { AiAdvisorEnhancedScreen } from "./screens/AiAdvisorEnhancedScreen";
import { SubscriptionTrackerScreen } from "./screens/SubscriptionTrackerScreen";
import { SubscriptionTrackerEnhancedScreen } from "./screens/SubscriptionTrackerEnhancedScreen";
import { BillReminderScreen } from "./screens/BillReminderScreen";
import { BudgetGoalsScreen } from "./screens/BudgetGoalsScreen";
import { BudgetGoalsEnhancedScreen } from "./screens/BudgetGoalsEnhancedScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUserData } from "./hooks/useUserData";
export default function App() {
  const [activeScreen, setActiveScreen] = useState("signin");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [navParams, setNavParams] = useState({});

  
  // Fetch global user settings
  const { userData } = useUserData();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setActiveScreen((prev) => (prev === "signin" || prev === "signup" ? "dashboard" : prev));
      }
    });
    return () => unsubscribe();
  }, []);


  const dark = userData?.isDarkMode || false;

  const renderScreen = () => {
    if (authLoading) {
      return (
        <div className="flex h-screen items-center justify-center font-black text-slate-500 uppercase tracking-widest animate-pulse">
          Pocket Worth Loading...
        </div>
      );
    }

    if (!user) {
      if (activeScreen === "signup") return <AuthScreen mode="signup" />;
      return <AuthScreen mode="signin" />;
    }

    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "income":
        return <AddTransactionScreen type="income" setActiveScreen={setActiveScreen} dark={dark} navParams={navParams} setNavParams={setNavParams} />;
      case "expense":
        return <AddTransactionScreen type="expense" setActiveScreen={setActiveScreen} dark={dark} navParams={navParams} setNavParams={setNavParams} />;
      case "goals":
        return <SavingsGoalsScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "insights":
        return <InsightsScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "budgets":
      case "categories":
        return <BudgetGoalsEnhancedScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "savings":
        return <SavingsTrackerScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "networth":
        return <NetWorthScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "ocr":
        return <ReceiptScannerScreen setActiveScreen={setActiveScreen} dark={dark} navParams={navParams} setNavParams={setNavParams} />;
      case "chatbot":
        return <AiAdvisorEnhancedScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "subscriptions":
        return <SubscriptionTrackerEnhancedScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "bills":
        return <BillReminderScreen setActiveScreen={setActiveScreen} dark={dark} />;
      case "calendar":
        return <CalendarScreen setActiveScreen={setActiveScreen} dark={dark} navParams={navParams} setNavParams={setNavParams} />;
      case "settings":
      case "settingsLight":
      case "settingsDark":
        return <SettingsScreenEnhanced setActiveScreen={setActiveScreen} dark={dark} />;
      default:
        return <DashboardScreen setActiveScreen={setActiveScreen} dark={dark} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 font-sans text-slate-900 bg-slate-100/50">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="w-full flex justify-center">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
