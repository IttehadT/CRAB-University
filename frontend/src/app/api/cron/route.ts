// src/app/api/cron/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We import the raw pool here specifically because this is an infrastructure ping,
// not a business logic query. It just needs to knock on the database door.
import { mysqlPool } from "@/lib/db/mysql"; 

// ── CRITICAL NEXT.JS CONFIGURATION ──
// This tells Next.js: "Do NOT cache this API route." 
// If Next.js caches this, the cron job will just read the cache instead of 
// physically pinging the databases, which defeats the entire purpose of keeping them awake.
export const dynamic = 'force-dynamic'; 

/**
 * ── DATABASE HEARTBEAT (THE WAKE-UP CALL) ──────────────────────────────────
 * This route is triggered automatically (e.g., via Vercel Cron or GitHub Actions).
 * Its ONLY job is to send a tiny, harmless request to Supabase and Aiven MySQL 
 * to prevent them from entering "Sleep Mode" or pausing due to inactivity.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. FIRE CONCURRENT PINGS
    // We use Promise.allSettled so they run at the exact same time (saving execution time).
    // Settled means if one fails, it won't stop the other from trying to wake up.
    const [supabaseResult, aivenResult] = await Promise.allSettled([
      supabase.from('users').select('id').limit(1), // Supabase Ping: "Fetch 1 user ID"
      mysqlPool.execute('SELECT 1')                 // Aiven MySQL Ping: "Send back the number 1"
    ]);

    // 2. CHECK THE PULSE
    const supabaseAwake = supabaseResult.status === 'fulfilled';
    const aivenAwake = aivenResult.status === 'fulfilled';

    // 3. LOG FAILURES FOR DEBUGGING
    // These will show up in the Vercel logs so you know if a database actually crashed
    if (!supabaseAwake) console.error("Supabase Ping Failed:", supabaseResult);
    if (!aivenAwake) console.error("Aiven Ping Failed:", aivenResult);

    // 4. REPORT BACK TO THE CRON SERVICE
    return NextResponse.json({ 
      status: "Success", 
      message: "CRAB University Database Pings Executed",
      databases: {
        supabase: supabaseAwake ? "Awake" : "Failed to wake",
        aivenMySQL: aivenAwake ? "Awake" : "Failed to wake"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // This only triggers if the Vercel server itself fails to run the code
    console.error("Critical Cron Failure:", error);
    return NextResponse.json({ 
      status: "Error", 
      message: "Complete failure executing database pings." 
    }, { status: 500 });
  }
}