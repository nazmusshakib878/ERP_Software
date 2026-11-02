import type { Status } from "./tokens";

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export const COMPANY = "Aster Trading Ltd.";
export const WORKSPACE = "Enterprise workspace";
export const TIMEZONE = "Asia/Dhaka (GMT+6)";
export const CURRENCY = "BDT";
export const CURRENCY_SYMBOL = "\u09F3"; // ৳
export const USER_NAME = "Arif Rahman";
export const USER_ROLE = "Company Admin";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Indian numbering system grouping: ones, then groups of two (lakhs/crores).
export function formatNumber(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  const parts = n.toFixed(0).split("").reverse().join("");
  const groups: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    groups.push(parts.slice(i, i + 2));
  }
  const grouped = groups.join(",").split("").reverse().join("");
  return grouped;
}

export function formatCurrency(
  amount: number,
  compact = false,
): string {
  if (compact) {
    if (amount >= 1e7) return `${CURRENCY_SYMBOL}${(amount / 1e7).toFixed(1)}Cr`;
    if (amount >= 1e5) return `${CURRENCY_SYMBOL}${(amount / 1e5).toFixed(1)}L`;
  }
  return `${CURRENCY_SYMBOL}${formatNumber(amount)}`;
}

export function trendColor(change: number): "success" | "danger" | "default" {
  if (change > 0) return "success";
  if (change < 0) return "danger";
  return "default";
}

export function statusFromName(status: string): Status {
  const s = status.toLowerCase();
  if (s.includes("paid")) return "success";
  if (s.includes("partial")) return "warning";
  if (s.includes("overdue") || s.includes("unpaid") || s.includes("out")) return "danger";
  if (s.includes("active") || s.includes("in stock")) return "success";
  return "default";
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(d);
  const num = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(d);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(d);
  const year = d.getFullYear();
  return `${day}, ${num} ${month} ${year}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d);
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : ""} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : ""} ago`;
}
