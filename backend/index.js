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

// --- MIDDLEWARE ---

// Firebase Auth Token Verification Middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(403).json({ error: "Unauthorized access" });
  }
}

// --- CORE SYSTEM ROUTES ---

app.get("/", (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a;">
      <h1 style="font-weight: 900; margin-bottom: 0.5rem;">🚀 Pocket Worth Backend</h1>
      <p style="color: #64748b; margin-bottom: 2rem;">Server is currently active & secure.</p>
      <div style="display: flex; gap: 10px;">
        <a href="/api/health" style="background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; text-decoration: none; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">Check Health</a>
        <a href="/api/firebase-config" style="background-color: #1e293b; color: white; padding: 0.75rem 1.5rem; border-radius: 1rem; text-decoration: none; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(30, 41, 59, 0.3);">Config API</a>
      </div>
    </body>
  `);
});

app.get("/api/health", async (req, res) => {
  try {
    await db.collection("health").doc("check").set({ lastPing: new Date().toISOString() });
    res.json({
      status: "API is healthy!",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: "API is degraded", error: error.message });
  }
});

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
  if (!config.apiKey || config.apiKey.includes("YourKeyHere")) {
    return res.status(500).json({ error: "Firebase keys not configured correctly." });
  }
  res.json(config);
});

// --- AI UTILITIES ---

async function categorizeExpense(description) {
  const keywordMap = {
    "pathao": "Transport", "uber": "Transport", "lyft": "Transport",
    "kfc": "Food", "pizza": "Food", "mcdonalds": "Food",
    "netflix": "Subscription", "spotify": "Subscription", "gym": "Health",
    "electricity": "Bills", "rent": "Bills", "internet": "Bills"
  };
  const lowered = description.toLowerCase();
  for (const key in keywordMap) {
    if (lowered.includes(key)) return keywordMap[key];
  }
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Categorize this expense description into one of the following categories: Transport, Food, Subscription, Bills, Health, Entertainment, Other. Description: "${description}"` }],
          temperature: 0
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "Other";
    } catch (e) {
      return "Other";
    }
  }
  return "Other";
}

// --- PROTECTED FEATURE ROUTES ---

const txnRouter = express.Router();

txnRouter.post('/', authenticateToken, async (req, res) => {
  const { amount, type, description, category, notes, date, currency } = req.body;
  if (amount == null || !type) return res.status(400).json({ error: 'Amount and type required' });
  try {
    const finalCategory = category || await categorizeExpense(description || '');
    const newTxn = {
      userId: req.user.uid,
      amount,
      type,
      description: description || '',
      category: finalCategory,
      notes: notes || '',
      date: date ? admin.firestore.Timestamp.fromDate(new Date(date)) : admin.firestore.FieldValue.serverTimestamp(),
      currency: currency || 'USD',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('users').doc(req.user.uid).collection('transactions').add(newTxn);
    res.json({ id: docRef.id, ...newTxn });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

txnRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('users').doc(req.user.uid).collection('transactions').orderBy('date', 'desc').get();
    const txns = [];
    snapshot.forEach(doc => txns.push({ id: doc.id, ...doc.data() }));
    res.json(txns);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

txnRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const txnRef = db.collection('users').doc(req.user.uid).collection('transactions').doc(req.params.id);
    const doc = await txnRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    await txnRef.delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/api/transactions', txnRouter);

// Investment Tracker
app.get("/api/investments", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("users").doc(req.user.uid).collection("investments").get();
    let investments = [];
    snapshot.forEach(doc => investments.push({ id: doc.id, ...doc.data() }));
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/investments", authenticateToken, async (req, res) => {
  try {
    const { assetName, symbol, quantity, buyPrice } = req.body;
    const newAsset = {
      assetName, symbol, quantity, buyPrice,
      currentPrice: buyPrice * 1.05,
      addedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection("users").doc(req.user.uid).collection("investments").add(newAsset);
    res.json({ id: docRef.id, ...newAsset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Receipt Parsing
app.post("/api/ai/parse-receipt", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });
  
  try {
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("YourKeyHere")) {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: 'Extract receipt data to JSON: { "store": string, "date": string, "total": number, "items": string[], "category": string }' }, { role: 'user', content: text }],
          temperature: 0
        })
      });
      const data = await response.json();
      return res.json(JSON.parse(data.choices?.[0]?.message?.content || "{}"));
    } else {
      // Robust Regex-based Fallback Parser
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // 1. Extract Store (Usually the first non-empty line)
      const store = lines[0] || "Unknown Store";

      // 2. Extract Total (Look for lines containing "total", "amount", "sum", "paid", etc.)
      let total = 0;
      const totalRegex = /(?:total|amount|sum|paid|net|grand total)[\s\:\$]*([\d\.,]+)/i;
      for (const line of lines) {
        const match = line.match(totalRegex);
        if (match) {
          const val = parseFloat(match[1].replace(',', ''));
          if (val > total) total = val;
        }
      }

      // If no "total" keyword found, look for the largest currency-looking number at the end
      if (total === 0) {
        const priceRegex = /\$?(\d+\.\d{2})/g;
        let matches;
        while ((matches = priceRegex.exec(text)) !== null) {
          const val = parseFloat(matches[1]);
          if (val > total) total = val;
        }
      }

      // 3. Extract Date
      let date = new Date().toISOString().split('T')[0];
      const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
      const dateMatch = text.match(dateRegex);
      if (dateMatch) {
        try {
          const d = new Date(dateMatch[1]);
          if (!isNaN(d.getTime())) date = d.toISOString().split('T')[0];
        } catch(e) {}
      }

      // 4. Categorize (Simple keyword match)
      const category = await categorizeExpense(store + " " + text);

      res.json({
        store,
        date,
        total,
        items: [], // Complex to extract via regex
        category,
        isAIParsed: false
      });
    }
  } catch (e) {
    console.error("OCR Parse Error:", e);
    res.status(500).json({ error: "Parsing failure" });
  }
});

// AI Chatbot
app.post("/api/ai/chat", authenticateToken, async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });
  
  try {
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("YourKeyHere")) {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: `You are Pocket Worth AI, a premium financial advisor. 
              User Data: ${JSON.stringify(context)}
              Guidelines:
              1. Be professional, concise, and accurate.
              2. Analyze spending patterns and give actionable advice.
              3. If asked about balance or goals, use the provided data.
              4. Don't give legal advice, only financial insights.` 
            }, 
            { role: 'user', content: message }
          ],
          temperature: 0.7
        })
      });
      const data = await response.json();
      res.json({ answer: data.choices?.[0]?.message?.content || "I'm having trouble analyzing your request. Please try again." });
    } else {
      // Intelligent Simulation Fallback
      const lowered = message.toLowerCase();
      let answer = "I'm currently in 'Insight Mode'. To unlock full AI power, please configure the OpenAI API key in the backend. ";
      
      if (lowered.includes("balance")) {
        answer += `Your current balance is ${context.balance}.`;
      } else if (lowered.includes("spend") || lowered.includes("expense")) {
        answer += `You've spent ${context.expenses} so far. Your recent transactions include ${context.recentTransactions?.[0]?.description || 'none yet'}.`;
      } else if (lowered.includes("goal")) {
        answer += `You have ${context.goals?.length || 0} active goals. Keep pushing!`;
      } else {
        answer += "Ask me about your balance, spending, or goals!";
      }
      
      res.json({ answer });
    }
  } catch (e) {
    res.status(500).json({ error: "Chat failure" });
  }
});

// Export PDF
app.get("/api/export/pdf", async (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-disposition", `attachment; filename="PocketWorth_Report.pdf"`);
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(25).text("Pocket Worth - Monthly Report", { align: "center" });
    doc.end();
  } catch (error) {
    res.status(500).json({ error: "PDF failure" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Pocket Worth Backend running on http://0.0.0.0:${PORT}`);
});
