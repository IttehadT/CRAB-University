import Link from "next/link";
import { fetchCourses, fetchRoutineById } from "@/lib/service";

/**
 * ── PUBLIC ROUTINE VIEWER (SERVER COMPONENT) ────────────────────────────────
 * This page runs 100% on the server. Because there is no "use client" directive,
 * it is completely safe to import database services here. It fetches all the 
 * required data before the page even loads, resulting in zero loading spinners,
 * perfect SEO, and no 'net' module build errors.
 */
export default async function PublicRoutinePage({
  params,
}: {
  // Next.js 15+ strict requirement: params must be typed as a Promise
  params: Promise<{ id: string }>; 
}) {
  // 1. Await the dynamic URL parameters
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // 2. Fetch the routine directly from the database service (Backend-to-Backend)
    const routine = await fetchRoutineById(id);
    
    if (!routine) {
      throw new Error("Routine not found");
    }

    // 3. Decode the Base64 string back into an array of section IDs
    // Note: Since we are on a Node.js Server Component, we use `Buffer` instead of the browser's `atob()`
    const decodedStr = Buffer.from(routine.routineStr, 'base64').toString('utf-8');
    const sectionIds: string[] = JSON.parse(decodedStr);

    // 4. Fetch the full course catalog directly from our service
    // FIXED: Removed the invalid "id" key. TypeScript is now happy!
    const coursesRes = await fetchCourses([
      "sectionId", "courseCode", "sectionName", "roomName", "faculties", "sectionSchedule"
    ]);
    
    const allCourses = coursesRes.data;

    // 5. Filter the catalog down to ONLY the courses in this routine
    // FIXED: Removed the fallback to c.id
    const courses = allCourses.filter((c: any) => 
      sectionIds.includes(c.sectionId)
    );

    /**
     * Helper to format 24h time into readable 12h AM/PM strings
     */
    const formatTime12h = (time24?: string | null) => {
      if (!time24) return "";
      const [hours, minutes] = time24.split(":");
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${minutes} ${ampm}`;
    };

    // ── RENDER: SUCCESS STATE (PUBLIC VIEW) ──
    return (
      <main className="min-h-screen bg-background p-4 md:p-8 text-foreground">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          
          {/* Header Container */}
          <div className="flex flex-col items-start justify-between border-b border-border bg-muted/30 p-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-black text-primary">{routine.routineName}</h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Shared via CRAB University • {courses.length} Courses
              </p>
            </div>
            
            {/* Call to action for public viewers */}
            <Link 
              href="/dashboard/finder" 
              className="mt-4 shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 md:mt-0"
            >
              Create My Own
            </Link>
          </div>

          {/* Course List / Mini Grid */}
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <div 
                  key={course.sectionId} 
                  className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {course.courseCode}
                      </h3>
                      <p className="text-xs font-semibold uppercase text-primary">
                        Section {course.sectionName} • {course.faculties || "TBA"}
                      </p>
                    </div>
                  </div>

                  {/* Render Class Timings cleanly */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(course.sectionSchedule?.classSchedules || []).map((s: any, i: number) => (
                      <span 
                        key={i} 
                        className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary"
                      >
                        {s.day?.substring(0, 3)} {formatTime12h(s.startTime)} - {formatTime12h(s.endTime)}
                      </span>
                    ))}
                  </div>
                  
                  {/* Room Location */}
                  <p className="mt-2 text-xs text-muted-foreground">
                    📍 Room: {course.roomName || "TBA"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );

  } catch (err) {
    // ── RENDER: ERROR STATE ──
    // If the ID is invalid or the DB fails, they see this fallback safely rendered from the server.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Not Found</h1>
        <p className="mb-8 text-muted-foreground">This routine does not exist or has been deleted.</p>
        <Link 
          href="/dashboard/finder" 
          className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
        >
          Build Your Own
        </Link>
      </div>
    );
  }
}