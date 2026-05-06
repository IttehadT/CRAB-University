"use server";

import { createSupportTicket, getUserSupportTickets } from "@/lib/service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitTicketAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const payload = {
      subject: formData.get("subject") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string || "", // Simplified for now; you can add actual file upload logic later
    };

    if (!payload.subject || !payload.category || !payload.description) {
      return { success: false, error: "Subject, Category, and Description are required." };
    }

    await createSupportTicket(user.email, payload);
    
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit ticket." };
  }
}

export async function getMyTicketsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, data: [] };
    }

    const tickets = await getUserSupportTickets(user.email);
    return { success: true, data: tickets };
  } catch (error) {
    return { success: false, data: [] };
  }
}