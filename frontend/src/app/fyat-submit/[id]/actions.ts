"use server";

import { addFyatResponse } from "@/lib/service";

export async function submitFyatRoutineAction(groupId: string, studentName: string, studentId: string, courses: string) {
  if (!studentName || !studentId || !courses) {
    throw new Error("All fields are required.");
  }

  // Clean up the courses string (uppercase, remove extra spaces)
  const cleanedCourses = courses.toUpperCase().split(',').map(c => c.trim()).filter(Boolean).join(', ');

  // 🔥 FIX: Removed responseId. We only pass the 4 exact arguments that service.ts expects.
  await addFyatResponse(groupId, studentName, studentId, cleanedCourses);
  
  return { success: true };
}