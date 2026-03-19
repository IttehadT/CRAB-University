// src/app/api/admin/manual-sync/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { userService } from "@/services/user.service";
import { mysqlPool } from "@/lib/db/mysql"; // Direct DB access for the cleanup step

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

      await userService.syncUser(userData);
    }

    // 2. ORPHAN CLEANUP: Delete users from MySQL who are no longer in Supabase
    let deletedCount = 0;
    
    // Safety check: Only run deletion if Supabase actually returned users (prevents accidental DB wipe)
    if (users.length > 0) {
      // Create a comma-separated list of active Supabase IDs: 'id1','id2','id3'
      const activeIds = users.map(u => `'${u.id}'`).join(',');
      
      // Delete any row in MySQL where the ID is NOT in the active Supabase list
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