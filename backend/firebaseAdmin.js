const admin = require("firebase-admin");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

/**
 * Initialize Firebase Admin.
 * In production, FIREBASE_SERVICE_ACCOUNT should be a stringified JSON of the service account.
 * In local dev, we fall back to the JSON file.
 */
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Fix: Double-escaped newlines in the private key cause PEM parsing errors.
    // We must replace the literal '\\n' with actual newline characters.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT from ENV:", error.message);
  }
}

if (!serviceAccount) {
  try {
    // If not in ENV, try to load from the local JSON file
    serviceAccount = require('./pcwo-eaf77-firebase-adminsdk-fbsvc-0a4f2c8fc4.json');
  } catch (error) {
    const errorMessage = 
      "\n=======================================================================\n" +
      "❌ FIREBASE INITIALIZATION ERROR: Service Account Credentials Not Found\n" +
      "=======================================================================\n" +
      "To fix this, please complete one of the following:\n\n" +
      "👉 1. LOCAL DEVELOPMENT:\n" +
      "   - Make sure 'pcwo-eaf77-firebase-adminsdk-fbsvc-0a4f2c8fc4.json' is inside your 'backend' folder.\n" +
      "   - OR set 'FIREBASE_SERVICE_ACCOUNT' as a JSON string in your 'backend/.env' file.\n\n" +
      "👉 2. PRODUCTION / DEPLOYMENT (Railway/Render/etc.):\n" +
      "   - Copy the entire content of your Firebase Service Account JSON file.\n" +
      "   - Set the environment variable 'FIREBASE_SERVICE_ACCOUNT' on your dashboard to that JSON string.\n" +
      "=======================================================================\n";
    console.error(errorMessage);
    throw new Error("Firebase Service Account credentials missing or invalid.");
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log("🔥 Firebase Admin Setup Complete (Connected directly to Cloud Firestore)");

const db = admin.firestore();

module.exports = { admin, db };
