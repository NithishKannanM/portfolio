import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Jan 2026" — used for periods and post dates. */
export function formatMonth(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "15 Jan 2026" — used on post pages where the exact day matters. */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** ISO yyyy-mm-dd, for <time datetime> and sitemaps. */
export function isoDate(date: string | Date) {
  return new Date(date).toISOString().split("T")[0];
}
