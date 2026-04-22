"use server"; // This magic line tells Next.js this code NEVER runs in the browser

import { createClient } from "@/lib/supabase/server";
import { addFyatGroup } from "@/lib/service";
import { redirect } from "next/navigation";

export async function createFyatGroupAction(groupName: string, mentorCourses: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized access");
  }

  if (!groupName) {
    throw new Error("Group name is required");
  }

  const groupId = `fyat_${crypto.randomUUID()}`;
  
  // Call your database service directly!
  await addFyatGroup(groupId, user.email, groupName, mentorCourses || "");

  // Instantly redirect the user to the new page on the server side
  redirect(`/dashboard/fyat/${groupId}`);
}