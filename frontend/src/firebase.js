import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let app;
let db;
let auth;

/**
 * PRODUCTION READY INITIALIZATION
 * Fetches the public Firebase configuration from the backend API.
 * This ensures no keys are hardcoded in the frontend build.
 */
const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
export const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:5000`;

export async function initFirebase() {
  if (app) return { app, db, auth };

  try {
    const apiUrl = API_URL;
    const response = await fetch(`${apiUrl}/api/firebase-config`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    const config = await response.json();

    if (config && config.apiKey) {
      app = initializeApp(config);
      db = getFirestore(app);
      auth = getAuth(app);
      console.log("🔥 Firebase initialized via backend handshake");
      return { app, db, auth };
    } else {
      throw new Error("Invalid config received from backend");
    }
  } catch (error) {
    console.error("❌ Firebase Initialization Failed:", error);
    // Fallback for development if backend isn't running
    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      console.warn("⚠️ Falling back to local .env configuration");
      const fallbackConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      app = initializeApp(fallbackConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      return { app, db, auth };
    }
    throw error;
  }
}

// Export getters to ensure we always get the initialized instances
export const getDb = () => {
  if (!db) console.error("Firestore accessed before initialization!");
  return db;
};

export const getAuthInstance = () => {
  if (!auth) console.error("Auth accessed before initialization!");
  return auth;
};

// Re-export original references for backward compatibility where possible, 
// though they will be null until initFirebase is called.
export { app, db, auth };
