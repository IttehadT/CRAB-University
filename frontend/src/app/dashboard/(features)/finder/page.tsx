// src/app/dashboard/(features)/finder/page.tsx

/**
 * ── THE FINDER POD: SERVER PAGE ─────────────────────────────────────────────
 * This is the entry point for /dashboard/finder.
 * It strictly runs on the server, fetches the course data from our unified 
 * lib/service.ts, and securely passes the data to the Client UI.
 */

import { fetchCourses, findUserByEmail } from "@/lib/service";
import FinderUI from "./FinderUI";
import { CourseMold } from "@/lib/db/mold";
import { createClient } from "@/lib/supabase/server";

// Optional: Force dynamic rendering if you want live seat updates every time they refresh
export const dynamic = "force-dynamic";

export default async function FinderPage() {
  let currentUser = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      currentUser = await findUserByEmail(user.email);
    }
  } catch (e) {
    console.warn("Could not fetch user data:", e);
  }

  // 1. Ask the unified service for ONLY the columns we need for the UI to save memory
  const keysToFetch: (keyof CourseMold)[] = [
    "sectionId",
    "courseId",
    "courseCode",
    "courseName",
    "sectionName",
    "courseCredit",
    "courseType",
    "academicDegree",
    "semesterSessionId",
    "capacity",
    "consumedSeat",
    "faculties",
    "roomName",
    "prerequisiteCourses",
    "sectionSchedule", 
    "labSchedules",  
  ];

  let courses: any[] = [];
  let errorMsg = null;

  try {
    const response = await fetchCourses(keysToFetch);
    courses = response.data;
  } catch (error: any) {
    console.error("Failed to fetch courses for Finder:", error);
    errorMsg = "Could not load courses. The database might be sleeping.";
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Finder</h1>
        <p className="text-muted-foreground mt-1">Search, filter, and build your perfect routine.</p>
        
        {/* Added: Displaying user info if available to confirm it worked */}
        {currentUser && (
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
               Spring 2026 data is live
            </span>
        )}
      </div>

      {errorMsg ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          {errorMsg}
        </div>
      ) : (
        // 2. Pass the raw data to the heavy interactive Client component
        <FinderUI
          initialCourses={courses}
          studentName={(currentUser as any)?.full_name || (currentUser as any)?.email || null}
          semester="Spring 2026"
        />
      )}
    </main>
  );
}