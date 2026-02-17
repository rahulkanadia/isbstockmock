import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReturn(current: number, base: number) {
  if (!base || base === 0) return 0;
  return ((current - base) / base) * 100;
}

export function formatArenaPrice(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(2)}`;
}

export function formatArenaPercent(value: number, isGap = false) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(isGap ? 1 : 2)}%`;
}
