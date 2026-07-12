/** Display helpers shared across Wayne's transporter screens. */

/** "$2,200" from "2200", "$2200" or "2,200"; falls back to the raw string. */
export function formatAudPrice(value: string): string {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && value.trim() !== ""
    ? new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(amount)
    : value;
}

/** "11 Jul, 9:30 AM" style stamp for submitted quotes and records. */
export function formatDateTimeAu(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  },
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // en-AU emits lowercase "am/pm"; the app's seeded copy uses "AM" — match it.
  return date.toLocaleString("en-AU", options).replace(/\b(am|pm)\b/g, (m) => m.toUpperCase());
}
