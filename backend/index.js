const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { admin, db } = require("./firebaseAdmin");
const PDFDocument = require("pdfkit");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API is healthy!" });
});

/**
 * PRODUCTION READY CONFIG HANDSHAKE
 * Instead of hardcoding keys in the frontend build, 
 * the frontend fetches its public credentials from this endpoint.
 */
app.get("/api/firebase-config", (req, res) => {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
  
  // Basic sanity check: are keys missing?
  if (!config.apiKey || config.apiKey.includes("YourKeyHere")) {
    return res.status(500).json({ 
      error: "Firebase keys not configured correctly on the backend server." 
    });
  }
  
  res.json(config);
});

// INVESTMENT TRACKER ENDPOINTS
app.get("/api/investments", async (req, res) => {
  try {
    const userId = req.query.userId || "mock-user";
    const snapshot = await db.collection("investments").where("userId", "==", userId).get();
    
    let investments = [];
    snapshot.forEach(doc => {
      investments.push({ id: doc.id, ...doc.data() });
    });

    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/investments", async (req, res) => {
  try {
    const { userId, assetName, symbol, quantity, buyPrice } = req.body;
    
    // In a real app we'd fetch the live price here.
    // Simulating a live price which is 5% higher than buyPrice
    const currentPrice = buyPrice * 1.05;

    const newAsset = {
      userId: userId || "mock-user",
      assetName,
      symbol,
      quantity,
      buyPrice,
      currentPrice,
      addedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("investments").add(newAsset);
    res.json({ id: docRef.id, ...newAsset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF EXPORT ENDPOINT
app.get("/api/export/pdf", async (req, res) => {
  try {
    const doc = new PDFDocument();
    let filename = encodeURIComponent("PocketWorth_Report.pdf");
    
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // Simple Template
    doc.fontSize(25).text("Pocket Worth - Monthly Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Date Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(14).text("Summary:");
    doc.fontSize(12).text("- Total Income: $5,200");
    doc.text("- Total Expenses: $1,825");
    doc.text("- Net Worth Growth: +$2,000");

    doc.moveDown();
    doc.fontSize(14).text("Note: This is an automatically generated report.");

    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Pocket Worth Backend running on http://localhost:${PORT}`);
});
