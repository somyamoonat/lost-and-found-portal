import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines classes cleanly with tailwind-merge and clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a claim reference code (e.g. LF-2041).
 */
export function formatClaimCode(num: number | string): string {
  const digits = typeof num === "number" ? num.toString().padStart(4, "0") : num;
  return `LF-${digits}`;
}
