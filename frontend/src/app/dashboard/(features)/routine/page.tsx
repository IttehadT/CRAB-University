import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchCourses, fetchUserRoutines } from "@/lib/service";
import { RoutineViewer } from "@/components/ui/RoutineViewer"; // 🔥 Updated Import
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

    // 4. Fetch the actual course schedules for the grid (Semester-Aware)
    const coursesRes = await fetchCourses([
      "sectionId", 
      "courseCode", 
      "sectionName", 
      "roomName", 
      "labRoomName", // 🔥 ADD THIS LINE!
      "faculties", 
      "sectionSchedule", 
      "labSchedules"
    ], defaultRoutine.semester);
    
    const courses = coursesRes.data.filter((c: any) => sectionIds.includes(c.sectionId));

    // ── STATS CALCULATION (Bulletproof Fallbacks) ──
    const totalMinutes = defaultRoutine.totalMinutes ?? defaultRoutine.total_minutes ?? 0;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeString = mins === 0 ? `${hrs} hrs` : `${hrs}h ${mins}m`;
    
    const isClashing = defaultRoutine.hasClash == 1 || defaultRoutine.has_clash == 1 || defaultRoutine.hasClash === true;
    const credits = Number(defaultRoutine.totalCredits || defaultRoutine.total_credits || 0);
    const courseLabel = courses.length === 1 ? "Course" : "Courses";

    // ── RENDER: DEFAULT ROUTINE GRID ──
    return (
      // max-w-[100vw] prevents the page layout from horizontally breaking on mobile
      <main className="min-h-screen space-y-6 bg-background p-4 text-foreground md:p-8 max-w-[100vw] overflow-x-hidden">
        
        {/* Header Title */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {user.user_metadata?.full_name?.split(" ")[0]}'s Routine
          </h1>
          <p className="text-muted-foreground mt-1">Your default schedule for this semester.</p>
        </div>

        {/* Routine Banner Card */}
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-center">
          
          <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row w-full">
            <div className="shrink-0 rounded-xl bg-primary-muted p-3 text-primary hidden sm:block">
              <Calendar className="h-6 w-6" />
            </div>
            
            <div className="w-full">
              {/* Title & Top Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold md:text-2xl mr-1">{defaultRoutine.routineName || defaultRoutine.routine_name}</h2>
                
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                  {defaultRoutine.semester}
                </span>

                {isClashing && (
                  <span className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
                    <AlertTriangle className="h-3 w-3" /> Clash
                  </span>
                )}

                <span className="flex items-center gap-1 rounded-full bg-success-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success ml-auto sm:ml-0">
                  <CheckCircle className="h-3 w-3" /> Default
                </span>
              </div>
              
              {/* Bottom Stats Row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>{courses.length} {courseLabel}</span>
                <span className="opacity-40 text-xs">•</span>
                <span>{credits} Credits</span>
                
                {/* Capsules for Days and Time */}
                <span className="ml-1 rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground border border-border">
                  {defaultRoutine.totalDays || defaultRoutine.total_days || 0} Days
                </span>
                <span className="rounded-md bg-primary-purple/10 px-2 py-0.5 text-xs font-bold text-primary-purple border border-primary-purple/20">
                  {timeString}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Button - Vivid Blue & Full Width on Mobile */}
          <Link 
            href="/dashboard/saved-routines" 
            className="shrink-0 w-full lg:w-auto text-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Manage Routines
          </Link>
        </div>

        {/* 🔥 The unified calendar viewer - No wrapper needed! */}
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