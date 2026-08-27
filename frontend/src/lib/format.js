import { BRAND } from "./config";

// Prices are stored as whole-currency integers (e.g. rupees). Ready to swap to
// Shopify money fields / multi-currency later.
export function formatMoney(amount, currency = BRAND.currency, locale = BRAND.locale) {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

export function savingsPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

// Downscale remote images per usage context to save bandwidth on mobile.
export function imgUrl(url, w = 800) {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    return /([?&])w=\d+/.test(url)
      ? url.replace(/([?&])w=\d+/, `$1w=${w}`)
      : `${url}&w=${w}`;
  }
  if (url.includes("images.pexels.com")) {
    return /([?&])w=\d+/.test(url)
      ? url.replace(/([?&])w=\d+/, `$1w=${w}`)
      : `${url}&w=${w}`;
  }
  return url;
}
