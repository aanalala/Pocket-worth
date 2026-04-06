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
