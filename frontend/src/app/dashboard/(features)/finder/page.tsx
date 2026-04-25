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
import { siteConfig } from "@/config/site"; // <-- We import the master switch here!

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
        
        {/* Sleek, Formal Shadcn Announcement Badge */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary animate-pulse shadow-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {/* Automatically says "Summer 2026 data is now live!" */}
          <span><strong>{siteConfig.currentSemester}</strong> schedule is now live!</span>
        </div>
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
          // The FinderUI now uses the Master Switch so it updates automatically in the future
          semester={siteConfig.currentSemester} 
        />
      )}
    </main>
  );
}