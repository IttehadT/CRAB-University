"use server";

import { fetchSocialProfile, saveSocialProfile } from "@/lib/service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    let finalAvatarUrl = formData.get("avatar_url") as string || "";
    const avatarFile = formData.get("avatar_file") as File | null;

    // TODO: If avatarFile exists, upload it to Supabase Storage here.
    // Example: 
    // if (avatarFile && avatarFile.size > 0) {
    //   const { data } = await supabase.storage.from('avatars').upload(`${user.id}/${avatarFile.name}`, avatarFile);
    //   finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
    // }

    const payload = {
      nickname: formData.get("nickname") as string || "",
      bio: formData.get("bio") as string || "",
      avatar_url: finalAvatarUrl,
      is_discoverable: formData.get("is_discoverable") === "true",
    };

    await saveSocialProfile(user.email, payload);
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard"); 
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}




export async function getProfileAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      return { success: false, data: null };
    }

    // fetchSocialProfile was created in your service.ts in Phase 2.3
    const profile = await fetchSocialProfile(user.email);
    
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, data: null };
  }
}