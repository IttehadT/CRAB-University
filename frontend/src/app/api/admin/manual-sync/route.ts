// src/app/api/admin/manual-sync/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { userService } from "@/services/user.service";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Must use the Service Role Key to bypass security and list ALL users
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

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

    return NextResponse.json({ 
      success: true, 
      totalUsers: users.length, 
      message: "All users manually synced to MySQL." 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}