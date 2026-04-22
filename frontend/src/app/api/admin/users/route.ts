import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAllUsers } from "@/lib/service";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // STRICT SECURITY: Double-check the token to ensure ONLY admins can fetch this list
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const users = await fetchAllUsers();
    return NextResponse.json({ users });

  } catch (error: any) {
    console.error("Failed to fetch users for admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}