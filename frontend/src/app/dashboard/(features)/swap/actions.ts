"use server";

import { addCourseSwap, addSwapRequest, fetchUserSwapRequests, changeSwapRequestStatus, readAllSwapNotifications } from "@/lib/service";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { removeSwapRequest } from "@/lib/service"; // Make sure to add this import at the top
import { markSwapAsDone } from "@/lib/service"; // Add to top imports



export async function createSwapAction(formData: FormData, userEmail: string, userName: string) {
  try {
    const id = `swap_${randomUUID()}`;
    const courseCode = formData.get("courseCode") as string;
    const haveSec = formData.get("haveSec") as string;
    const wantSec = formData.get("wantSec") as string;
    const notes = formData.get("notes") as string;

    // We pass "TBA" for faculty and time for now. In a future update, 
    // we can pull these directly from the courses catalog based on the section!
    await addCourseSwap(
      id, userEmail, userName, courseCode, 
      haveSec, "TBA", "TBA", 
      wantSec, "TBA", "TBA", notes
    );

    revalidatePath("/dashboard/swap");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestSwapAction(swapId: string, receiverEmail: string, senderEmail: string) {
  try {
    // 1. Prevent self-requests
    if (receiverEmail === senderEmail) {
      return { success: false, error: "You cannot request your own swap." };
    }

    // 2. Prevent duplicate requests
    const userRequests = await fetchUserSwapRequests(senderEmail);
    const alreadyRequested = userRequests.some(
      (req: any) => req.swap_id === swapId && req.sender_email === senderEmail
    );
    
    if (alreadyRequested) {
      return { success: false, error: "You have already requested this swap." };
    }

    const id = `req_${randomUUID()}`;
    await addSwapRequest(id, swapId, senderEmail, receiverEmail);
    revalidatePath("/dashboard/swap");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptSwapAction(requestId: string) {
  try {
    // 1. Mark the request as ACCEPTED
    await changeSwapRequestStatus(requestId, 'ACCEPTED');
    
    // 2. We will inject the "Create Chat Thread" logic here in the next step!
    
    revalidatePath("/dashboard/swap");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getNotificationsAction(email: string) {
  try {
    const requests = await fetchUserSwapRequests(email);
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function deleteNotificationAction(requestId: string) {
  try {
    await removeSwapRequest(requestId);
    revalidatePath("/dashboard/swap");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markSwapDoneAction(swapId: string, userEmail: string) {
  try {
    await markSwapAsDone(swapId, userEmail);
    revalidatePath("/dashboard/swap");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markNotificationsReadAction(email: string) {
  try {
    await readAllSwapNotifications(email);
    // We don't revalidatePath here to prevent jittering the UI while the drawer opens
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}