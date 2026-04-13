import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchCourses, fetchUserRoutines } from "@/lib/service";
import { RoutineGrid } from "@/components/ui/RoutineGrid";
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";

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
    // Checking both camelCase and snake_case for maximum safety
    const defaultRoutine = routines.find((r: any) => r.isActive == 1);

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
    const coursesRes = await fetchCourses([
      "sectionId", "courseCode", "sectionName", "roomName", "faculties", "sectionSchedule", "labSchedules"
    ]);
    const courses = coursesRes.data.filter((c: any) => sectionIds.includes(c.sectionId));

    // ── RENDER: DEFAULT ROUTINE GRID ──
    return (
      <main className="min-h-screen space-y-6 bg-background p-4 text-foreground md:p-8">
        
        {/* Header Banner */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-xl bg-primary-muted p-3 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold md:text-2xl">{defaultRoutine.routineName || defaultRoutine.routine_name}</h1>
                <span className="flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  <CheckCircle className="h-3 w-3" /> Default
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {defaultRoutine.semester} • {courses.length} Courses • {defaultRoutine.totalCredits || defaultRoutine.total_credits} Credits
              </p>
            </div>
          </div>
          
          <Link 
            href="/dashboard/saved-routines" 
            className="shrink-0 rounded-xl border border-border bg-muted px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-border"
          >
            Manage Routines
          </Link>
        </div>

        {/* The beautiful calendar grid! */}
        <RoutineGrid courses={courses} showExams={true} />

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