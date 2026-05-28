# PocketWorth Architecture & Logic Documentation

## 1. Project Overview
**PocketWorth** is a high-performance, real-time personal finance management platform designed to provide users with deep insights into their financial health. It features automated expense tracking, smart budgeting, goal management, and AI-powered receipt scanning, all wrapped in a premium, responsive glassmorphism UI.

---

## 2. System Architecture

The application follows a modern **Decoupled Full-Stack Architecture**:

### **A. Frontend (React + Vite)**
- **UI Framework**: React 19 (Functional Components + Hooks).
- **Styling**: Tailwind CSS 4 with custom design tokens for Glassmorphism and Dark Mode.
- **State Management**: Distributed state using React Hooks (`useState`, `useEffect`) and a central data synchronization hook (`useUserData`).
- **Data Visualization**: Recharts for interactive financial trends and distribution charts.
- **OCR Engine**: Tesseract.js for client-side text extraction from images.

### **B. Backend (Node.js + Express)**
- **API Layer**: RESTful API endpoints for sensitive operations (Investments, AI Parsing, PDF Export).
- **Security**: Firebase Admin SDK for server-side authentication and secure Firestore access.
- **Configuration Handshake**: Serves public Firebase configuration to the frontend dynamically, keeping keys out of the client source code.
- **Middleware**: Custom `authenticateToken` middleware for verifying JWT tokens from Firebase Auth.

### **C. Database & Infrastructure (Firebase)**
- **Firestore**: NoSQL document database for real-time data persistence.
- **Firebase Auth**: Secure user authentication (Email/Password, Anonymous, Social).
- **Cloud Storage**: (Future) For storing raw receipt images.

---

## 3. Core Logic & Data Flow

### **A. Real-Time Synchronization (`useUserData.js`)**
This is the "heart" of the application's data layer. It manages the lifecycle of a user's session:
1. **Auth Listener**: Monitors `onAuthStateChanged` to identify the logged-in user.
2. **Multi-Stream Listeners**: Opens simultaneous `onSnapshot` connections to Firestore for:
   - **Profile**: Balance, Currency, Dark Mode settings.
   - **Transactions**: Recent income/expenses.
   - **Subscriptions**: Recurring monthly services.
   - **Bills**: Upcoming financial obligations.
   - **Budgets**: Category spending limits.
   - **Goals**: Savings progress.
3. **Automatic Cleanup**: Unsubscribes from all listeners on logout to prevent memory leaks and data exposure.

### **B. Financial Intelligence (`dataTransform.js`)**
Converts raw Firestore documents into actionable insights:
- **Monthly Trends**: Aggregates transactions by month to compute Income vs. Expenses over time.
- **Spending Distribution**: Groups expenses by category for pie chart visualization.
- **Net Worth Trajectory**: Calculates historical balances by reversing transaction history from the current balance.
- **Budget Status**: Compares current category spending against user-defined limits.

### **C. AI Receipt Scanner Logic**
The OCR flow is designed for speed and reliability:
1. **Capture**: User uploads an image via `ReceiptScannerScreen`.
2. **Client OCR**: `Tesseract.js` extracts raw text locally (saves bandwidth).
3. **Backend Parsing**: Raw text is sent to the Express API.
   - **AI Path**: Uses OpenAI/Gemini to structure data into JSON.
   - **Fallback Path**: Uses advanced **Regex Patterns** to find Store Name, Total Amount, and Date if AI is unavailable.
4. **Validation & Save**: User reviews the extracted data and confirms to trigger an atomic Firestore update.

---

## 4. Database Schema (Firestore)

```
/users/{userId}
│
├── profile: { balance, income, expenses, currency, isDarkMode }
│
├── /transactions: { amount, type, category, description, date, isRecurring }
│
├── /subscriptions: { name, price, category, billingDate, icon }
│
├── /bills: { title, amount, dueDate, category, isPaid }
│
├── /budgets: { category, limit, spent, color }
│
└── /goals: { name, target, current, deadline, color }
```

---

## 5. Security Model
- **Token Verification**: Every backend request must include a Bearer Token, verified by Firebase Admin SDK.
- **Data Isolation**: Firestore Security Rules (enforced at the DB level) ensure users can *only* access documents where `request.auth.uid == userId`.
- **Secret Management**: Sensitive keys (Private Keys, API Keys) are stored in server-side `.env` files and never leaked to the client.

---

## 6. Logic Workflow: Adding an Expense
1. User enters data in `AddTransactionScreen`.
2. Frontend triggers a **Batch Write**:
   - Create document in `users/{id}/transactions`.
   - Update `balance` and `expenses` fields in `users/{id}` using `increment()`.
3. Firestore triggers real-time listeners.
4. `useUserData` hook updates its state.
5. All UI components (Dashboard, Charts, Lists) re-render instantly without a page refresh.

---

**Document Version**: 1.5.0  
**Status**: Production Ready  
**Last Updated**: May 8, 2026
