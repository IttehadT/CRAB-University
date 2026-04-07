// src/lib/db/mold.ts

/**
 * ── THE MOLD (DATA SHAPES) ──────────────────────────────────────────────────
 * This file is the Single Source of Truth for all TypeScript types.
 * Every object that moves through CRAB University must fit a mold defined here.
 * If the database changes, we only update the shapes in this one file.
 */

// ============================================================
// 1. COURSE SHAPES
// ============================================================
export interface ClassScheduleMold {
  startTime: string;
  endTime: string;
  day: string;
}

export interface SectionScheduleMold {
  classPairId: number | null;
  classSlotId: number | null;
  finalExamDate: string | null;
  finalExamStartTime: string | null;
  finalExamEndTime: string | null;
  midExamDate: string | null;
  midExamStartTime: string | null;
  midExamEndTime: string | null;
  finalExamDetail: string | null;
  midExamDetail: string | null;
  classStartDate: string | null;
  classEndDate: string | null;
  classSchedules: ClassScheduleMold[] | null;
}

// The Master Outline for a Course
export interface CourseMold {
  sectionId: number;
  courseId: number;
  sectionName: string;
  courseCredit: number;
  courseCode: string;
  sectionType: string;
  capacity: number;
  consumedSeat: number;
  semesterSessionId: number;
  parentSectionId: number | null;
  faculties: string | null;
  roomName: string | null;
  roomNumber: string | null;
  courseType: string;
  academicDegree: string;
  sectionSchedule: SectionScheduleMold | null;
  courseName: string;
  prerequisiteCourses: string | null;
  labSchedules: ClassScheduleMold[] | null;
  labSectionId: number | null;
  labCourseCode: string | null;
  labFaculties: string | null;
  labName: string | null;
  labRoomName: string | null;
  preRegLabSchedule: string | null;
  preRegSchedule: string | null;
}

// ============================================================
// 2. USER SHAPES
// ============================================================
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  provider: string | null;
  last_sign_in_at: Date | null;
  created_at?: Date;
  role?: string;
}

// Keeping the interface for your Service to ensure backwards compatibility
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  upsert(user: User): Promise<void>; 
}

// ============================================================
// 3. ARCHITECTURE SHAPES
// ============================================================
// The DBResult wrapper is key — your UI always knows which source 
// the data came from, which is incredibly useful for debugging.
export type DBResult<T> =
  | { success: true; data: T; source: 'mysql' | 'cdn' | 'bucket' | 'local' }
  | { success: false; error: string };