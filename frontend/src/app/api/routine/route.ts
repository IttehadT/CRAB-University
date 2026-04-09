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

    const { routineStr, routineName, semester = "Spring 2026" } = await request.json();
    const id = crypto.randomUUID();

    // 1. Decode the routine string to get the Section IDs
    const decodedStr = Buffer.from(routineStr, 'base64').toString('utf-8');
    const sectionIds: string[] = JSON.parse(decodedStr);
    const courseCount = sectionIds.length;

    // 2. Fetch the course details from the database to calculate stats securely
    const coursesRes = await fetchCourses(["sectionId", "courseCredit", "sectionSchedule"]);
    const selectedCourses = coursesRes.data.filter((c: any) => sectionIds.includes(c.sectionId));

    // 3. ── CALCULATE STATS ──
    let totalCredits = 0;
    let totalHours = 0;
    let hasClash = false;
    
    // We will group schedules by Day to easily check for time overlaps
    const dailySchedules: Record<string, {start: number, end: number}[]> = {
      SUNDAY: [], MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: [], SATURDAY: []
    };

    selectedCourses.forEach((course: any) => {
      // Sum Credits
      totalCredits += Number(course.courseCredit) || 0;

      // Parse schedules for Hours and Clashes
      if (course.sectionSchedule?.classSchedules) {
        course.sectionSchedule.classSchedules.forEach((schedule: any) => {
          const startDec = timeToDecimal(schedule.startTime);
          const endDec = timeToDecimal(schedule.endTime);
          
          // Sum Class Hours
          totalHours += (endDec - startDec);

          // Push to daily array for clash checking
          const day = schedule.day?.toUpperCase();
          if (day && dailySchedules[day]) {
            dailySchedules[day].push({ start: startDec, end: endDec });
          }
        });
      }
    });

    // 4. ── CHECK FOR CLASHES ──
    for (const day in dailySchedules) {
      const times = dailySchedules[day].sort((a, b) => a.start - b.start);
      for (let i = 0; i < times.length - 1; i++) {
        // If the current class ends AFTER the next class starts, it's a clash!
        if (times[i].end > times[i + 1].start) {
          hasClash = true;
          break;
        }
      }
      if (hasClash) break;
    }

    // 5. ── SAVE EVERYTHING TO MYSQL ──
    await saveUserRoutine(
      id, user.email, routineName || "My Routine", routineStr,
      semester, courseCount, totalCredits, totalHours, hasClash
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving routine:", error);
    return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
  }
}