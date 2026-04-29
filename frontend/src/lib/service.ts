// src/lib/service.ts

/**
 * ── THE MASTER SERVICE (BUSINESS LOGIC) ─────────────────────────────────────
 * This is the ONLY file that API routes and UI components are allowed to import.
 * It asks `control.ts` for data, applies business rules (like checking if a user
 * is allowed to see the data), and formats it for the frontend.
 */

import { 
  getCourseData, 
  getUserById, 
  getUserByEmail, 
  upsertUser,
  getSavedRoutinesByUser, 
  createSavedRoutine, 
  deleteSavedRoutine,
  getSavedRoutineById,
  updateSavedRoutineName,
  setRoutineActiveStatus,
  getAllUsers,
  deleteUserFromDb,
  getAllCourseSwaps,
  createFyatGroup,
  createFyatResponse,
  createCourseSwap,
  createSwapRequest,
  getSwapRequestsForUser,
  updateSwapRequestStatus,
  deleteSwapRequest,
  setCourseSwapDone,
  markNotificationsAsRead
} from './db/control';
import { CourseMold, User } from './db/mold';
import { siteConfig } from "@/config/site"; // <-- Added for Master Semester Switch
import { getFyatGroupsByEmail, getFyatGroupDetails } from './db/control'; // add to top imports

// ============================================================
// COURSE LOGIC
// ============================================================

/**
 * Fetches specific course columns. 
 * The UI simply asks for data, and this service returns it cleanly.
 * Now Semester-Aware! Defaults to the master config if no semester is passed.
 */
export async function fetchCourses<K extends keyof CourseMold>(
  parameters: K[],
  semester: string = siteConfig.currentSemester // <-- Phase 2: Added semester parameter
): Promise<{ source: string; data: Pick<CourseMold, K>[] }> {
  
  // Phase 2: Pass the semester down to the DB controller
  const result = await getCourseData(parameters, semester);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  // Returning it in the exact same format your UI currently expects
  return { source: result.source, data: result.data };
}

// ============================================================
// USER & AUTH LOGIC
// ============================================================

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await getUserByEmail(email);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await getUserById(id);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function syncUser(userData: any): Promise<void> {
  const result = await upsertUser(userData);
  if (!result.success) throw new Error(result.error);
}

// ============================================================
// SAVED ROUTINE LOGIC
// ============================================================

export async function fetchUserRoutines(email: string) {
  const result = await getSavedRoutinesByUser(email);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

// Add the new parameters to the signature
export async function saveUserRoutine(
  id: string, 
  email: string, 
  routineName: string, 
  routineStr: string,
  semester: string, 
  courseCount: number, 
  totalCredits: number, 
  totalDays: number, 
  totalMinutes: number, 
  hasClash: boolean
) {
  // Pass all 10 arguments down to the database controller
  const result = await createSavedRoutine(
    id, email, routineName, routineStr, 
    semester, courseCount, totalCredits, totalDays, totalMinutes, hasClash
  );
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function removeUserRoutine(id: string, email: string) {
  const result = await deleteSavedRoutine(id, email);
  if (!result.success) throw new Error(result.error);
  return result;
}

/**
 * Service wrapper to fetch a routine by ID.
 * Throws a clean error if the routine is not found or DB fails.
 */
export async function fetchRoutineById(id: string) {
  const result = await getSavedRoutineById(id);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function renameUserRoutine(id: string, email: string, newName: string) {
  const result = await updateSavedRoutineName(id, email, newName);
  if (!result.success) throw new Error(result.error);
}

export async function updateRoutineActiveStatus(id: string, email: string, isActive: boolean) {
  const result = await setRoutineActiveStatus(id, email, isActive);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function fetchAllUsers(): Promise<User[]> {
  const result = await getAllUsers();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function removeUser(id: string): Promise<void> {
  const result = await deleteUserFromDb(id);
  if (!result.success) throw new Error(result.error);
}

export async function fetchAllCourseSwaps() {
  const result = await getAllCourseSwaps();
  if (!result.success) throw new Error(result.error);
  return result.data;
}



export async function fetchFyatGroups(email: string) {
  const result = await getFyatGroupsByEmail(email);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function fetchFyatGroupDetails(groupId: string) {
  const result = await getFyatGroupDetails(groupId);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function addFyatGroup(id: string, email: string, groupName: string, courses: string) {
  const result = await createFyatGroup(id, email, groupName, courses);
  if (!result.success) throw new Error(result.error);
}

export async function addFyatResponse(id: string, groupId: string, studentName: string, studentId: string, courses: string) {
  const result = await createFyatResponse(id, groupId, studentName, studentId, courses);
  if (!result.success) throw new Error(result.error);
}

export async function addCourseSwap(
  id: string, userEmail: string, studentName: string, courseCode: string,
  haveSection: string, haveFaculty: string, haveTime: string,
  wantSection: string, wantFaculty: string, wantTime: string, notes: string
) {
  const result = await createCourseSwap(id, userEmail, studentName, courseCode, haveSection, haveFaculty, haveTime, wantSection, wantFaculty, wantTime, notes);
  if (!result.success) throw new Error(result.error);
}

export async function addSwapRequest(id: string, swapId: string, senderEmail: string, receiverEmail: string) {
  const result = await createSwapRequest(id, swapId, senderEmail, receiverEmail);
  if (!result.success) throw new Error(result.error);
}

export async function fetchUserSwapRequests(email: string) {
  const result = await getSwapRequestsForUser(email);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function changeSwapRequestStatus(requestId: string, status: 'ACCEPTED' | 'REJECTED') {
  const result = await updateSwapRequestStatus(requestId, status);
  if (!result.success) throw new Error(result.error);
}

export async function removeSwapRequest(requestId: string) {
  const result = await deleteSwapRequest(requestId);
  if (!result.success) throw new Error(result.error);
}

export async function markSwapAsDone(swapId: string, userEmail: string) {
  const result = await setCourseSwapDone(swapId, userEmail);
  if (!result.success) throw new Error(result.error);
}

export async function readAllSwapNotifications(email: string) {
  const result = await markNotificationsAsRead(email);
  if (!result.success) throw new Error(result.error);
}