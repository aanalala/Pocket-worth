// Currency Conversion Service for PocketWorth

const CACHE_KEY = "pocketworth_rates_cache";
const CACHE_TIME_KEY = "pocketworth_rates_timestamp";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour cache duration

// Highly accurate baseline rates relative to USD if fetch is offline
const OFFLINE_FALLBACK_RATES = {
  USD: 1.0,
  NPR: 133.50,
  INR: 83.35,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.40,
};

export async function fetchExchangeRates() {
  try {
    const cachedRates = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedRates && cachedTime && (Date.now() - Number(cachedTime) < CACHE_EXPIRY)) {
      return JSON.parse(cachedRates);
    }

    // Try fetching from public open exchange rate API
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) throw new Error("API network failure");

    const data = await response.json();
    if (data && data.rates) {
      const liveRates = {
        USD: 1.0,
        NPR: data.rates.NPR || OFFLINE_FALLBACK_RATES.NPR,
        INR: data.rates.INR || OFFLINE_FALLBACK_RATES.INR,
        EUR: data.rates.EUR || OFFLINE_FALLBACK_RATES.EUR,
        GBP: data.rates.GBP || OFFLINE_FALLBACK_RATES.GBP,
        JPY: data.rates.JPY || OFFLINE_FALLBACK_RATES.JPY,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(liveRates));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
      return liveRates;
    }
  } catch (error) {
    console.warn("⚠️ Using offline fallback exchange rates:", error.message);
  }

  // Fallback if network or parsing failed
  return OFFLINE_FALLBACK_RATES;
}

export async function convertCurrency(amount, fromCode, toCode) {
  if (fromCode === toCode) return amount;
  const rates = await fetchExchangeRates();
  
  // Convert from input currency to USD base
  const amountInUSD = amount / (rates[fromCode] || OFFLINE_FALLBACK_RATES[fromCode] || 1);
  // Convert from USD base to target currency
  return amountInUSD * (rates[toCode] || OFFLINE_FALLBACK_RATES[toCode] || 1);
}
