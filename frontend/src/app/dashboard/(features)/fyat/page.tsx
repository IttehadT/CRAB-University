import { fetchFyatGroups } from "@/lib/service";
import { createClient } from "@/lib/supabase/server";
import FyatHubUI from "./FyatHubUI";

export const metadata = { title: "FYAT Routine Mapper | CRAB University" };

export default async function FyatHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch securely on the server
  const groups = user?.email ? await fetchFyatGroups(user.email) : [];

  return <FyatHubUI initialGroups={groups} />;
}