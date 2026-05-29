import { formatMoney } from "./utils";

/**
 * Export financial data to CSV format
 * @param {object} userData - User data
 * @param {array} transactions - All transactions
 * @param {array} budgets - All budgets
 * @param {string} period - 'month', 'year', or 'all'
 * @returns {string} CSV formatted data
 */
export function exportToCSV(userData, transactions, budgets, period = 'all') {
  let csv = 'PocketWorth Financial Export\n';
  csv += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  csv += `User: ${userData?.displayName || 'Unknown'}\n`;
  csv += `Currency: ${userData?.currency || 'NPR'}\n\n`;

  // Summary Section
  csv += '=== FINANCIAL SUMMARY ===\n';
  csv += `Current Balance,${userData?.balance || 0}\n`;
  csv += `Total Income,${userData?.income || 0}\n`;
  csv += `Total Expenses,${userData?.expenses || 0}\n\n`;

  // Filter transactions based on period
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);

  // Transactions Section
  csv += '=== TRANSACTIONS ===\n';
  csv += 'Date,Type,Category,Amount,Description\n';
  filteredTransactions.forEach(trans => {
    const date = trans.date ? new Date(trans.date).toLocaleDateString() : 'N/A';
    csv += `"${date}","${trans.type}","${trans.category}","${trans.amount}","${trans.description || ''}"\n`;
  });

  csv += '\n';

  // Budget Section
  csv += '=== BUDGETS ===\n';
  csv += 'Category,Limit,Spent,Remaining,Status\n';
  budgets.forEach(budget => {
    const spent = budget.spent || 0;
    const remaining = budget.limit - spent;
    const status = spent > budget.limit ? 'Over Budget' : 'On Track';
    csv += `"${budget.category}","${budget.limit}","${spent}","${remaining}","${status}"\n`;
  });

  csv += '\n';

  // Category Breakdown
  const categorySpending = getCategoryBreakdown(filteredTransactions);
  csv += '=== SPENDING BY CATEGORY ===\n';
  csv += 'Category,Amount,Percentage\n';
  const totalExpenses = Object.values(categorySpending).reduce((a, b) => a + b, 0);
  Object.entries(categorySpending).forEach(([category, amount]) => {
    const percentage = ((amount / totalExpenses) * 100).toFixed(1);
    csv += `"${category}","${amount}","${percentage}%"\n`;
  });

  return csv;
}

/**
 * Export financial data to JSON format
 * @param {object} userData - User data
 * @param {array} transactions - All transactions
 * @param {array} budgets - All budgets
 * @param {string} period - 'month', 'year', or 'all'
 * @returns {object} JSON formatted data
 */
export function exportToJSON(userData, transactions, budgets, period = 'all') {
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);
  const categorySpending = getCategoryBreakdown(filteredTransactions);

  return {
    exportDate: new Date().toISOString(),
    user: {
      name: userData?.displayName || 'Unknown',
      email: userData?.email || 'Unknown',
      currency: userData?.currency || 'NPR',
    },
    summary: {
      currentBalance: userData?.balance || 0,
      totalIncome: userData?.income || 0,
      totalExpenses: userData?.expenses || 0,
      period: period,
      transactionCount: filteredTransactions.length,
    },
    transactions: filteredTransactions.map(trans => ({
      date: trans.date,
      type: trans.type,
      category: trans.category,
      amount: trans.amount,
      description: trans.description || '',
    })),
    budgets: budgets.map(budget => ({
      category: budget.category,
      limit: budget.limit,
      spent: budget.spent || 0,
      remaining: budget.limit - (budget.spent || 0),
      status: (budget.spent || 0) > budget.limit ? 'Over Budget' : 'On Track',
    })),
    categoryBreakdown: categorySpending,
  };
}

/**
 * Download data as file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} format - 'csv' or 'json'
 */
export function downloadFile(content, filename, format = 'csv') {
  const element = document.createElement('a');
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  
  if (format === 'json') {
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(JSON.parse(content), null, 2)));
  } else {
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  }
  
  element.setAttribute('download', `${filename}.${format}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Generate PDF report (requires external library like jsPDF in production)
 * For now, this exports to CSV which can be opened in Excel/PDF converter
 */
export function exportToPDF(userData, transactions, budgets, period = 'all') {
  // In production, use a library like jsPDF or react-pdf
  // For now, return CSV data that can be converted
  return exportToCSV(userData, transactions, budgets, period);
}

// Helper Functions

function filterTransactionsByPeriod(transactions, period) {
  const now = new Date();
  
  if (period === 'all') return transactions;
  
  if (period === 'month') {
    return transactions.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
  }
  
  if (period === 'year') {
    return transactions.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === now.getFullYear();
    });
  }
  
  return transactions;
}

function getCategoryBreakdown(transactions) {
  const breakdown = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category || 'Uncategorized';
      breakdown[category] = (breakdown[category] || 0) + t.amount;
    });
  
  return breakdown;
}

/**
 * Generate export filename with timestamp
 */
export function generateFilename(type = 'export') {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return `pocketworth-${type}-${dateStr}`;
}
