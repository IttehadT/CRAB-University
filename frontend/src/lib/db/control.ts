/**
 * ── THE CONTROL CENTER (THE BRAIN) ──────────────────────────────────────────
 * This file dictates HOW data is fetched. It holds the fallback logic, 
 * the database routing rules, and the raw SQL queries.
 * * RULE: Services ONLY import from this file. They never touch mysql.ts or json.ts directly.
 */

import { mysqlQuery } from './mysql';
import { fetchCourseDataFromCDN, fetchCourseDataFromBucket } from './json';
import { CourseMold, User, DBResult } from './mold';
import { siteConfig } from '@/config/site';

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
  parameters: K[],
  requestedSemester: string = siteConfig.currentSemester // Defaults to current if not provided
): Promise<DBResult<Pick<CourseMold, K>[]>> {
  
  const isCurrentSemester = requestedSemester === siteConfig.currentSemester;

  return withFallback([
    {
      name: 'cdn',
      // SMART ROUTING: Only use the CDN if they are asking for the current semester
      condition: DB_CONFIG.useTier1_CDN && isCurrentSemester,
      fn: () => fetchCourseDataFromCDN(parameters),
    },
    {
      name: 'bucket',
      condition: DB_CONFIG.useTier2_SupabaseJSON,
      fn: () => fetchCourseDataFromBucket(parameters, requestedSemester),
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
            total_days AS totalDays, total_minutes AS totalMinutes, has_clash AS hasClash,
            is_active AS isActive
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
  semester: string, courseCount: number, totalCredits: number, totalDays: number, totalMinutes: number, hasClash: boolean
): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        // We added total_days to the column list, and an extra ? to the VALUES
        const sql = `
          INSERT INTO saved_routines 
          (id, user_email, routine_name, routine_data, semester, course_count, total_credits, total_days, total_minutes, has_clash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await mysqlQuery(sql, [id, email, routineName, routineData, semester, courseCount, totalCredits, totalDays, totalMinutes, hasClash]);
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
            total_days AS totalDays, total_minutes AS totalMinutes, has_clash AS hasClash,
            is_active AS isActive
          FROM saved_routines 
          WHERE id = ?
        `;
        const rows = await mysqlQuery<any>(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
      }
    }
  ]);
}


/**
 * ── TOGGLE DEFAULT ROUTINE ────────────────────────────────────────────────
 * If setting to true, it wipes all other defaults for this user first
 * so they can only have ONE default routine at a time.
 */
export async function setRoutineActiveStatus(id: string, email: string, isActive: boolean): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        if (isActive) {
          // 1. Turn off the tick for ALL of this user's routines
          await mysqlQuery('UPDATE saved_routines SET is_active = 0 WHERE user_email = ?', [email]);
          
          // 2. Turn on the tick for ONLY the specific routine they clicked
          await mysqlQuery('UPDATE saved_routines SET is_active = 1 WHERE id = ? AND user_email = ?', [id, email]);
        } else {
          // If they click a green tick to turn it off, just disable it
          await mysqlQuery('UPDATE saved_routines SET is_active = 0 WHERE id = ? AND user_email = ?', [id, email]);
        }
      }
    }
  ]);
}


export async function getAllUsers(): Promise<DBResult<User[]>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        // Fetch all users, sorted by whoever logged in most recently
        const rows = await mysqlQuery<User>('SELECT * FROM users ORDER BY last_sign_in_at DESC');
        return rows;
      }
    }
  ]);
}

export async function deleteUserFromDb(id: string): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        await mysqlQuery('DELETE FROM users WHERE id = ?', [id]);
      }
    }
  ]);
}


export async function getAllCourseSwaps(): Promise<DBResult<any[]>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        return await mysqlQuery<any>('SELECT * FROM course_swaps ORDER BY created_at DESC');
      }
    }
  ]);
}


// ============================================================
// ── FYAT ROUTINE MAPPER ──
// ============================================================

export async function getFyatGroupsByEmail(email: string): Promise<DBResult<any[]>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        return await mysqlQuery<any>('SELECT * FROM fyat_groups WHERE mentor_email = ? ORDER BY created_at DESC', [email]);
      }
    }
  ]);
}

export async function getFyatGroupDetails(groupId: string): Promise<DBResult<{ group: any, responses: any[] }>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const groupRows = await mysqlQuery<any>('SELECT * FROM fyat_groups WHERE id = ?', [groupId]);
        if (groupRows.length === 0) throw new Error("Group not found");
        
        const responseRows = await mysqlQuery<any>('SELECT * FROM fyat_responses WHERE group_id = ? ORDER BY created_at DESC', [groupId]);
        
        return { group: groupRows[0], responses: responseRows };
      }
    }
  ]);
}

export async function createFyatGroup(id: string, email: string, groupName: string, courses: string): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `INSERT INTO fyat_groups (id, mentor_email, group_name, mentor_courses) VALUES (?, ?, ?, ?)`;
        await mysqlQuery(sql, [id, email, groupName, courses]);
      }
    }
  ]);
}

export async function createFyatResponse(id: string, groupId: string, studentName: string, studentId: string, courses: string): Promise<DBResult<void>> {
  return withFallback([
    {
      name: 'mysql',
      condition: DB_CONFIG.useTier3_MySQL,
      fn: async () => {
        const sql = `INSERT INTO fyat_responses (id, group_id, student_name, student_id, courses) VALUES (?, ?, ?, ?, ?)`;
        await mysqlQuery(sql, [id, groupId, studentName, studentId, courses]);
      }
    }
  ]);
}