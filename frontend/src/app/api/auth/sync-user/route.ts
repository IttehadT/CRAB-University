// src/app/api/auth/sync-user/route.ts

import { NextResponse } from "next/server";
// FIX: Updated path to the new Supabase lib location
import { createClient } from "@/lib/supabase/server"; 
// FIX: We now import the sync logic from our unified service file
import { syncUser } from "@/lib/service"; 

/**
 * ── POST-LOGIN SYNC API ─────────────────────────────────────────────────────
 * This route is silently triggered after a successful login. 
 * It grabs the fresh Supabase session and pushes updates (like last login time)
 * into our MySQL database to keep them perfectly mirrored.
 */
export async function POST() {
  try {
    const supabase = await createClient(); 
    
    // Securely get the user session from the server-side cookies
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the exact provider they used (google, email, azure, etc.)
    const provider = user.app_metadata?.provider || 'email';
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();
    const role = user.user_metadata?.role || 'student';

    // Map Supabase metadata to our MySQL interface mold
    const userData = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      phone: user.phone || null,
      provider: provider,
      last_sign_in_at: lastSignIn,
      role: role 
    };

    // Send it to the unified Service to handle the DB upsert!
    await syncUser(userData);

    return NextResponse.json({ success: true, message: "User synced to MySQL" });

  } catch (error) {
    console.error("MySQL Sync Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}