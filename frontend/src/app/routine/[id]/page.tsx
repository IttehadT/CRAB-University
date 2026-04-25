import Link from "next/link";
import { fetchCourses, fetchRoutineById, findUserByEmail } from "@/lib/service";
import { RoutineViewer } from "@/components/ui/RoutineViewer"; // 🔥 Updated Import
import { AlertTriangle, Calendar, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import PublicRoutineClient from "./PublicRoutineClient";

/**
 * ── PUBLIC ROUTINE VIEWER (SERVER COMPONENT) ────────────────────────────────
 * Fetches the database routine, decodes the courses, and renders the Grid
 * component so anyone with the link can view the schedule seamlessly.
 */
export default async function PublicRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const routine = await fetchRoutineById(id);
    if (!routine) throw new Error("Routine not found");

    const owner = await findUserByEmail(routine.userEmail);
    const ownerName = owner?.full_name || "A Student";
    
    const decodedStr = Buffer.from(routine.routineStr, "base64").toString("utf-8");
    const sectionIds: number[] = JSON.parse(decodedStr);

    const coursesRes = await fetchCourses([
      "sectionId", "courseCode", "sectionName", "roomName", "labRoomName", "faculties", "sectionSchedule", "labSchedules",
    ], routine.semester); 

    const courses = coursesRes.data.filter((c: any) => sectionIds.includes(c.sectionId));

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 text-foreground">
          <div className="mx-auto max-w-6xl">
            
            {/* The interactive buttons and viewer are now cleanly isolated! */}
            <PublicRoutineClient 
              courses={courses} 
              routine={routine} 
              ownerName={ownerName} 
            />

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