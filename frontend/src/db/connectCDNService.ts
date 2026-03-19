// src/db/connectCDNService.ts

import { CourseMold } from "@/types/data.mold";

export class ConnectCDNService {
  /**
   * Fetches the full JSON array from the CDN, but ONLY returns the specific keys requested.
   */
  static async getSpecificData<K extends keyof CourseMold>(
    parameters: K[]
  ): Promise<Pick<CourseMold, K>[]> {
    
    const url = process.env.CONNECT_DATA_URL;
    if (!url) throw new Error("CONNECT_DATA_URL missing in .env.local");

    // Fetch the raw data with Next.js caching (5 minutes)
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("Tier 1 CDN is down");

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