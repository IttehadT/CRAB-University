import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRoutines, saveUserRoutine, fetchCourses } from "@/lib/service";
export const dynamic = "force-dynamic";

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
      totalMinutes,
      hasClash = false 
    } = await request.json();

    // 1. CREATE THE ID
    const id = crypto.randomUUID();

    // // ── NEW: Name + routine #1 ──
    // let finalName = routineName?.trim();
    
    // if (!finalName) {
    //   // 1. Count existing routines
    //   const existingRoutines = await fetchUserRoutines(user.email);
    //   const count = existingRoutines ? existingRoutines.length : 0;
      
    //   // 2. Grab the user's first name from their Supabase session
    //   let firstName = "My";
    //   if (user?.user_metadata?.full_name) {
    //     // Split "ITTEHAD AHMED TAUSIF" into "ITTEHAD"
    //     const rawFirst = user.user_metadata.full_name.split(" ")[0];
    //     // Format it nicely: "Ittehad"
    //     firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
    //   }

    //   // 3. Combine them! e.g., "Ittehad's Routine #1"
    //   finalName = `${firstName}'s Routine #${count + 1}`;
    // }

    // // 2. SAVE TO THE DATABASE WITH THE REAL NAME
    // await saveUserRoutine(
    //   id, user.email, finalName, routineStr,
    //   semester, courseCount, totalCredits, totalDays, totalMinutes, hasClash
    // );

    // ── NEW: without name just routine#1 ──
    let finalName = routineName?.trim();
    
    if (!finalName) {
      // 1. Count existing routines
      const existingRoutines = await fetchUserRoutines(user.email);
      const count = existingRoutines ? existingRoutines.length : 0;

      // 2. Format it: "Routine #1"
      finalName = `Routine #${count + 1}`;
    }

    // 2. SAVE TO THE DATABASE (This is what was missing!)
    await saveUserRoutine(
      id, user.email, finalName, routineStr,
      semester, courseCount, totalCredits, totalDays, totalMinutes, hasClash
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving routine:", error);
    return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
  }
}