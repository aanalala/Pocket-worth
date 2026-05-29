import React, { useState } from "react";
import { Moon, Sparkles, DollarSign, User, LogOut, Check, ChevronDown, Edit2, Download } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn } from "../utils/utils";
import { auth, db } from "../firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useUserData } from "../hooks/useUserData";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConversion";
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from "../utils/exportData";

export function SettingsRowEnhanced({ icon, title, value, trailing, onClick, dark = false }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-[2rem] px-5 py-4 transition-all cursor-pointer", 
        dark ? "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 shadow-xl shadow-black/10" : "bg-white hover:bg-slate-50 border border-slate-100 shadow-sm shadow-slate-100/50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors", 
          dark ? "bg-slate-900 text-blue-400 border border-slate-700/50" : "bg-blue-50 text-blue-600 shadow-sm"
        )}>
          {icon}
        </div>
        <div>
          <p className={cn("font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>{title}</p>
          {value ? <p className={cn("text-sm font-medium mt-0.5", dark ? "text-slate-400" : "text-slate-500")}>{value}</p> : null}
        </div>
      </div>
      {trailing !== undefined ? trailing : <ChevronDown className={cn("h-5 w-5", dark ? "text-slate-500" : "text-slate-400")} />}
    </div>
  );
}

export function SettingsScreenEnhanced({ setActiveScreen }) {
  const { userData, transactions, budgets } = useUserData();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: userData?.displayName || "",
    email: userData?.email || ""
  });
  const [exportPeriod, setExportPeriod] = useState("month");
  
  const dark = userData?.isDarkMode || false;
  const currentCurrency = userData?.currency || "NPR";

  const handleToggleDarkMode = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { isDarkMode: !dark }, { merge: true });
    } catch (error) {
      console.error("Error updating dark mode:", error);
    }
  };

  const handleCurrencyChange = async (currency) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { currency }, { merge: true });
      setShowCurrencyModal(false);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileForm.displayName
        });
        
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { 
          displayName: profileForm.displayName,
          email: profileForm.email
        }, { merge: true });

        setShowProfileModal(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleExport = (format) => {
    const filename = generateFilename(`${exportPeriod}-export`);
    
    if (format === 'csv') {
      const csv = exportToCSV(userData, transactions, budgets, exportPeriod);
      downloadFile(csv, filename, 'csv');
    } else if (format === 'json') {
      const json = exportToJSON(userData, transactions, budgets, exportPeriod);
      downloadFile(JSON.stringify(json), filename, 'json');
    }
    
    setShowExportModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveScreen("signin");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Settings" 
          subtitle="Manage your account"
          onBack={() => setActiveScreen("dashboard")} 
          dark={dark}
        />

        <div className="space-y-6">
          {/* Profile Card */}
          <div className={cn(
            "rounded-[2.5rem] border p-6 transition-all",
            dark ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-xl shadow-black/10" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold",
                  dark ? "bg-slate-700 text-blue-400" : "bg-blue-500 text-white"
                )}>
                  {profileForm.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className={cn("text-xl font-black", dark ? "text-white" : "text-slate-900")}>
                    {profileForm.displayName}
                  </h3>
                  <p className={cn("text-sm", dark ? "text-slate-400" : "text-slate-600")}>
                    {profileForm.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  dark ? "bg-slate-700 text-blue-400 hover:bg-slate-600" : "bg-blue-200 text-blue-600 hover:bg-blue-300"
                )}
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <h3 className={cn("mb-3 text-sm font-black uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-600")}>
              Appearance
            </h3>
            <SettingsRowEnhanced
              icon={<Moon className="h-5 w-5" />}
              title="Dark Mode"
              value={dark ? "On" : "Off"}
              onClick={handleToggleDarkMode}
              trailing={
                <div className={cn(
                  "h-6 w-11 rounded-full transition-colors",
                  dark ? "bg-blue-600" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "h-5 w-5 rounded-full transition-all m-0.5",
                    dark ? "translate-x-5 bg-white" : "translate-x-0 bg-white"
                  )} />
                </div>
              }
              dark={dark}
            />
          </div>

          {/* Currency Section */}
          <div>
            <h3 className={cn("mb-3 text-sm font-black uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-600")}>
              Currency & Location
            </h3>
            <SettingsRowEnhanced
              icon={<DollarSign className="h-5 w-5" />}
              title="Currency"
              value={currentCurrency}
              onClick={() => setShowCurrencyModal(true)}
              dark={dark}
            />
          </div>

          {/* Export Section */}
          <div>
            <h3 className={cn("mb-3 text-sm font-black uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-600")}>
              Data & Export
            </h3>
            <SettingsRowEnhanced
              icon={<Download className="h-5 w-5" />}
              title="Export Data"
              value="Download financial data"
              onClick={() => setShowExportModal(true)}
              dark={dark}
            />
          </div>

          {/* Account Section */}
          <div>
            <h3 className={cn("mb-3 text-sm font-black uppercase tracking-widest", dark ? "text-slate-400" : "text-slate-600")}>
              Account
            </h3>
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center justify-between rounded-[2rem] px-5 py-4 transition-all cursor-pointer",
                dark ? "bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 shadow-xl shadow-black/10" : "bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  dark ? "bg-red-900/40 text-red-400" : "bg-red-200 text-red-600"
                )}>
                  <LogOut className="h-5 w-5" />
                </div>
                <p className={cn("font-bold tracking-tight", dark ? "text-red-400" : "text-red-600")}>Sign Out</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={cn(
            "w-full max-w-lg rounded-t-[3rem] p-6 space-y-4",
            dark ? "bg-slate-900" : "bg-white"
          )}>
            <h2 className={cn("text-xl font-black", dark ? "text-white" : "text-slate-900")}>Edit Profile</h2>

            <div className="space-y-4">
              <div>
                <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border font-medium",
                    dark
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                />
              </div>

              <div>
                <label className={cn("text-xs font-bold uppercase tracking-widest block mb-2", dark ? "text-slate-400" : "text-slate-600")}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border font-medium opacity-50 cursor-not-allowed",
                    dark
                      ? "bg-slate-800 border-slate-700 text-slate-400"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  )}
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={cn(
            "w-full max-w-lg rounded-t-[3rem] p-6 max-h-[70vh] overflow-y-auto",
            dark ? "bg-slate-900" : "bg-white"
          )}>
            <h2 className={cn("text-xl font-black mb-4", dark ? "text-white" : "text-slate-900")}>
              Select Currency
            </h2>

            <div className="space-y-2">
              {SUPPORTED_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all font-medium",
                    currentCurrency === curr.code
                      ? dark
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-blue-50 border-blue-500 text-blue-600"
                      : dark
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                        : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{curr.name}</span>
                    <span className="font-bold">{curr.symbol} {curr.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className={cn(
            "w-full max-w-lg rounded-t-[3rem] p-6 space-y-4",
            dark ? "bg-slate-900" : "bg-white"
          )}>
            <h2 className={cn("text-xl font-black", dark ? "text-white" : "text-slate-900")}>Export Data</h2>

            <div>
              <label className={cn("text-xs font-bold uppercase tracking-widest block mb-3", dark ? "text-slate-400" : "text-slate-600")}>
                Time Period
              </label>
              <div className="space-y-2">
                {['month', 'year', 'all'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setExportPeriod(period)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all font-medium",
                      exportPeriod === period
                        ? dark
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-blue-50 border-blue-500 text-blue-600"
                        : dark
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                          : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                    )}
                  >
                    {period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
              >
                Download CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
