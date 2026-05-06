"use server";

import { saveAcademicProfile } from "@/lib/service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveManualProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const payload = {
      student_id: formData.get("student_id") as string,
      program: formData.get("program") as string,
      department: formData.get("department") as string,
      cgpa: parseFloat(formData.get("cgpa") as string) || 0,
      completed_credits: parseFloat(formData.get("credits") as string) || 0,
      semesters_completed: parseInt(formData.get("semesters") as string) || 0,
    };

    // Require at least CGPA and Credits
    if (!payload.student_id || !payload.department) {
       return { success: false, error: "Please fill out all fields." };
    }

    await saveAcademicProfile(user.id, payload);
    
    // Refresh the dashboard to show new stats
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save profile." };
  }
}