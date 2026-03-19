// src/db/supabaseJsonDb.ts

import { CourseMold } from "@/types/data.mold";

export class SupabaseJsonDb {
  /**
   * Fetches the backup JSON array from the Supabase Storage Bucket.
   */
  static async getSpecificData<K extends keyof CourseMold>(
    parameters: K[]
  ): Promise<Pick<CourseMold, K>[]> {
    
    const url = process.env.SUPABASE_FALLBACK_URL;
    if (!url) throw new Error("SUPABASE_FALLBACK_URL missing in .env.local");

    // Fetch the raw data from the Supabase Bucket
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("Tier 2 Supabase Bucket is down");

    const rawData: CourseMold[] = await response.json();

    // Filter the array to ONLY include the requested infos
    const filteredData = rawData.map((course) => {
      const extractedInfo = {} as Pick<CourseMold, K>;
      parameters.forEach((param) => {
        extractedInfo[param] = course[param];
      });
      return extractedInfo;
    });

    return filteredData;
  }
}