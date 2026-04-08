import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { removeUserRoutine } from "@/lib/service";

// Next.js 15+ STRICT REQUIREMENT: params must be typed as a Promise
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- The fix
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // You MUST await the params before extracting the ID
    const { id } = await params;

    await removeUserRoutine(id, session.user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routine:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}