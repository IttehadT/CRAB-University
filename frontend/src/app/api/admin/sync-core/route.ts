// src/app/api/admin/sync-core/route.ts

import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db/mysql";
import { CourseMold } from "@/lib/db/mold";

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) return NextResponse.json({ error: "CDN URL missing" }, { status: 500 });

  try {
    // 1. EXTRACT: Fetch the 5MB JSON from the CDN
    const response = await fetch(url);
    const rawData: CourseMold[] = await response.json();

    // 2. TRANSFORM: Filter out the duplicates to find unique items
    const uniqueSemesters = new Map<number, string>();
    const uniqueFaculties = new Set<string>();
    const uniqueCourses = new Map<number, any>();

    rawData.forEach((item) => {
      // Collect Semesters (Assuming 20261 = Spring 2026, we can just store the ID for now)
      if (item.semesterSessionId) {
        uniqueSemesters.set(item.semesterSessionId, `Session ${item.semesterSessionId}`);
      }
      
      // Collect Faculties (Ignore nulls)
      if (item.faculties) {
        uniqueFaculties.add(item.faculties);
      }
      
      // Collect Courses
      if (item.courseId && !uniqueCourses.has(item.courseId)) {
        uniqueCourses.set(item.courseId, {
          id: item.courseId,
          code: item.courseCode,
          name: item.courseName,
          credits: item.courseCredit,
          type: item.courseType,
          degree: item.academicDegree
        });
      }
    });

    // 3. LOAD: Bulk Insert into Aiven MySQL (Using INSERT IGNORE to prevent duplicate errors)
    const connection = await mysqlPool.getConnection();
    
    try {
      await connection.beginTransaction(); // Start a transaction for safety

      // A. Insert Semesters
      for (const [id, name] of Array.from(uniqueSemesters.entries())) {
        await connection.execute(
          'INSERT IGNORE INTO semesters (id, name) VALUES (?, ?)',
          [id, name]
        );
      }

      // B. Insert Faculties
      for (const initials of Array.from(uniqueFaculties)) {
        await connection.execute(
          'INSERT IGNORE INTO faculties (initials) VALUES (?)',
          [initials]
        );
      }

      // C. Insert Courses
      for (const course of Array.from(uniqueCourses.values())) {
        await connection.execute(
          `INSERT IGNORE INTO courses (id, course_code, course_name, credits, course_type, academic_degree) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [course.id, course.code, course.name, course.credits, course.type, course.degree]
        );
      }

      await connection.commit(); // Save all changes
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Core tables synced successfully!",
        stats: {
          semestersAdded: uniqueSemesters.size,
          facultiesAdded: uniqueFaculties.size,
          coursesAdded: uniqueCourses.size,
        }
      });

    } catch (dbError) {
      await connection.rollback(); // Undo everything if it crashes
      connection.release();
      throw dbError;
    }

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}