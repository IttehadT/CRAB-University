import Link from "next/link";
import { fetchCourses, fetchRoutineById } from "@/lib/service";
import { RoutineGrid } from "@/components/ui/RoutineGrid";
import { AlertTriangle, Calendar, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";

/**
 * ── PUBLIC ROUTINE VIEWER (SERVER COMPONENT) ────────────────────────────────
 * Fetches the database routine, decodes the courses, and renders the Grid
 * component so anyone with the link can view the schedule seamlessly.
 */
export default async function PublicRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Resolve the dynamic route parameters
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    // ── 1. FETCH ROUTINE DATA ──
    // Retrieve the saved routine from the database using the unique ID
    const routine = await fetchRoutineById(id);
    if (!routine) throw new Error("Routine not found");

    // ── 2. DECODE COURSE IDS ──
    // The routine string is stored as a Base64 encoded JSON array of section IDs
    const decodedStr = Buffer.from(routine.routineStr, "base64").toString("utf-8");
    const sectionIds: number[] = JSON.parse(decodedStr);

    // ── 3. FETCH & FILTER MASTER COURSE CATALOG ──
    // Fetch only the necessary fields to optimize load times (Semester-Aware)
    const coursesRes = await fetchCourses([
      "sectionId",
      "courseCode",
      "sectionName",
      "roomName",
      "faculties",
      "sectionSchedule",
      "labSchedules",
    ], routine.semester); // <-- We pass the saved semester here!

    // Map the decoded section IDs to the actual course data from the database
    const courses = coursesRes.data.filter((c: any) =>
      sectionIds.includes(c.sectionId)
    );

    // ── 4. RENDER: SUCCESS STATE ──
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Global navigation bar for public routes */}
        <Navbar />

        <main className="flex-1 p-4 md:p-8 text-foreground">
          <div className="mx-auto max-w-6xl space-y-6">

            {/* ── HEADER BANNER ── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
              <div className="flex items-start gap-5">
                {/* Calendar Icon Badge */}
                <div className="shrink-0 rounded-2xl bg-primary-muted p-4 text-primary">
                  <Calendar className="w-8 h-8" />
                </div>

                {/* Routine Details */}
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-foreground md:text-3xl">
                      {routine.routineName}
                    </h1>
                    {/* Clash Warning Indicator */}
                    {routine.hasClash && (
                      <span className="flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        <AlertTriangle className="h-3 w-3" /> Clash
                      </span>
                    )}
                  </div>

                  {/* Meta Information Tags */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Shared via CRABU
                    </span>
                    <span>•</span>
                    <span className="rounded-md bg-info-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-info">
                        {routine.semester || "Unknown Semester"}
                    </span>
                    <span>•</span>
                    <span>{courses.length} Courses</span>
                    <span>•</span>
                    <span>{routine.totalCredits || 0} Credits</span>
                  </div>
                </div>
              </div>

              {/* Call to Action Button */}
              <Link
                href="/dashboard/finder"
                className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                Build New Routine
              </Link>
            </div>

            {/* ── ROUTINE GRID INJECTION ── */}
            {/* Renders the weekly calendar layout and exam schedule */}
            <RoutineGrid courses={courses} showExams={true} />

          </div>
        </main>
      </div>
    );
  } catch (err) {
    // ── 5. RENDER: ERROR STATE ──
    // Triggered if the ID is invalid or the database query fails
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Global navigation bar to allow users to safely return home */}
        <Navbar />

        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-foreground">
          {/* Error Icon */}
          <div className="mb-4 rounded-full border border-destructive/20 bg-destructive-muted p-5 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>

          {/* Error Messaging */}
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Routine Not Found
          </h1>
          <p className="mb-8 max-w-md text-muted-foreground">
            This routine does not exist, has been deleted, or the link is invalid.
          </p>

          {/* Recovery Action */}
          <Link
            href="/dashboard/finder"
            className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
          >
            Go to Finder
          </Link>
        </div>
      </div>
    );
  }
}