const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

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
    serviceAccount = require('./pcwo-eaf77-firebase-adminsdk-fbsvc-3f3157bc61.json');
  } catch (error) {
     console.error("❌ Firebase Service Account not found. Please set FIREBASE_SERVICE_ACCOUNT in your .env or provide the JSON file.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("🔥 Firebase Admin Setup Complete (Connected directly to Cloud Firestore)");
}

const db = admin.firestore();

module.exports = { admin, db };
