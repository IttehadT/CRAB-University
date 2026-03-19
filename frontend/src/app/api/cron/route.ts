// src/app/api/cron/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mysqlPool } from "@/lib/db/mysql"; 

export const dynamic = 'force-dynamic'; // Crucial: Stops Next.js from caching the heartbeat

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fire both database pings concurrently to save execution time
    const [supabaseResult, aivenResult] = await Promise.allSettled([
      supabase.from('users').select('id').limit(1), // Supabase Ping
      mysqlPool.execute('SELECT 1')                 // Aiven MySQL Ping
    ]);

    // Check if they succeeded
    const supabaseAwake = supabaseResult.status === 'fulfilled';
    const aivenAwake = aivenResult.status === 'fulfilled';

    // Log internally if one fails, so you can check your Vercel logs later
    if (!supabaseAwake) console.error("Supabase Ping Failed:", supabaseResult);
    if (!aivenAwake) console.error("Aiven Ping Failed:", aivenResult);

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
    console.error("Critical Cron Failure:", error);
    return NextResponse.json({ 
      status: "Error", 
      message: "Complete failure executing database pings." 
    }, { status: 500 });
  }
}