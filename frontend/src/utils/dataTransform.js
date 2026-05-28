

/**
 * Aggregates transactions by category for Pie charts
 */
export function getSpendingByCategory(transactions) {
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const categoryMap = {};

  expenseTransactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
  });

  const colors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#ef4444"];
  
  return Object.keys(categoryMap).map((name, index) => ({
    name,
    value: categoryMap[name],
    color: colors[index % colors.length]
  }));
}

/**
 * Aggregates income and expenses by month for Bar charts
 */
export function getMonthlyTrends(transactions) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendsMap = {};

  // Initialize last 6 months with 0
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    trendsMap[monthName] = { month: monthName, income: 0, expenses: 0 };
  }

  transactions.forEach(t => {
    const d = new Date(t.date);
    const monthName = months[d.getMonth()];
    if (trendsMap[monthName]) {
      if (t.type === "income") trendsMap[monthName].income += Number(t.amount);
      else trendsMap[monthName].expenses += Number(t.amount);
    }
  });

  return Object.values(trendsMap);
}

/**
 * Calculates budget status per category
 */
export function getBudgetStatus(transactions, defaultBudget = 500) {
  const spending = getSpendingByCategory(transactions);
  return spending.map(item => ({
    ...item,
    spent: item.value,
    budget: defaultBudget, // Defaulting for now
    percent: Math.round((item.value / defaultBudget) * 100)
  }));
}

/**
 * Calculates Net Worth History by walking backwards from current balance
 */
export function getNetWorthHistory(currentBalance, transactions) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  let runningBalance = currentBalance;
  
  // Sort transactions by date descending to walk backwards
  const sortedTrans = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const history = [];
  const monthLabels = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    monthLabels.push(monthName);
  }

  // Walk through the labels (current to oldest)
  monthLabels.forEach(label => {
    history.unshift({ month: label, value: Math.round(runningBalance) });
    
    // Reverse transactions for this month to find previous month's ending balance
    sortedTrans.filter(t => months[new Date(t.date).getMonth()] === label).forEach(t => {
      if (t.type === "income") runningBalance -= Number(t.amount);
      else runningBalance += Number(t.amount);
    });
  });

  return history;
}
