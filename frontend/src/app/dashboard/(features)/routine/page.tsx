import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchCourses, fetchUserRoutines } from "@/lib/service";
import { RoutineViewer } from "@/components/ui/RoutineViewer";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default async function MyRoutinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return null; // Layout handles auth redirection
  }

  try {
    // 1. Fetch all of the user's routines
    const routines = await fetchUserRoutines(user.email);
    
    // 2. Find the ONE routine marked as active/default
    const defaultRoutine = routines.find((r: any) => r.isActive == 1 || r.is_active == 1);

    // ── EMPTY STATE: No Default Routine Set ──
    if (!defaultRoutine) {
      return (
        <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 rounded-full bg-muted p-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 opacity-50" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">No Default Routine Set</h1>
          <p className="mb-8 max-w-md text-muted-foreground">
            You haven't selected a default routine yet. Go to your Saved Routines and click the tick icon on the schedule you want to see here!
          </p>
          <Link 
            href="/dashboard/saved-routines" 
            className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Go to Saved Routines
          </Link>
        </main>
      );
    }

    // 3. Decode the base64 routine string
    const decodedStr = Buffer.from(defaultRoutine.routineStr || defaultRoutine.routine_data, "base64").toString("utf-8");
    const sectionIds: number[] = JSON.parse(decodedStr);

    // 4. Fetch the actual course schedules for the grid
    const queryFields = [
      "sectionId", 
      "courseCode", 
      "sectionName", 
      "roomName", 
      "labRoomName", 
      "faculties", 
      "sectionSchedule", 
      "labSchedules",
      "courseCredit" as any // 🔥 MATCHES EXACTLY WITH `c.credits AS courseCredit` in control.ts
    ];

    const coursesRes = await fetchCourses(queryFields, defaultRoutine.semester);
    
    // Map the database's `courseCredit` back to `credits` so RoutineViewer can calculate the total
    const courses = coursesRes.data
      .filter((c: any) => sectionIds.includes(c.sectionId))
      .map((c: any) => ({
        ...c,
        credits: Number(c.courseCredit) || 3 
      }));

    // ── RENDER: DEFAULT ROUTINE GRID ──
    return (
      <main className="min-h-screen space-y-6 bg-background p-4 text-foreground md:p-8 max-w-[100vw] overflow-x-hidden">
        
        {/* Header Title & Action Button */}
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              {user.user_metadata?.full_name?.split(" ")[0]}'s Routine
            </h1>
            <p className="text-muted-foreground mt-1">Your default schedule for this semester.</p>
          </div>
          
          <Link 
            href="/dashboard/saved-routines" 
            className="shrink-0 w-full sm:w-auto text-center rounded-xl bg-[#0070F3] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0070F3]/90"
          >
            Manage Routines
          </Link>
        </div>

        {/* 🔥 The unified calendar viewer */}
        <div className="w-full pb-4">
          <RoutineViewer courses={courses} showExams={true} />
        </div>

      </main>
    );

  } catch (error) {
    console.error("Error loading default routine:", error);
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center text-destructive">
        <AlertTriangle className="mb-4 h-12 w-12" />
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">Failed to load your default routine.</p>
      </main>
    );
  }
}