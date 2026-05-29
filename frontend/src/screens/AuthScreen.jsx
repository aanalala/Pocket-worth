import React, { useState } from "react";
import { User, Shield, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { PhoneShell } from "../components/PhoneShell";
import { AppLogo } from "../components/AppLogo";
import { SegmentedControl } from "../components/SegmentedControl";
import { InputField } from "../components/InputField";
import { FeaturePill } from "../components/FeaturePill";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export function AuthScreen({ mode = "signin" }) {
  const [tab, setTab] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError("");

    try {
      if (tab === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Auth profile
        if (fullName) {
          await updateProfile(user, { displayName: fullName });
        }

        // Initialize Firestore profile for new user
        if (db) {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: fullName || null,
            balance: 0,
            income: 0,
            expenses: 0,
                        isDarkMode: false,
            currency: "NPR",
            createdAt: serverTimestamp(),
          });
          console.log("🔥 Firestore profile initialized for:", user.uid);
        }

        console.log("🔥 User signed up:", user.email);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("🔥 User signed in:", email);
      }
    } catch (err) {
      console.error("Auth error:", err.code);
      switch(err.code) {
        case 'auth/user-not-found':
          setError("No account found with this email.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/email-already-in-use':
          setError("An account already exists with this email.");
          break;
        case 'auth/weak-password':
          setError("Password should be at least 6 characters.");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address.");
          break;
        default:
          setError("Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      console.log("🔥 Signed in as Guest");
    } catch (err) {
      console.error("Guest auth error:", err);
      setError("Guest login failed.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <PhoneShell>
      <div className="flex min-h-[860px] flex-col px-6 pb-8 pt-14 font-sans">
        <div className="mb-12 flex justify-center">
          <AppLogo />
        </div>

        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/50">
          <SegmentedControl
            value={tab}
            onChange={(value) => {
              setTab(value);
              setError("");
            }}
            options={[
              { label: "Sign In", value: "signin" },
              { label: "Sign Up", value: "signup" },
            ]}
          />

          <form onSubmit={handleAuth} className="mt-6 space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {tab === "signup" && (
              <InputField 
                label="Full Name" 
                placeholder="John Doe" 
                icon={<User className="h-5 w-5" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <InputField
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              icon={<span className="text-base">✉</span>}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              icon={<Shield className="h-5 w-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              right={
                <button 
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)} 
                  className="text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            {tab === "signin" ? (
              <div className="flex items-center justify-between px-1 text-sm font-semibold">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Remember me
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700">Forgot password?</button>
              </div>
            ) : (
              <p className="px-2 text-center text-xs leading-5 font-medium text-slate-500">
                By signing up, you agree to our <span className="font-bold text-blue-600 cursor-pointer hover:underline">Terms</span> and <span className="font-bold text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-100 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {tab === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative z-10 bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
            </div>

            <button 
              type="button"
              onClick={handleGuest}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Continue as Guest
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <FeaturePill icon={<Shield className="h-5 w-5 text-green-500" />} title="Secure" />
          <FeaturePill icon={<TrendingUp className="h-5 w-5 text-blue-500" />} title="Insights" />
        </div>
      </div>
    </PhoneShell>
  );
}