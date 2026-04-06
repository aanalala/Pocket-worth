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
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUserData } from "./hooks/useUserData";
import { cn } from "./utils/utils";

export default function App() {
  const [activeScreen, setActiveScreen] = useState("signin");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Fetch global user settings
  const { userData, loading: dataLoading } = useUserData();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && (activeScreen === "signin" || activeScreen === "signup")) {
        setActiveScreen("dashboard");
      }
    });
    return () => unsubscribe();
  }, [activeScreen]);

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
        return <DashboardScreen setActiveScreen={setActiveScreen} />;
      case "income":
        return <AddTransactionScreen type="income" setActiveScreen={setActiveScreen} dark={dark} />;
      case "expense":
        return <AddTransactionScreen type="expense" setActiveScreen={setActiveScreen} dark={dark} />;
      case "goals":
        return <SavingsGoalsScreen setActiveScreen={setActiveScreen} />;
      case "insights":
        return <InsightsScreen setActiveScreen={setActiveScreen} />;
      case "categories":
        return <CategoriesScreen setActiveScreen={setActiveScreen} />;
      case "savings":
        return <SavingsTrackerScreen setActiveScreen={setActiveScreen} />;
      case "networth":
        return <NetWorthScreen setActiveScreen={setActiveScreen} />;
      case "settings":
      case "settingsLight":
      case "settingsDark":
        return <SettingsScreen setActiveScreen={setActiveScreen} />;
      default:
        return <DashboardScreen setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 font-sans text-slate-900 bg-slate-100/50">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="w-full flex justify-center transform transition-all hover:scale-[1.002] active:scale-100">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
