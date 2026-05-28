import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, Check, X, AlertCircle, ArrowRight, FileText } from "lucide-react";
import Tesseract from "tesseract.js";
import { PhoneShell } from "../components/PhoneShell";
import { Header } from "../components/Header";
import { cn, getLocalDateStr } from "../utils/utils";
import { auth, db, API_URL } from "../firebase";
import { collection, addDoc, doc, setDoc, increment, serverTimestamp } from "firebase/firestore";

export function ReceiptScannerScreen({ setActiveScreen, dark = false, navParams, setNavParams }) {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => console.error("Video play error:", err));
    }
  }, [showCamera]);

  useEffect(() => {
    return () => {
      // Clean up camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please check permissions or use upload.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };


  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setParsedData(null);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = async () => {
    if (!image) return;
    setLoading(true);
    setStatus("Reading receipt text...");
    setError("");

    try {
      // 1. OCR with Tesseract.js
      const { data: { text } } = await Tesseract.recognize(image, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setStatus(`OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      setStatus("AI Analysis in progress...");

      // 2. AI Parsing via Backend
      const apiUrl = API_URL;
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch(`${apiUrl}/api/ai/parse-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error("AI parsing failed");
      
      const result = await response.json();
      setParsedData(result);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Could not process receipt. Please try again or enter manually.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const saveExpense = async () => {
    if (!parsedData) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      const amount = parseFloat(parsedData.total || 0);
      
      // Save to Firestore
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type: "expense",
        amount,
        category: parsedData.category || "Other",
        description: parsedData.store || "Scanned Receipt",
        date: navParams?.defaultDate || parsedData.date || getLocalDateStr(new Date()),
        notes: `Items: ${parsedData.items?.join(", ") || "None"}`,
        isScanned: true,
        createdAt: serverTimestamp(),
      });

      // Update Balance
      await setDoc(doc(db, "users", user.uid), {
        balance: increment(-amount),
        expenses: increment(amount),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      if (setNavParams) setNavParams({});
      setActiveScreen("dashboard");
    } catch (err) {
      console.error("Error saving expense:", err);
      setError("Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneShell dark={dark}>
      <div className="px-5 pb-8 pt-8 font-sans">
        <Header 
          title="Receipt Scanner" 
          subtitle="AI-powered data extraction"
          onBack={() => {
            if (showCamera) stopCamera();
            else {
              if (setNavParams) setNavParams({});
              setActiveScreen("dashboard");
            }
          }} 
          dark={dark}
        />

        <div className="space-y-6">
          {showCamera ? (
            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white bg-black shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="h-[500px] w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-8 bg-gradient-to-t from-black/80 to-transparent">
                <button 
                  onClick={stopCamera}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <button 
                  onClick={capturePhoto}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-1 shadow-xl"
                >
                  <div className="h-full w-full rounded-full border-4 border-slate-100 bg-blue-600" />
                </button>
                
                <div className="w-14" /> {/* Spacer */}
              </div>
            </div>
          ) : !image ? (
            <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={startCamera}
                className={cn(
                  "flex h-60 cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all hover:scale-[1.01] active:scale-95 shadow-sm",
                  dark ? "bg-slate-900 border-slate-700 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                )}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Use Camera</p>
                <p className="mt-2 text-[10px] font-bold text-slate-400">Scan Receipt Real-time</p>
              </div>

              <div 
                onClick={() => fileInputRef.current.click()}
                className={cn(
                  "flex h-40 cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed transition-all hover:scale-[1.01] active:scale-95 shadow-sm",
                  dark ? "bg-slate-900 border-slate-700 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"
                )}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Upload Gallery</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl">
              <img src={image} alt="Receipt" className="h-80 w-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              {!parsedData && !loading && (
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <button 
                    onClick={processReceipt}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl"
                  >
                    <Sparkles className="h-5 w-5" />
                    Extract with AI
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className={cn(
              "flex flex-col items-center justify-center rounded-[2.5rem] border p-12 text-center",
              dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
            )}>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className={cn("text-sm font-black uppercase tracking-widest", dark ? "text-white" : "text-slate-900")}>{status}</p>
              <p className="mt-2 text-[10px] font-bold text-slate-400">This usually takes 5-10 seconds</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {parsedData && (
            <div className={cn(
              "animate-slide-up space-y-5 rounded-[2.5rem] border p-7 shadow-xl",
              dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            )}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                <h3 className={cn("text-lg font-black tracking-tight", dark ? "text-white" : "text-slate-900")}>Extraction Results</h3>
                <Check className="h-6 w-6 text-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store</p>
                  <p className={cn("text-sm font-bold", dark ? "text-white" : "text-slate-900")}>{parsedData.store || "Unknown"}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-xl font-black text-blue-600">${parsedData.total || "0.00"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                  <p className={cn("text-sm font-bold", dark ? "text-white" : "text-slate-900")}>{parsedData.date || "N/A"}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</p>
                  <p className={cn("text-sm font-bold", dark ? "text-white" : "text-slate-900")}>{parsedData.category || "Other"}</p>
                </div>
              </div>

              <button 
                onClick={saveExpense}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirm & Add Transaction
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}

function Sparkles(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
