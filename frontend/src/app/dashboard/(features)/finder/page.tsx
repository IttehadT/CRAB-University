// src/app/dashboard/(features)/finder/page.tsx

/**
 * ── THE FINDER POD: SERVER PAGE ─────────────────────────────────────────────
 * This is the entry point for /dashboard/finder.
 * It strictly runs on the server, fetches the course data from our unified 
 * lib/service.ts, and securely passes the data to the Client UI.
 */

import { fetchCourses } from "@/lib/service";
import FinderUI from "./FinderUI";
import { CourseMold } from "@/lib/db/mold";

// Optional: Force dynamic rendering if you want live seat updates every time they refresh
export const dynamic = "force-dynamic";

export default async function FinderPage() {
  // 1. Ask the unified service for ONLY the columns we need for the UI to save memory
  const keysToFetch: any[] = [
    // Standard keys
    "sectionId", "id",
    "courseCode", "course_code",
    "sectionName", "section_name",
    "courseCredit", "credits",
    "capacity",
    "consumedSeat", "consumed_seat",
    "faculties",
    "prerequisiteCourses", "prerequisite_courses",
    "sectionSchedule", "class_schedule",
    "final_exam_date", "final_exam_start_time", "final_exam_end_time",
    "mid_exam_date", "mid_exam_start_time", "mid_exam_end_time",
    "labSchedules", "lab_schedule"
  ];

  let courses: Pick<CourseMold, keyof CourseMold>[] = [];
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
      </div>

      {errorMsg ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          {errorMsg}
        </div>
      ) : (
        // 2. Pass the raw data to the heavy interactive Client component
        <FinderUI initialCourses={courses} />
      )}
    </main>
  );
}