export function formatMoney(value, currencyCode = "USD") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

export function currencyWithCents(value, currencyCode = "USD") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getLocalDateStr(dateVal) {
  if (!dateVal) return "";
  // If it's a Firestore Timestamp
  if (typeof dateVal === "object" && dateVal.seconds !== undefined) {
    const d = new Date(dateVal.seconds * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  // If it's a string
  if (typeof dateVal === "string") {
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    // Otherwise parse as Date and get local parts
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
  // If it's a Date object
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
  }
  return "";
}

