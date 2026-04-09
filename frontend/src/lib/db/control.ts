/**
 * ── THE CONTROL CENTER (THE BRAIN) ──────────────────────────────────────────
 * This file dictates HOW data is fetched. It holds the fallback logic, 
 * the database routing rules, and the raw SQL queries.
 * * RULE: Services ONLY import from this file. They never touch mysql.ts or json.ts directly.
 */

import { mysqlQuery } from './mysql';
import { fetchCourseDataFromCDN, fetchCourseDataFromBucket } from './json';
import { CourseMold, User, DBResult } from './mold';

// ============================================================
// SECTION 1: DATABASE CONFIGURATION & ROUTING (Formerly db.config.ts)
// ============================================================
export const DB_CONFIG = {
  // Use these booleans as your "Kill Switches"
  useTier1_CDN: true,
  useTier2_SupabaseJSON: true, 
  useTier3_MySQL: true,        
  useTier4_VectorAI: true,     
};

// ============================================================
// SECTION 2: THE FALLBACK ENGINE (Formerly middleMan.service.ts)
// ============================================================
/**
 * Tries a sequence of database calls. Returns the first one that succeeds.
 * If all fail, it returns an error.
 */
async function withFallback<T>(
  // FIX: Explicitly typing 'name' here ensures TypeScript perfectly matches it to the DBResult mold
  attempts: Array<{ name: 'mysql' | 'cdn' | 'bucket' | 'local'; condition: boolean; fn: () => Promise<T> }>
): Promise<DBResult<T>> {
  for (const attempt of attempts) {
    if (!attempt.condition) continue; // Skip if disabled in DB_CONFIG

    try {
      const data = await attempt.fn();
      // FIX: Removed the invalid cast. Because 'name' is strictly typed above, this is 100% safe.
      return { success: true, data, source: attempt.name };
    } catch (err) {
      console.warn(`[DB] ${attempt.name} failed, routing to next tier...`, err);
    }
  }
  return { success: false, error: 'Critical Failure: All active databases are down.' };
}

// ============================================================
// SECTION 3: PUBLIC API (Exported for service.ts to use)
// ============================================================

// ── COURSES (Waterfall Strategy: CDN -> Bucket -> MySQL) ──
export async function getCourseData<K extends keyof CourseMold>(
  parameters: K[]
): Promise<DBResult<Pick<CourseMold, K>[]>> {
  
  return withFallback([
    {
      name: 'cdn',
      condition: DB_CONFIG.useTier1_CDN,
      fn: () => fetchCourseDataFromCDN(parameters),
    },
    {
      name: 'bucket',
      condition: DB_CONFIG.useTier2_SupabaseJSON,
      fn: () => fetchCourseDataFromBucket(parameters),
    },
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        // The Master JOIN Query (Moved from mysqlDb.ts)
        // The Master JOIN Query (Updated to include schedules & exams)
        // The Master JOIN Query (Perfectly aliased to match the JSON CDN)
        const sql = `
          SELECT 
            s.id AS sectionId, 
            c.id AS courseId, 
            s.section_name AS sectionName,
            c.credits AS courseCredit, 
            c.course_code AS courseCode, 
            ss.capacity AS capacity,
            ss.consumed_seat AS consumedSeat, 
            s.semester_id AS semesterSessionId,
            f.initials AS faculties, 
            s.room_name AS roomName, 
            c.course_type AS courseType,
            c.academic_degree AS academicDegree, 
            c.course_name AS courseName,
            c.prerequisite_courses AS prerequisiteCourses,
            s.class_schedule AS sectionSchedule,
            s.lab_schedule AS labSchedules,
            s.final_exam_date AS finalExamDate, 
            s.final_exam_start_time AS finalExamStartTime, 
            s.final_exam_end_time AS finalExamEndTime,
            s.mid_exam_date AS midExamDate, 
            s.mid_exam_start_time AS midExamStartTime, 
            s.mid_exam_end_time AS midExamEndTime
          FROM sections s
          JOIN courses c ON s.course_id = c.id
          LEFT JOIN faculties f ON s.faculty_id = f.id
          LEFT JOIN seat_status ss ON s.id = ss.section_id
        `;
        
        const rows = await mysqlQuery<any>(sql);

        // Filter the massive result to ONLY include the requested parameters
        return rows.map((dbRow) => {
          const extractedInfo = {} as Pick<CourseMold, K>;
          parameters.forEach((param) => {
            extractedInfo[param] = dbRow[param]; 
          });
          return extractedInfo;
        });
      },
    },
  ]);
}

// ── USERS (MySQL Only Strategy) ──
export async function getUserById(id: string): Promise<DBResult<User | null>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const rows = await mysqlQuery<User>('SELECT * FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
      }
    }
  ]);
}

export async function getUserByEmail(email: string): Promise<DBResult<User | null>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const rows = await mysqlQuery<User>('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
      }
    }
  ]);
}

export async function upsertUser(user: any): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `
          INSERT INTO users (id, email, full_name, avatar_url, phone, provider, last_sign_in_at, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            full_name = VALUES(full_name), avatar_url = VALUES(avatar_url),
            phone = VALUES(phone), last_sign_in_at = VALUES(last_sign_in_at),
            role = VALUES(role)
        `;
        await mysqlQuery(sql, [
          user.id, user.email, user.full_name || null, user.avatar_url || null,
          user.phone || null, user.provider || 'email', user.last_sign_in_at || new Date(),
          user.role || 'student'
        ]);
      }
    }
  ]);
}


// ============================================================
// ── SAVED ROUTINES (MySQL Only Strategy) ──
// ============================================================

export async function getSavedRoutinesByUser(email: string): Promise<DBResult<any[]>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `
          SELECT 
            id, routine_name AS routineName, routine_data AS routineStr, created_at AS createdAt,
            semester, course_count AS courseCount, total_credits AS totalCredits, 
            total_hours AS totalHours, has_clash AS hasClash
          FROM saved_routines 
          WHERE user_email = ? 
          ORDER BY created_at DESC
        `;
        return await mysqlQuery<any>(sql, [email]);
      }
    }
  ]);
}

export async function createSavedRoutine(
  id: string, email: string, routineName: string, routineData: string,
  semester: string, courseCount: number, totalCredits: number, totalHours: number, hasClash: boolean
): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `
          INSERT INTO saved_routines 
          (id, user_email, routine_name, routine_data, semester, course_count, total_credits, total_hours, has_clash) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await mysqlQuery(sql, [id, email, routineName, routineData, semester, courseCount, totalCredits, totalHours, hasClash]);
      }
    }
  ]);
}

export async function deleteSavedRoutine(id: string, email: string): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `DELETE FROM saved_routines WHERE id = ? AND user_email = ?`;
        await mysqlQuery(sql, [id, email]);
      }
    }
  ]);
}

/**
 * ── RENAME ROUTINE ─────────────────────────────────────────────────────────
 * Updates the name of a specific routine, heavily guarded by user_email 
 * to prevent unauthorized modifications.
 */
export async function updateSavedRoutineName(id: string, email: string, newName: string): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `UPDATE saved_routines SET routine_name = ? WHERE id = ? AND user_email = ?`;
        await mysqlQuery(sql, [newName, id, email]);
      }
    }
  ]);
}

/**
 * ── FETCH PUBLIC ROUTINE BY ID ──────────────────────────────────────────────
 * Retrieves a single routine from MySQL using its unique UUID.
 * This does NOT filter by user_email because it is meant for public sharing.
 */
export async function getSavedRoutineById(id: string): Promise<DBResult<any>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `
          SELECT 
            id, user_email AS userEmail, routine_name AS routineName, routine_data AS routineStr, created_at AS createdAt,
            semester, course_count AS courseCount, total_credits AS totalCredits, 
            total_hours AS totalHours, has_clash AS hasClash
          FROM saved_routines 
          WHERE id = ?
        `;
        const rows = await mysqlQuery<any>(sql, [id]);
        // If the array has items, return the first one. Otherwise, return null.
        return rows.length > 0 ? rows[0] : null;
      }
    }
  ]);
}