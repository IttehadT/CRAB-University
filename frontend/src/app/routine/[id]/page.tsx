import Link from "next/link";
import { fetchCourses, fetchRoutineById } from "@/lib/service";
import { RoutineGrid } from "@/components/ui/RoutineGrid"; // ── IMPORT THE NEW GRID ──
import { AlertTriangle, Calendar, Copy, User } from "lucide-react";

/**
 * ── PUBLIC ROUTINE VIEWER (SERVER COMPONENT) ────────────────────────────────
 * Fetches the database routine, decodes the courses, and renders the gorgeous
 * Grid component so anyone with the link can view the schedule perfectly.
 */
export default async function PublicRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // 1. Fetch routine from DB
    const routine = await fetchRoutineById(id);
    if (!routine) throw new Error("Routine not found");

    // 2. Decode the courses
    const decodedStr = Buffer.from(routine.routineStr, 'base64').toString('utf-8');
    const sectionIds: string[] = JSON.parse(decodedStr);

    // 3. Fetch Master Course Catalog & Filter
    // 3. Fetch Master Course Catalog & Filter
    // FIXED: Removed the invalid "id" key. TypeScript is now perfectly happy!
    const coursesRes = await fetchCourses([
      "sectionId", "courseCode", "sectionName", "roomName", "faculties", "sectionSchedule", "labSchedules"
    ]);
    
    // FIXED: Removed the fallback to c.id since sectionId is strictly typed
    const courses = coursesRes.data.filter((c: any) => sectionIds.includes(c.sectionId));

    // ── RENDER: SUCCESS ──
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 text-foreground">
        <div className="mx-auto max-w-6xl space-y-6">
          
          {/* Header Banner */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-primary-muted rounded-2xl text-primary shrink-0">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">{routine.routineName}</h1>
                  {routine.hasClash && (
                    <span className="flex items-center gap-1 bg-destructive-muted text-destructive border border-destructive/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" /> Clash
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Shared via CRABU</span>
                  <span>•</span>
                  <span className="bg-info-muted text-info px-2 py-0.5 rounded-md text-xs uppercase tracking-wider font-bold">
                    {routine.semester || "Spring 2026"}
                  </span>
                  <span>•</span>
                  <span>{courses.length} Courses</span>
                  <span>•</span>
                  <span>{routine.totalCredits || 0} Credits</span>
                </div>
              </div>
            </div>
            
            {/* Call to action for public viewers */}
            <Link 
              href="/dashboard/finder" 
              className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 shadow-md"
            >
              Build Your Own Routine
            </Link>
          </div>

          {/* ── THE NEW GRID INJECTION ── */}
          <RoutineGrid courses={courses} showExams={true} />
          
        </div>
      </main>
    );

  } catch (err) {
    // ── RENDER: ERROR STATE ──
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="mb-4 rounded-full bg-destructive-muted p-5 text-destructive border border-destructive/20">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Routine Not Found</h1>
        <p className="mb-8 text-muted-foreground max-w-md">This routine does not exist, has been deleted, or the link is invalid.</p>
        <Link 
          href="/dashboard/finder" 
          className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
        >
          Go to Finder
        </Link>
      </div>
    );
  }
}