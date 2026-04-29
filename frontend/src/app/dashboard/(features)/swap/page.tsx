import { fetchAllCourseSwaps } from "@/lib/service";
import SwapUI from "./SwapUI";
import { createClient } from "@/lib/supabase/server"; // Import your auth method
import { redirect } from "next/navigation";

export const metadata = {
  title: "Course Swap | CRAB University",
  description: "Trade course sections with other students.",
};

export default async function CourseSwapPage() {
  const supabase = await createClient(); 
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Fetch the master list of swaps
  const initialSwaps = await fetchAllCourseSwaps();

  return (
    <SwapUI 
      initialSwaps={initialSwaps} 
      currentUserEmail={user.email} 
      currentUserName={user.user_metadata?.full_name || "A Student"} 
    />
  );
}