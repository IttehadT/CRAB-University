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
import { getServerSession } from "next-auth"; // Required to get the user session

// Optional: Force dynamic rendering if you want live seat updates every time they refresh
export const dynamic = "force-dynamic";

export default async function FinderPage() {
  // 0. Fetch the User Table data safely
  let session = null;
  let currentUser = null;
  
  try {
    // Wrapped in try/catch to prevent the Vercel 500 crash!
    // Note: To get the name working, you eventually need to pass your auth config here:
    // session = await getServerSession(authOptions);
    session = await getServerSession();
  } catch (err) {
    console.warn("NextAuth session skipped due to missing config.");
  }
  
  if (session?.user?.email) {
    try {
      // NOW we ask MySQL Aiven for the actual data!
      currentUser = await findUserByEmail(session.user.email);
    } catch (e) {
      console.warn("Could not fetch user data from MySQL:", e);
    }
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
          <p className="text-sm font-medium text-emerald-600 mt-2">
            Welcome back, {currentUser.full_name || currentUser.email}!
          </p>
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
          studentName={currentUser?.full_name || currentUser?.email || null}
          semester="Spring 2026"
        />
      )}
    </main>
  );
}