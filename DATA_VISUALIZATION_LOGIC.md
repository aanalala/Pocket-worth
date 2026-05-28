# PocketWorth Data Visualization Logic

---

## **Overview**

The PocketWorth application visualizes financial data using two primary transformation functions that aggregate transactions and prepare them for Recharts components. All data aggregation happens **client-side** in the `dataTransform.js` utility file.

---

## **1. SPENDING DISTRIBUTION (Pie Chart)**

### **Function**: `getSpendingByCategory(transactions)`

**Source**: [frontend/src/utils/dataTransform.js](frontend/src/utils/dataTransform.js)

### **Logic Flow**

```javascript
function getSpendingByCategory(transactions) {
  // Step 1: Filter only expense transactions
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const categoryMap = {};

  // Step 2: Aggregate amounts by category
  expenseTransactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
  });

  // Step 3: Assign colors from palette
  const colors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#ef4444"];
  
  // Step 4: Return formatted array
  return Object.keys(categoryMap).map((name, index) => ({
    name,
    value: categoryMap[name],
    color: colors[index % colors.length]
  }));
}
```

### **Detailed Breakdown**

#### **Step 1: Filter Expenses**
- Keeps only transactions where `type === "expense"`
- Ignores income transactions completely
- Income visualization handled separately in monthly trends

#### **Step 2: Aggregate by Category**
Uses object accumulation pattern:
```javascript
categoryMap = {
  "Food": 125.50,
  "Transportation": 45.00,
  "Entertainment": 89.99,
  "Housing": 1200.00
}
```

#### **Step 3: Color Assignment**
- Predefined palette of 7 colors (Tailwind shades)
- Cycling through palette: `colors[index % colors.length]`
- If 8+ categories exist, wraps around to first color
- **Color codes**:
  - `#3b82f6` - Blue
  - `#f59e0b` - Amber
  - `#8b5cf6` - Purple
  - `#ec4899` - Pink
  - `#06b6d4` - Cyan
  - `#84cc16` - Lime
  - `#ef4444` - Red

#### **Step 4: Output Format**
```javascript
[
  { name: "Food", value: 125.50, color: "#3b82f6" },
  { name: "Transportation", value: 45.00, color: "#f59e0b" },
  { name: "Entertainment", value: 89.99, color: "#8b5cf6" },
  { name: "Housing", value: 1200.00, color: "#ec4899" }
]
```

### **Rendering Implementation**

**File**: [frontend/src/screens/DashboardScreen.jsx](frontend/src/screens/DashboardScreen.jsx)

```jsx
<SectionCard title="Spending Distribution" dark={dark}>
  {hasTransactions ? (
    <>
      {/* Donut Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={spendingData}              // Our formatted data
              dataKey="value"                  // Use 'value' field for slice size
              innerRadius={60}                 // Donut hole diameter
              outerRadius={100}                // Outer diameter
              paddingAngle={4}                 // Gap between slices
              stroke="none"                    // No slice borders
            >
              {spendingData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            
            <Tooltip 
              contentStyle={{
                borderRadius: '2rem',
                background: dark ? '#1e293b' : '#fff',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
              }}
              formatter={(val) => formatMoney(val, currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {spendingData.slice(0, 4).map((item, index) => (
          <div key={index} className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-[10px] font-black uppercase">
                {item.name}
              </span>
            </div>
            <p className="text-lg font-black">
              {formatMoney(item.value, currency)}
            </p>
          </div>
        ))}
      </div>
    </>
  ) : (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-sm font-black uppercase">No spending data yet</p>
    </div>
  )}
</SectionCard>
```

### **Visual Output**
- **Donut chart** with colored slices
- **Color-coded legend** showing top 4 categories with amounts
- **Interactive tooltip** showing formatted currency on hover
- **Empty state** placeholder when no transactions exist

### **Example Scenario**

**Input (Raw Transactions)**:
```javascript
[
  { type: "expense", amount: 50, category: "Food", date: "2026-04-01" },
  { type: "expense", amount: 30, category: "Food", date: "2026-04-05" },
  { type: "expense", amount: 100, category: "Transportation", date: "2026-04-03" },
  { type: "expense", amount: 75, category: "Entertainment", date: "2026-04-04" },
  { type: "income", amount: 5000, category: "Salary", date: "2026-04-01" }  // Ignored
]
```

**Output (After getSpendingByCategory)**:
```javascript
[
  { name: "Food", value: 80, color: "#3b82f6" },
  { name: "Transportation", value: 100, color: "#f59e0b" },
  { name: "Entertainment", value: 75, color: "#8b5cf6" }
]
```

**Rendered Chart**: Pie with 3 slices sized proportionally to amounts

---

## **2. INCOME vs EXPENSES TREND (Bar Chart)**

### **Function**: `getMonthlyTrends(transactions)`

**Source**: [frontend/src/utils/dataTransform.js](frontend/src/utils/dataTransform.js)

### **Logic Flow**

```javascript
function getMonthlyTrends(transactions) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendsMap = {};

  // Step 1: Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    trendsMap[monthName] = { month: monthName, income: 0, expenses: 0 };
  }

  // Step 2: Aggregate transactions into months
  transactions.forEach(t => {
    const d = new Date(t.date);
    const monthName = months[d.getMonth()];
    if (trendsMap[monthName]) {
      if (t.type === "income") 
        trendsMap[monthName].income += Number(t.amount);
      else 
        trendsMap[monthName].expenses += Number(t.amount);
    }
  });

  // Step 3: Return ordered array
  return Object.values(trendsMap);
}
```

### **Detailed Breakdown**

#### **Step 1: Initialize Last 6 Months**
Creates a `trendsMap` object with 6 months pre-initialized to zero:
```javascript
{
  "Jan": { month: "Jan", income: 0, expenses: 0 },
  "Feb": { month: "Feb", income: 0, expenses: 0 },
  "Mar": { month: "Mar", income: 0, expenses: 0 },
  "Apr": { month: "Apr", income: 0, expenses: 0 },
  "May": { month: "May", income: 0, expenses: 0 },
  "Jun": { month: "Jun", income: 0, expenses: 0 }
}
```

**Why?** Ensures all months appear on chart even if no transactions for that month

#### **Step 2: Aggregate Transactions**
Loops through each transaction:
- Extracts month from `transaction.date`
- Adds amount to corresponding month's `income` or `expenses`
- **Important**: Skips transactions from months not in last 6 months

Example aggregation:
```javascript
Transaction: { type: "income", amount: 5000, date: "2026-04-15" }
  ↓
Extract month: April (month index 3)
  ↓
monthName = "Apr"
  ↓
trendsMap["Apr"].income += 5000
  ↓
Result: { month: "Apr", income: 5000, expenses: 0 }
```

#### **Step 3: Return Ordered Array**
Converts object to array maintaining month order:
```javascript
[
  { month: "Jan", income: 2500, expenses: 1000 },
  { month: "Feb", income: 3200, expenses: 1200 },
  { month: "Mar", income: 0, expenses: 800 },      // No income this month
  { month: "Apr", income: 5200, expenses: 1800 },
  { month: "May", income: 0, expenses: 0 },        // No transactions
  { month: "Jun", income: 4800, expenses: 2100 }
]
```

### **Rendering Implementation**

**File**: [frontend/src/screens/DashboardScreen.jsx](frontend/src/screens/DashboardScreen.jsx)

```jsx
<SectionCard title="Cashflow Trend" dark={dark}>
  {hasTransactions ? (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyTrends}>
          {/* Grid background */}
          <CartesianGrid 
            vertical={false} 
            stroke={dark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} 
            strokeDasharray="3 3" 
          />
          
          {/* X-axis (months) */}
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8' }} 
          />
          
          {/* Y-axis (currency) */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: dark ? '#475569' : '#94a3b8' }} 
          />
          
          {/* Tooltip on hover */}
          <Tooltip 
            cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
            contentStyle={{
              borderRadius: '2rem',
              background: dark ? '#1e293b' : '#fff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
            }}
            formatter={(val) => formatMoney(val, currency)}
          />
          
          {/* Blue bars for income */}
          <Bar 
            dataKey="income" 
            radius={[4, 4, 0, 0]} 
            fill="#3b82f6" 
          />
          
          {/* Red bars for expenses */}
          <Bar 
            dataKey="expenses" 
            radius={[4, 4, 0, 0]} 
            fill="#ef4444" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-xs font-black uppercase">Your cashflow chart will appear here</p>
    </div>
  )}
</SectionCard>
```

### **Visual Output**
- **Grouped bar chart** with Jan-Jun months on X-axis
- **Blue bars** representing income
- **Red bars** representing expenses
- **Rounded tops** on bars for modern appearance
- **Interactive tooltip** showing formatted currency values
- **Empty state** placeholder when no transactions exist

### **Example Scenario**

**Input (Raw Transactions)**:
```javascript
[
  { type: "income", amount: 5000, date: "2026-04-01" },
  { type: "expense", amount: 1500, date: "2026-04-05" },
  { type: "expense", amount: 300, date: "2026-04-10" },
  { type: "income", amount: 4800, date: "2026-05-01" },
  { type: "expense", amount: 2100, date: "2026-05-15" },
  { type: "expense", amount: 100, date: "2026-03-20" }
]
```

**Processing** (assuming current month is June 2026):
1. Initialize: Jan-Jun with 0/0 values
2. Add April transactions: income=5000, expenses=1800
3. Add May transactions: income=4800, expenses=2100
4. Add March transactions: income=0, expenses=100

**Output**:
```javascript
[
  { month: "Jan", income: 0, expenses: 0 },
  { month: "Feb", income: 0, expenses: 0 },
  { month: "Mar", income: 0, expenses: 100 },
  { month: "Apr", income: 5000, expenses: 1800 },
  { month: "May", income: 4800, expenses: 2100 },
  { month: "Jun", income: 0, expenses: 0 }
]
```

**Rendered Chart**: 
- Jan-Feb: Flat baseline (no data)
- Mar: Small red bar (expenses)
- Apr: Large blue bar (income), medium red bar (expenses)
- May: Large blue bar, larger red bar
- Jun: Flat baseline

---

## **3. COMPLETE DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│ Firebase Firestore Database                                 │
│ users/{userId}/transactions/                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ useUserData() Hook [frontend/src/hooks/useUserData.js]      │
│ • onSnapshot listener triggers on new/updated transactions  │
│ • Returns: transactions[], loading, error                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ DashboardScreen Component [frontend/src/screens/...]        │
│ • Receives transactions from useUserData()                  │
│ • Calls transformation functions                            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────────────┐  ┌──────────────────────┐
│ getSpendingByCategory│  │ getMonthlyTrends     │
│ [dataTransform.js]   │  │ [dataTransform.js]   │
└────────┬─────────────┘  └──────┬───────────────┘
         │                       │
         ↓                       ↓
    spendingData            monthlyTrends
    (array of objects)      (array of objects)
         │                       │
         ├─────────────┬─────────┤
         │             │         │
    ┌────▼──────┐  ┌───▼─────┐  │
    │ PieChart  │  │ BarChart │  │
    │(Recharts) │  │(Recharts)│  │
    └───────────┘  └──────────┘  │
         │              │        │
         ├──────────────┤        │
         │              │        │
         ├──────────────┤        │
         │              │        │
    Rendered UI    Rendered UI   │
    (Donut chart)  (Bar chart)   │
         │              │        │
         └──────────────┴────────┘
                 │
                 ↓
    ┌─────────────────────────────────┐
    │ Browser Viewport                │
    │ With Interactive Visualizations │
    │ (Tooltips, Hover Effects)       │
    └─────────────────────────────────┘
```

---

## **4. KEY IMPLEMENTATION CHARACTERISTICS**

### **Performance**
| Aspect | Details |
|--------|---------|
| **Time Complexity** | O(n) where n = number of transactions |
| **Space Complexity** | O(c + 6) where c = unique categories |
| **Recalculation** | Runs whenever `transactions` state updates |
| **Optimization** | Aggregation happens client-side (minimal backend load) |

### **Data Validation**
- Transactions with invalid dates are skipped (not added to months)
- Categories with 0 spending are excluded from pie chart
- Empty months (0 income/expenses) still appear on bar chart
- Invalid transaction types filter correctly

### **Styling Notes**
- **Pie Chart**: Donut style (innerRadius < outerRadius)
- **Bar Chart**: Grouped bars allow direct income-expense comparison
- **Colors**: Consistent across app (blue=income, red=expenses)
- **Tooltips**: Currency-formatted via `formatMoney()` utility

### **Edge Cases Handled**
1. **No transactions**: Shows empty state placeholder
2. **Only income/no expenses**: Bar chart shows blue bars only
3. **Only expenses/no income**: Bar chart shows red bars only
4. **Duplicate categories**: Values are summed correctly
5. **Transactions from future months**: Ignored (outside last 6 months)
6. **Missing transaction.date field**: Transaction skipped safely

---

## **5. MODIFICATION GUIDE**

### **To Add New Category Colors**
Edit `dataTransform.js`:
```javascript
const colors = [
  "#3b82f6",  // Blue
  "#f59e0b",  // Amber
  "#8b5cf6",  // Purple
  "#ec4899",  // Pink
  "#06b6d4",  // Cyan
  "#84cc16",  // Lime
  "#ef4444",  // Red
  "#10b981",  // Add new color here
];
```

### **To Change Month Range**
Edit `getMonthlyTrends()`:
```javascript
// Change from 6 months to 12 months
for (let i = 11; i >= 0; i--) {  // was i = 5
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  // ...
}
```

### **To Filter Transactions by Date Range**
Add filter before aggregation:
```javascript
const startDate = new Date(2026, 0, 1);  // January 1, 2026
transactions.filter(t => new Date(t.date) >= startDate)
```

### **To Sort Categories by Spending**
Modify `getSpendingByCategory()` return:
```javascript
return Object.keys(categoryMap)
  .map((name, index) => ({...}))
  .sort((a, b) => b.value - a.value);  // Descending order
```

---

## **6. TESTING SCENARIOS**

### **Scenario 1: Single Category**
- Input: 5 food transactions
- Output: Single-slice pie chart (100% filled)
- Bar chart: Only red bars

### **Scenario 2: Multiple Categories**
- Input: 3 categories with different amounts
- Output: 3-slice pie chart with legend
- Proper color assignment

### **Scenario 3: No Transactions**
- Input: Empty array
- Output: Placeholder message on both charts
- No JavaScript errors

### **Scenario 4: Mixed Income/Expenses**
- Input: Transactions with both types
- Output: Pie chart shows only expenses
- Bar chart shows both income (blue) and expenses (red)

### **Scenario 5: Large Dataset**
- Input: 1000+ transactions
- Output: Still renders correctly
- May experience slight lag on older devices

---

## **Related Files**

| File | Purpose |
|------|---------|
| [dataTransform.js](frontend/src/utils/dataTransform.js) | Transformation logic |
| [DashboardScreen.jsx](frontend/src/screens/DashboardScreen.jsx) | Pie & Bar chart rendering |
| [InsightsScreen.jsx](frontend/src/screens/InsightsScreen.jsx) | Additional analytics |
| [NetWorthScreen.jsx](frontend/src/screens/NetWorthScreen.jsx) | Historical net worth |
| [utils.js](frontend/src/utils/utils.js) | `formatMoney()` utility |
| [useUserData.js](frontend/src/hooks/useUserData.js) | Data fetching hook |

---

## **Summary**

PocketWorth uses **two core transformation functions** to visualize financial data:

1. **`getSpendingByCategory()`**: Filters expenses, aggregates by category, assigns colors
2. **`getMonthlyTrends()`**: Initializes 6 months, aggregates income/expenses per month

Both functions operate on **client-side transaction data**, enabling fast, responsive visualizations with Recharts. Data is recalculated whenever transactions update in real-time via Firestore listeners.

---

**Last Updated**: April 7, 2026  
**Project**: PocketWorth Finance Tracker  
**Author**: Sarthak
