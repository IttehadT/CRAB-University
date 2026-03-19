// src/app/api/admin/sync-sections/route.ts

import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db/mysql";
import { CourseMold } from "@/types/data.mold";

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) return NextResponse.json({ error: "CDN URL missing" }, { status: 500 });

  try {
    // 1. Fetch the 5MB JSON
    const response = await fetch(url);
    const rawData: CourseMold[] = await response.json();

    const connection = await mysqlPool.getConnection();

    try {
      // 2. Fetch the Faculties to create an Initials -> ID mapping
      const [facultyRows]: any = await connection.execute('SELECT id, initials FROM faculties');
      const facultyMap = new Map<string, number>();
      facultyRows.forEach((row: any) => facultyMap.set(row.initials, row.id));

      await connection.beginTransaction();

      let sectionsAdded = 0;
      let seatsUpdated = 0;

      // 3. Loop through the JSON and insert Sections and Seat Statuses
      for (const item of rawData) {
        // Find the faculty ID using their initials (If TBA or null, it stays null)
        const facultyId = item.faculties ? facultyMap.get(item.faculties) || null : null;
        
        // Convert the classSchedules array into a JSON string for MySQL
        const scheduleJson = item.sectionSchedule?.classSchedules 
          ? JSON.stringify(item.sectionSchedule.classSchedules) 
          : null;

        // A. Insert Section (IGNORE if it already exists)
        await connection.execute(
          `INSERT IGNORE INTO sections 
           (id, course_id, semester_id, faculty_id, section_name, room_name, class_schedule) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.sectionId, 
            item.courseId, 
            item.semesterSessionId, 
            facultyId, 
            item.sectionName, 
            item.roomName, 
            scheduleJson
          ]
        );
        sectionsAdded++;

        // B. Insert or Update Seat Status
        // We use ON DUPLICATE KEY UPDATE so this script can be run every 10 mins during registration!
        await connection.execute(
          `INSERT INTO seat_status (section_id, capacity, consumed_seat) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE capacity = VALUES(capacity), consumed_seat = VALUES(consumed_seat)`,
          [item.sectionId, item.capacity, item.consumedSeat]
        );
        seatsUpdated++;
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Sections and Seat Statuses synced successfully!",
        stats: {
          sectionsProcessed: sectionsAdded,
          seatStatusesProcessed: seatsUpdated
        }
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