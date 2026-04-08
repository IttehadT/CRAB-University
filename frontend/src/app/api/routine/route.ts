import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { fetchUserRoutines, saveUserRoutine } from "@/lib/service";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const routines = await fetchUserRoutines(session.user.email);
    return NextResponse.json({ success: true, routines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { routineStr, routineName } = await request.json();
    const id = crypto.randomUUID(); 

    await saveUserRoutine(id, session.user.email, routineName || "My Routine", routineStr);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving routine:", error);
    return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
  }
}