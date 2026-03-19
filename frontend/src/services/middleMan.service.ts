// src/services/middleMan.service.ts

import { dbConfig } from "@/config/db.config";
import { ConnectCDNService } from "@/db/connectCDNService"; // UPDATED IMPORT
import { CourseMold } from "@/types/data.mold";

export class MiddleManService {
  
  static async fetchCourseData<K extends keyof CourseMold>(
    parameters: K[]
  ): Promise<{ source: string; data: Pick<CourseMold, K>[] }> {
    
    // 1. Check Config & Route to Tier 1 (CDN)
    if (dbConfig.useTier1_CDN) {
      try {
        // UPDATED CALL
        const data = await ConnectCDNService.getSpecificData(parameters);
        return { source: "Tier 1: CDN JSON", data };
      } catch (error) {
        console.warn("Tier 1 failed, falling back...");
      }
    }

    // ... (Keep the rest of your Tier 2 and Tier 3 logic exactly the same)
    
    if (dbConfig.useTier2_SupabaseJSON) {
      console.warn("Tier 2 not implemented yet.");
    }

    if (dbConfig.useTier3_MySQL) {
       console.warn("Tier 3 not implemented yet.");
    }

    throw new Error("Critical Failure: All databases are down or disabled in config.");
  }
}