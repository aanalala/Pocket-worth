// Real-time currency conversion rates
// In production, integrate with a live API like https://api.exchangerate-api.com or https://api.currencyapi.com

const EXCHANGE_RATES = {
  NPR: {
    USD: 0.0076,
    EUR: 0.0070,
    INR: 0.633,
    GBP: 0.0060,
    AUD: 0.0115,
    CAD: 0.0103,
    JPY: 1.14,
    CHF: 0.0067,
    CNY: 0.0547,
  },
  USD: {
    NPR: 132.0,
    EUR: 0.92,
    INR: 83.0,
    GBP: 0.79,
    AUD: 1.52,
    CAD: 1.36,
    JPY: 150.0,
    CHF: 0.88,
    CNY: 7.24,
  },
  INR: {
    NPR: 1.58,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AUD: 0.0183,
    CAD: 0.0164,
    JPY: 1.81,
    CHF: 0.0106,
    CNY: 0.0872,
  },
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'NPR')
 * @param {string} toCurrency - Target currency code (e.g., 'USD')
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  
  if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[fromCurrency][toCurrency]) {
    console.warn(`Conversion from ${fromCurrency} to ${toCurrency} not available`);
    return amount;
  }
  
  return amount * EXCHANGE_RATES[fromCurrency][toCurrency];
}

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Exchange rate
 */
export function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;
  return EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 1;
}

/**
 * Format currency display with conversion option
 * @param {number} amount - Amount to format
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency (optional)
 * @returns {string} Formatted string with optional conversion
 */
export function formatCurrencyWithConversion(amount, fromCurrency, toCurrency = null) {
  if (!toCurrency || fromCurrency === toCurrency) {
    return `${amount.toFixed(2)} ${fromCurrency}`;
  }
  
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  return `${amount.toFixed(2)} ${fromCurrency} ≈ ${converted.toFixed(2)} ${toCurrency}`;
}

// Supported currencies list
export const SUPPORTED_CURRENCIES = [
  { code: 'NPR', name: 'Nepali Rupee', symbol: '₨' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export default {
  convertCurrency,
  getExchangeRate,
  formatCurrencyWithConversion,
  SUPPORTED_CURRENCIES,
};
