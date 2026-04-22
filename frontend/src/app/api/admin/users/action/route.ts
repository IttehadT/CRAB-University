import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { removeUser } from "@/lib/service";

export async function POST(request: Request) {
  try {
    // 1. Verify that the person making this request is actually an Admin
    const supabase = await createServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser || currentUser.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { action, userId } = await request.json();

    if (action === "delete" && userId) {
      // 2. Initialize Supabase Admin (bypasses standard security rules)
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 3. Delete from Supabase Auth Vault
      const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (supabaseError) throw supabaseError;

      // 4. Delete from Aiven MySQL
      await removeUser(userId);

      return NextResponse.json({ success: true, message: "User deleted successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Action Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}