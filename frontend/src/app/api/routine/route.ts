import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRoutines, saveUserRoutine } from "@/lib/service";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const routines = await fetchUserRoutines(user.email);
    return NextResponse.json({ success: true, routines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { routineStr, routineName } = await request.json();
    const id = crypto.randomUUID();

    await saveUserRoutine(id, user.email, routineName || "My Routine", routineStr);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving routine:", error);
    return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
  }
}