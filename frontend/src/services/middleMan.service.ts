// src/services/middleMan.service.ts

import { dbConfig } from "@/config/db.config";
import { ConnectCDNService } from "@/db/connectCDNService";
import { SupabaseJsonDb } from "@/db/supabaseJsonDb"; 
import { MysqlDb } from "@/db/mysqlDb";
import { CourseMold } from "@/types/data.mold";

export class MiddleManService {
  
  static async fetchCourseData<K extends keyof CourseMold>(
    parameters: K[]
  ): Promise<{ source: string; data: Pick<CourseMold, K>[] }> {
    
    // 1. Check Config & Route to Tier 1 (CDN)
    if (dbConfig.useTier1_CDN) {
      try {
        const data = await ConnectCDNService.getSpecificData(parameters);
        return { source: "Tier 1: CDN JSON", data };
      } catch (error) {
        console.warn("Tier 1 failed, routing to Tier 2...");
      }
    }

    // 2. Check Config & Route to Tier 2 (Supabase Storage Bucket)
    if (dbConfig.useTier2_SupabaseJSON) {
      try {
        const data = await SupabaseJsonDb.getSpecificData(parameters);
        return { source: "Tier 2: Supabase JSON Backup", data };
      } catch (error) {
        console.warn("Tier 2 failed, routing to Tier 3...");
      }
    }

    // 3. Check Config & Route to Tier 3 (Aiven MySQL)
    if (dbConfig.useTier3_MySQL) {
      try {
        const data = await MysqlDb.getSpecificData(parameters);
        return { source: "Tier 3: Aiven MySQL", data };
      } catch (error) {
        console.error("Tier 3 failed. All academic databases are down.", error);
      }
    }

    // If everything fails (or everything is disabled in config)
    throw new Error("Critical Failure: All databases are down or disabled in config.");
  }
}