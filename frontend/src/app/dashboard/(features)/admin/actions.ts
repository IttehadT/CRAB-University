"use server";

import { getAllSupportTickets, changeTicketStatus } from "@/lib/service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Centralized Security Check
async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error("Unauthorized. Admin access required.");
  }
  return user;
}

export async function getAdminTicketsAction() {
  try {
    await verifyAdminAccess();
    const tickets = await getAllSupportTickets();
    return { success: true, data: tickets };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function updateTicketStatusAction(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
  try {
    await verifyAdminAccess();
    await changeTicketStatus(ticketId, status);
    revalidatePath("/dashboard/(features)/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}