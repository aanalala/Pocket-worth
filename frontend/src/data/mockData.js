import { Wallet, TrendingUp, Landmark } from "lucide-react";

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const incomeExpenseData = [
  { month: "Jul", income: 5200, expenses: 2700 },
  { month: "Aug", income: 5000, expenses: 3100 },
  { month: "Sep", income: 5500, expenses: 2800 },
  { month: "Oct", income: 5000, expenses: 3000 },
  { month: "Nov", income: 5300, expenses: 2600 },
  { month: "Dec", income: 5200, expenses: 1825 },
];

export const spendingData = [
  { name: "Housing", value: 1200, color: "#3b82f6" },
  { name: "Food", value: 200, color: "#f59e0b" },
  { name: "Transportation", value: 120, color: "#8b5cf6" },
  { name: "Entertainment", value: 60, color: "#ec4899" },
  { name: "Shopping", value: 150, color: "#06b6d4" },
  { name: "Utilities", value: 90, color: "#84cc16" },
];

export const budgets = [
  { name: "Housing", spent: 1200, budget: 1200, color: "#3b82f6" },
  { name: "Food", spent: 200, budget: 400, color: "#f59e0b" },
  { name: "Transportation", spent: 120, budget: 200, color: "#8b5cf6" },
  { name: "Entertainment", spent: 60, budget: 150, color: "#ec4899" },
  { name: "Shopping", spent: 150, budget: 250, color: "#06b6d4" },
  { name: "Utilities", spent: 90, budget: 100, color: "#84cc16" },
  { name: "Healthcare", spent: 0, budget: 200, color: "#ef4444" },
];

export const savingsGoals = [
  {
    name: "Emergency Fund",
    current: 6500,
    target: 10000,
    remaining: 3500,
    monthsLeft: 7,
    color: "#10b981",
  },
  {
    name: "Vacation to Japan",
    current: 2800,
    target: 5000,
    remaining: 2200,
    monthsLeft: 3,
    color: "#3b82f6",
  },
  {
    name: "New Laptop",
    current: 1500,
    target: 2000,
    remaining: 500,
    monthsLeft: 2,
    color: "#8b5cf6",
  },
];

export const savingsGrowth = [
  1500, 1800, 2200, 2000, 2300, 2000, 2400, 1800, 2600, 1900, 2600, 3375,
].map((value, index) => ({ month: months[index], value }));

export const netWorthHistory = [
  17000, 19000, 21000, 23000, 25000, 27000, 29000, 31000, 33000, 35000, 36500, 38000,
].map((value, index) => ({ month: months[index], value }));

export const assetBreakdown = [
  { name: "Cash & Savings", subtitle: "Bank accounts", value: 12000, icon: Wallet },
  { name: "Investments", subtitle: "Stocks, crypto, funds", value: 21140, icon: TrendingUp },
  { name: "Property", subtitle: "Real estate", value: 10660, icon: Landmark },
];

export const screens = [
  { key: "signin", label: "01 Sign In" },
  { key: "signup", label: "02 Sign Up" },
  { key: "dashboard", label: "03 Dashboard" },
  { key: "income", label: "04 Add Income" },
  { key: "expense", label: "05 Add Expense" },
  { key: "goals", label: "06 Savings Goals" },
  { key: "insights", label: "07 Insights" },
  { key: "categories", label: "08 Categories" },
  { key: "savings", label: "09 Savings Tracker" },
  { key: "networth", label: "10 Net Worth" },
  { key: "settingsLight", label: "11 Settings Light" },
  { key: "settingsDark", label: "12 Settings Dark" },
];
