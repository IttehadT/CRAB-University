// src/app/api/courses/catalog/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchCourses } from "@/lib/service";
import { CourseMold } from "@/lib/db/mold";
import { siteConfig } from "@/config/site";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const semester = searchParams.get("semester") || siteConfig.currentSemester;

    // We only fetch the data the UI actually needs to keep the payload fast
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

    // This securely routes through your new Semester-Aware Fallback Engine!
    const response = await fetchCourses(keysToFetch, semester);

    return NextResponse.json({ success: true, data: response.data });

  } catch (error) {
    console.error(`[API] Failed to fetch catalog:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course catalog" },
      { status: 500 }
    );
  }
}