import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { removeUserRoutine } from "@/lib/service";

// Use NextRequest instead of Request, and explicitly type the context
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params object from the context
    const resolvedParams = await context.params;
    const id = resolvedParams.id;

    await removeUserRoutine(id, session.user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routine:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}