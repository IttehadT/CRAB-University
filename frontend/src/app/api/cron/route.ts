import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // This tiny query forces the Supabase database engine to wake up.
    // Even if you don't have a 'users' table yet, the request itself resets the 7-day pause timer!
    await supabase.from('users').select('id').limit(1);

    return NextResponse.json({ 
      status: "Success", 
      message: "CRAB University Database is awake!" 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "Error", 
      message: "Failed to ping database." 
    }, { status: 500 });
  }
}