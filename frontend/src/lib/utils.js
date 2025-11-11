import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * This prevents Tailwind class conflicts and allows for clean conditional classes
 *
 * @param {...any} inputs - Class names to combine
 * @returns {string} Combined and merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
