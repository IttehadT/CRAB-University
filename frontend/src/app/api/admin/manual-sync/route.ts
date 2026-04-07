// src/app/api/admin/manual-sync/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// FIX 1: Import the newly flattened 'syncUser' directly from our single service file
import { syncUser } from "@/lib/service"; 

// NOTE: We are keeping mysqlPool here for the orphan cleanup to preserve your existing code,
// but in the future, we should move this raw SQL into control.ts to perfectly match the Golden Rule!
import { mysqlPool } from "@/lib/db/mysql"; 

export const dynamic = 'force-dynamic';

export async function GET() {
  // Use the Service Role Key to bypass security and list ALL users
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    // 1. EXACT MIRROR: Upsert everyone from Supabase into MySQL
    for (const user of users) {
      const provider = user.app_metadata?.provider || 'email';
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();
      const role = user.user_metadata?.role || 'student';

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

      // FIX 2: Call the unified syncUser function directly
      await syncUser(userData);
    }

    // 2. ORPHAN CLEANUP: Delete users from MySQL who are no longer in Supabase
    let deletedCount = 0;
    
    if (users.length > 0) {
      const activeIds = users.map(u => `'${u.id}'`).join(',');
      const [result]: any = await mysqlPool.execute(
        `DELETE FROM users WHERE id NOT IN (${activeIds})`
      );
      deletedCount = result.affectedRows || 0;
    }

    return NextResponse.json({ 
      success: true, 
      totalActiveUsers: users.length, 
      orphansDeleted: deletedCount,
      message: "Database exactly mirrored! Supabase dictates MySQL." 
    });

  } catch (error: any) {
    console.error("Mirror Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}