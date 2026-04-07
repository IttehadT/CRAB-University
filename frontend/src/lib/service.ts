// src/lib/service.ts

/**
 * ── THE MASTER SERVICE (BUSINESS LOGIC) ─────────────────────────────────────
 * This is the ONLY file that API routes and UI components are allowed to import.
 * It asks `control.ts` for data, applies business rules (like checking if a user
 * is allowed to see the data), and formats it for the frontend.
 */

import { getCourseData, getUserById, getUserByEmail, upsertUser } from './db/control';
import { CourseMold, User } from './db/mold';

// ============================================================
// COURSE LOGIC
// ============================================================

/**
 * Fetches specific course columns. 
 * The UI simply asks for data, and this service returns it cleanly.
 */
export async function fetchCourses<K extends keyof CourseMold>(
  parameters: K[]
): Promise<{ source: string; data: Pick<CourseMold, K>[] }> {
  
  const result = await getCourseData(parameters);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  // Returning it in the exact same format your UI currently expects
  return { source: result.source, data: result.data };
}

// ============================================================
// USER & AUTH LOGIC
// ============================================================

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await getUserByEmail(email);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await getUserById(id);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function syncUser(userData: any): Promise<void> {
  const result = await upsertUser(userData);
  if (!result.success) throw new Error(result.error);
}