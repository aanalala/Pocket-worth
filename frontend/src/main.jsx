import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initFirebase } from './firebase'

/**
 * PRODUCTION BOOTSTRAP
 * We wait for Firebase to fetch its configuration from the backend
 * BEFORE we render the app. This ensures hooks like useUserData
 * have immediate access to valid Firebase instances.
 */
async function bootstrap() {
  try {
    await initFirebase();
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("FATAL: Application failed to initialize.", error);
    // Fallback UI or simple error message
    document.getElementById('root').innerHTML = `
      <div style="font-family: sans-serif; padding: 2rem; color: #ef4444;">
        <h1 style="font-weight: 900;">Initialization Error</h1>
        <p>The application could not connect to the backend configuration server. Please ensure the backend is running.</p>
      </div>
    `;
  }
}

bootstrap();
