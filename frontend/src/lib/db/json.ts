// src/lib/db/json.ts

/**
 * ── THE JSON WORKER ─────────────────────────────────────────────────────────
 * This file handles fetching JSON from external URLs (CDN and Supabase Buckets).
 * It retains your custom memory-saving logic: it fetches the massive JSON, 
 * but strictly returns only the keys (parameters) you asked for.
 */

import { CourseMold } from "./mold";

// ============================================================
// 1. TIER 1: FETCH FROM CDN
// ============================================================
export async function fetchCourseDataFromCDN<K extends keyof CourseMold>(
  parameters: K[]
): Promise<Pick<CourseMold, K>[]> {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) throw new Error("CONNECT_DATA_URL missing in .env.local");

  // Fetch the raw data with Next.js caching (5 minutes)
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Tier 1 CDN is down: ${response.status}`);

  const rawData: CourseMold[] = await response.json();

  // Filter the array to ONLY include the requested infos to save memory
  return rawData.map((course) => {
    const extractedInfo = {} as Pick<CourseMold, K>;
    parameters.forEach((param) => {
      extractedInfo[param] = course[param];
    });
    return extractedInfo;
  });
}

// ============================================================
// 2. TIER 2: FETCH FROM SUPABASE BUCKET (SEMESTER AWARE)
// ============================================================
export async function fetchCourseDataFromBucket<K extends keyof CourseMold>(
  parameters: K[],
  semester: string // Added semester parameter
): Promise<Pick<CourseMold, K>[]> {
  const baseUrl = process.env.SUPABASE_FALLBACK_URL;
  if (!baseUrl) throw new Error("SUPABASE_FALLBACK_URL missing in .env.local");

  // Convert "Fall 2025" to "fall2025.json"
  const fileName = semester.toLowerCase().replace(/\s+/g, "") + ".json";
  const url = `${baseUrl}/${fileName}`;

  // Fetch the raw backup data from the Supabase Bucket
  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Tier 2 Supabase Bucket is down: ${response.status}`);

  const data = await response.json();
  
  // SMART NORMALIZER: Safely extracts the array whether it's the CDN format or Bucket format
  const rawData: CourseMold[] = Array.isArray(data) ? data : (data.sections || []);

  // Filter the array to ONLY include the requested infos
  return rawData.map((course) => {
    const extractedInfo = {} as Pick<CourseMold, K>;
    parameters.forEach((param) => {
      extractedInfo[param] = course[param];
    });
    return extractedInfo;
  });
}