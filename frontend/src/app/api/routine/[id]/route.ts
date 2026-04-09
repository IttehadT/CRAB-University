import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { removeUserRoutine } from "@/lib/service";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    await removeUserRoutine(id, user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routine:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}