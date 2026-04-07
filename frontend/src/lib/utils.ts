// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * ── TAILWIND CLASS MERGER ──
 * Safely merges Tailwind CSS classes without conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ── DISPLAY NAME HELPER ──
 * Extracts a clean display name from a Supabase user object.
 * It checks for a full name first, then falls back to the first part of their email, 
 * and finally defaults to "Student".
 */
export function getUserDisplayName(user: any): string {
  if (!user) return "Student";
  return user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
}

/**
 * ── AVATAR HELPER ──
 * Determines which profile picture to show. 
 * It prioritizes Google/OAuth pictures or custom uploads. 
 * If none exist, it generates a fallback image with their initials and a blue background.
 */
export function getUserAvatar(user: any, name: string): string {
  if (!user) return "";
  
  // Look for standard Supabase/OAuth avatar fields
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  if (avatar) return avatar;
  
  // The universal fallback: Creates an image like "JD" for John Doe
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;
}