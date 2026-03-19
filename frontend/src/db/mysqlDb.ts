// src/db/mysqlDb.ts

import { mysqlPool } from "@/lib/db/mysql";
import { CourseMold } from "@/types/data.mold";

export class MysqlDb {
  /**
   * Fetches data from Aiven MySQL, JOINs the tables, and returns only the requested keys.
   */
  static async getSpecificData<K extends keyof CourseMold>(
    parameters: K[]
  ): Promise<Pick<CourseMold, K>[]> {
    
    // 1. The Master Query: We JOIN the tables together to reconstruct the Mold
    const query = `
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
        c.course_name AS courseName
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN faculties f ON s.faculty_id = f.id
      LEFT JOIN seat_status ss ON s.id = ss.section_id
    `;

    const [rows]: any = await mysqlPool.execute(query);

    // 2. Filter the massive result to ONLY include the parameters the UI asked for
    const filteredData = rows.map((dbRow: any) => {
      const extractedInfo = {} as Pick<CourseMold, K>;
      
      parameters.forEach((param) => {
        // We safely map the database columns to the requested parameters
        extractedInfo[param] = dbRow[param]; 
      });
      
      return extractedInfo;
    });

    return filteredData;
  }
}