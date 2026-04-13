import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { removeUserRoutine, fetchRoutineById, renameUserRoutine, updateRoutineActiveStatus } from "@/lib/service";

/**
 * ── GET: PUBLIC ROUTINE DATA ───────────────────────────────────────────────
 * This route is intentionally OPEN (no session check). 
 * If a user has the unique ID, they are allowed to see the routine schedule.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await the dynamic URL parameters (Next.js 15 strict rule)
    const resolvedParams = await context.params;
    const id = resolvedParams.id;

    // 2. Fetch the routine from the database
    const routine = await fetchRoutineById(id);

    // 3. If it doesn't exist, return a clean 404
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // 4. Return the data to the client
    return NextResponse.json({ success: true, routine });
  } catch (error) {
    console.error("Error fetching routine:", error);
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
  }
}

// ... KEEP YOUR EXISTING DELETE FUNCTION HERE ...

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

/**
 * ── PATCH: RENAME ROUTINE & SET DEFAULT ────────────────────────────────────
 * Updates the routine name OR sets it as the active/default routine. 
 * Requires strict Supabase authentication.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify User Session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract Data
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { routineName, isActive } = body;

    // 3A. SCENARIO: Toggle Default Routine Status
    if (isActive !== undefined) {
      await updateRoutineActiveStatus(id, user.email, isActive);
      return NextResponse.json({ success: true, isActive });
    }

    // 3B. SCENARIO: Rename Routine
    if (routineName !== undefined) {
      if (routineName.trim().length === 0 || routineName.length > 40) {
        return NextResponse.json(
          { error: "Routine name must be between 1 and 40 characters" },
          { status: 400 }
        );
      }
      await renameUserRoutine(id, user.email, routineName.trim());
      return NextResponse.json({ success: true, routineName: routineName.trim() });
    }

    // If neither was provided
    return NextResponse.json({ error: "No valid update data provided" }, { status: 400 });

  } catch (error) {
    console.error("Error updating routine:", error);
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}