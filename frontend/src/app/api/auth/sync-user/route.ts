import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userService } from "@/services/user.service";

export async function POST() {
  try {
    const supabase = await createClient(); // Await is required in Next 15+ for cookies
    
    // Securely get the user session from the server side cookies
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the exact provider they used (google, email, azure, etc.)
    const provider = user.app_metadata?.provider || 'email';
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();

    // Map Supabase metadata to our MySQL interface
    const userData = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      phone: user.phone || null,
      provider: provider,
      last_sign_in_at: lastSignIn
    };

    // Send it to the MySQL Service!
    await userService.syncUser(userData);

    return NextResponse.json({ success: true, message: "User synced to MySQL" });

  } catch (error) {
    console.error("MySQL Sync Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}