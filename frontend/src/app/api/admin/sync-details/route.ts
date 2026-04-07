// src/app/api/admin/sync-details/route.ts

import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db/mysql";
import { CourseMold } from "@/lib/db/mold";

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) return NextResponse.json({ error: "CDN URL missing" }, { status: 500 });

  try {
    const response = await fetch(url);
    const rawData: CourseMold[] = await response.json();

    const connection = await mysqlPool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Fetch Faculties to map initials to IDs (for Lab Instructors)
      const [facultyRows]: any = await connection.execute('SELECT id, initials FROM faculties');
      const facultyMap = new Map<string, number>();
      facultyRows.forEach((row: any) => facultyMap.set(row.initials, row.id));

      // 2. Clear old exams and prereqs to prevent duplicates if you run this twice
      await connection.execute('DELETE FROM exams');
      await connection.execute('DELETE FROM prereqs');

      let labsAdded = 0;
      let examsAdded = 0;
      let prereqsAdded = 0;
      const processedCoursePrereqs = new Set<number>(); // Prevent adding the same prereq 50 times per section

      // 3. Loop through the JSON
      for (const item of rawData) {
        
        // --- A. PROCESS LABS ---
        if (item.labSectionId) {
          const labFacId = item.labFaculties ? facultyMap.get(item.labFaculties) || null : null;
          const labScheduleJson = item.labSchedules ? JSON.stringify(item.labSchedules) : null;

          await connection.execute(
            `INSERT IGNORE INTO labs 
             (id, parent_section_id, faculty_id, lab_course_code, room_name, schedule_details) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [item.labSectionId, item.sectionId, labFacId, item.labCourseCode, item.labRoomName, labScheduleJson]
          );
          labsAdded++;
        }

        // --- B. PROCESS EXAMS ---
        if (item.sectionSchedule) {
          // Midterm
          if (item.sectionSchedule.midExamDate) {
            await connection.execute(
              `INSERT INTO exams (section_id, exam_type, exam_date, start_time, end_time) VALUES (?, 'MIDTERM', ?, ?, ?)`,
              [item.sectionId, item.sectionSchedule.midExamDate, item.sectionSchedule.midExamStartTime, item.sectionSchedule.midExamEndTime]
            );
            examsAdded++;
          }
          // Final
          if (item.sectionSchedule.finalExamDate) {
            await connection.execute(
              `INSERT INTO exams (section_id, exam_type, exam_date, start_time, end_time) VALUES (?, 'FINAL', ?, ?, ?)`,
              [item.sectionId, item.sectionSchedule.finalExamDate, item.sectionSchedule.finalExamStartTime, item.sectionSchedule.finalExamEndTime]
            );
            examsAdded++;
          }
        }

        // --- C. PROCESS PREREQUISITES ---
        // If a course has prereqs, and we haven't processed this specific course ID yet
        if (item.prerequisiteCourses && !processedCoursePrereqs.has(item.courseId)) {
          processedCoursePrereqs.add(item.courseId);
          
          // Use regex to extract course codes like "ENG102" or "CSE110" from the messy string "(CSE110) OR (CSE161)"
          const requiredCodes = item.prerequisiteCourses.match(/[A-Z]{3,4}\d{3}/g) || [];
          
          for (const reqCode of requiredCodes) {
            await connection.execute(
              `INSERT INTO prereqs (course_id, required_course_code) VALUES (?, ?)`,
              [item.courseId, reqCode]
            );
            prereqsAdded++;
          }
        }
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Labs, Exams, and Prerequisites synced successfully!",
        stats: { labsAdded, examsAdded, prereqsAdded }
      });

    } catch (dbError) {
      await connection.rollback();
      connection.release();
      throw dbError;
    }

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}