// src/app/api/admin/sync/route.ts

/**
 * ── THE MASTER SYNC CONTROLLER ──────────────────────────────────────────────
 * This single file handles all data synchronization between Supabase, the CDN, 
 * and Aiven MySQL. It replaces 4 separate folders.
 * * USAGE (Pass the 'type' in the URL):
 * - /api/admin/sync?type=users    (Mirrors Supabase to MySQL)
 * - /api/admin/sync?type=core     (Imports Semesters, Faculties, Courses)
 * - /api/admin/sync?type=sections (Imports Sections, Seat Status)
 * - /api/admin/sync?type=details  (Imports Labs, Exams, Prereqs)
 * - /api/admin/sync?type=all      (Runs them ALL in strict serial order)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncUser } from "@/lib/service"; 
import { mysqlPool } from "@/lib/db/mysql";
import { CourseMold } from "@/lib/db/mold";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Parse the URL to find out which script the user wants to run
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "users") {
      const result = await runUserSync();
      return NextResponse.json(result);
    } 
    else if (type === "core") {
      const result = await runCoreSync();
      return NextResponse.json(result);
    } 
    else if (type === "sections") {
      const result = await runSectionsSync();
      return NextResponse.json(result);
    } 
    else if (type === "details") {
      const result = await runDetailsSync();
      return NextResponse.json(result);
    } 
    else if (type === "all") {
      // ── STRICT SERIAL EXECUTION ──
      // They MUST run in this exact order to prevent Foreign Key crashes in MySQL
      console.log("Starting Full Serial Sync...");
      const userStats = await runUserSync();
      const coreStats = await runCoreSync();
      const sectionStats = await runSectionsSync();
      const detailStats = await runDetailsSync();

      return NextResponse.json({
        success: true,
        message: "All databases synchronized serially to prevent timeouts.",
        stats: {
          users: userStats,
          core: coreStats,
          sections: sectionStats,
          details: detailStats
        }
      });
    } 
    else {
      return NextResponse.json({ error: "Invalid type. Use ?type=users, core, sections, details, or all." }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Sync Error [${type}]:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================
// 1. USER SYNC (Formerly manual-sync)
// ============================================================
async function runUserSync() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;

  for (const user of users) {
    const provider = user.app_metadata?.provider || 'email';
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();
    const role = user.user_metadata?.role || 'student';

    const userData = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      phone: user.phone || null,
      provider: provider,
      last_sign_in_at: lastSignIn,
      role: role
    };

    await syncUser(userData);
  }

  let deletedCount = 0;
  if (users.length > 0) {
    const activeIds = users.map(u => `'${u.id}'`).join(',');
    const [result]: any = await mysqlPool.execute(`DELETE FROM users WHERE id NOT IN (${activeIds})`);
    deletedCount = result.affectedRows || 0;
  }

  return { success: true, totalActiveUsers: users.length, orphansDeleted: deletedCount };
}

// ============================================================
// 2. CORE SYNC (Formerly sync-core)
// ============================================================
async function runCoreSync() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) throw new Error("CDN URL missing");

  const response = await fetch(url);
  const rawData: CourseMold[] = await response.json();

  const uniqueSemesters = new Map<number, string>();
  const uniqueFaculties = new Set<string>();
  const uniqueCourses = new Map<number, any>();

  rawData.forEach((item) => {
    if (item.semesterSessionId) uniqueSemesters.set(item.semesterSessionId, `Session ${item.semesterSessionId}`);
    if (item.faculties) uniqueFaculties.add(item.faculties);
    if (item.courseId && !uniqueCourses.has(item.courseId)) {
      uniqueCourses.set(item.courseId, {
        id: item.courseId, code: item.courseCode, name: item.courseName,
        credits: item.courseCredit, type: item.courseType, degree: item.academicDegree
      });
    }
  });

  const connection = await mysqlPool.getConnection();
  try {
    await connection.beginTransaction();

    for (const [id, name] of Array.from(uniqueSemesters.entries())) {
      await connection.execute('INSERT IGNORE INTO semesters (id, name) VALUES (?, ?)', [id, name]);
    }
    for (const initials of Array.from(uniqueFaculties)) {
      await connection.execute('INSERT IGNORE INTO faculties (initials) VALUES (?)', [initials]);
    }
    for (const course of Array.from(uniqueCourses.values())) {
      await connection.execute(
        `INSERT IGNORE INTO courses (id, course_code, course_name, credits, course_type, academic_degree) VALUES (?, ?, ?, ?, ?, ?)`,
        [course.id, course.code, course.name, course.credits, course.type, course.degree]
      );
    }

    await connection.commit();
    connection.release();

    return { success: true, stats: { semesters: uniqueSemesters.size, faculties: uniqueFaculties.size, courses: uniqueCourses.size } };
  } catch (dbError) {
    await connection.rollback();
    connection.release();
    throw dbError;
  }
}

// ============================================================
// 3. SECTIONS SYNC (Formerly sync-sections)
// ============================================================
async function runSectionsSync() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) throw new Error("CDN URL missing");

  const response = await fetch(url);
  const rawData: CourseMold[] = await response.json();
  const connection = await mysqlPool.getConnection();

  try {
    const [facultyRows]: any = await connection.execute('SELECT id, initials FROM faculties');
    const facultyMap = new Map<string, number>();
    facultyRows.forEach((row: any) => facultyMap.set(row.initials, row.id));

    await connection.beginTransaction();

    let sectionsAdded = 0;
    let seatsUpdated = 0;

    for (const item of rawData) {
      const facultyId = item.faculties ? facultyMap.get(item.faculties) || null : null;
      const scheduleJson = item.sectionSchedule?.classSchedules ? JSON.stringify(item.sectionSchedule.classSchedules) : null;

      await connection.execute(
        `INSERT IGNORE INTO sections (id, course_id, semester_id, faculty_id, section_name, room_name, class_schedule) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.sectionId, item.courseId, item.semesterSessionId, facultyId, item.sectionName, item.roomName, scheduleJson]
      );
      sectionsAdded++;

      await connection.execute(
        `INSERT INTO seat_status (section_id, capacity, consumed_seat) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE capacity = VALUES(capacity), consumed_seat = VALUES(consumed_seat)`,
        [item.sectionId, item.capacity, item.consumedSeat]
      );
      seatsUpdated++;
    }

    await connection.commit();
    connection.release();

    return { success: true, stats: { sectionsProcessed: sectionsAdded, seatStatusesProcessed: seatsUpdated } };
  } catch (dbError) {
    await connection.rollback();
    connection.release();
    throw dbError;
  }
}

// ============================================================
// 4. DETAILS SYNC (Formerly sync-details)
// ============================================================
async function runDetailsSync() {
  const url = process.env.CONNECT_DATA_URL;
  if (!url) throw new Error("CDN URL missing");

  const response = await fetch(url);
  const rawData: CourseMold[] = await response.json();
  const connection = await mysqlPool.getConnection();

  try {
    await connection.beginTransaction();

    const [facultyRows]: any = await connection.execute('SELECT id, initials FROM faculties');
    const facultyMap = new Map<string, number>();
    facultyRows.forEach((row: any) => facultyMap.set(row.initials, row.id));

    await connection.execute('DELETE FROM exams');
    await connection.execute('DELETE FROM prereqs');

    let labsAdded = 0, examsAdded = 0, prereqsAdded = 0;
    const processedCoursePrereqs = new Set<number>();

    for (const item of rawData) {
      if (item.labSectionId) {
        const labFacId = item.labFaculties ? facultyMap.get(item.labFaculties) || null : null;
        const labScheduleJson = item.labSchedules ? JSON.stringify(item.labSchedules) : null;
        await connection.execute(
          `INSERT IGNORE INTO labs (id, parent_section_id, faculty_id, lab_course_code, room_name, schedule_details) VALUES (?, ?, ?, ?, ?, ?)`,
          [item.labSectionId, item.sectionId, labFacId, item.labCourseCode, item.labRoomName, labScheduleJson]
        );
        labsAdded++;
      }

      if (item.sectionSchedule) {
        if (item.sectionSchedule.midExamDate) {
          await connection.execute(`INSERT INTO exams (section_id, exam_type, exam_date, start_time, end_time) VALUES (?, 'MIDTERM', ?, ?, ?)`,
            [item.sectionId, item.sectionSchedule.midExamDate, item.sectionSchedule.midExamStartTime, item.sectionSchedule.midExamEndTime]);
          examsAdded++;
        }
        if (item.sectionSchedule.finalExamDate) {
          await connection.execute(`INSERT INTO exams (section_id, exam_type, exam_date, start_time, end_time) VALUES (?, 'FINAL', ?, ?, ?)`,
            [item.sectionId, item.sectionSchedule.finalExamDate, item.sectionSchedule.finalExamStartTime, item.sectionSchedule.finalExamEndTime]);
          examsAdded++;
        }
      }

      if (item.prerequisiteCourses && !processedCoursePrereqs.has(item.courseId)) {
        processedCoursePrereqs.add(item.courseId);
        const requiredCodes = item.prerequisiteCourses.match(/[A-Z]{3,4}\d{3}/g) || [];
        for (const reqCode of requiredCodes) {
          await connection.execute(`INSERT INTO prereqs (course_id, required_course_code) VALUES (?, ?)`, [item.courseId, reqCode]);
          prereqsAdded++;
        }
      }
    }

    await connection.commit();
    connection.release();

    return { success: true, stats: { labsAdded, examsAdded, prereqsAdded } };
  } catch (dbError) {
    await connection.rollback();
    connection.release();
    throw dbError;
  }
}