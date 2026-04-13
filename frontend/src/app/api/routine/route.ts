import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRoutines, saveUserRoutine, fetchCourses } from "@/lib/service";

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

// ── UTILITY: TIME CALCULATION ──
// Converts "08:30 AM" into 8.5 for easy math
const timeToDecimal = (timeStr: string) => {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) hours = 0;
  if (modifier === "PM") hours += 12;
  return hours + (minutes / 60);
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { 
      routineStr, 
      routineName, 
      semester = "Unknown Semester", // <-- Much safer fallback!
      courseCount,
      totalCredits,
      totalDays,
      totalHours,
      hasClash = false 
    } = await request.json();

    // 1. CREATE THE ID (This fixes your error!)
    const id = crypto.randomUUID();

    // 2. SAVE TO THE DATABASE (Don't forget this part!)
    await saveUserRoutine(
      id, user.email, routineName || "My Routine", routineStr,
      semester, courseCount, totalCredits, totalDays, totalHours, hasClash
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving routine:", error);
    return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
  }
}