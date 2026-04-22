import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addFyatGroup } from "@/lib/service";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { groupName, mentorCourses } = await request.json();

    if (!groupName) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const groupId = `fyat_${crypto.randomUUID()}`;
    await addFyatGroup(groupId, user.email, groupName, mentorCourses || "");

    return NextResponse.json({ success: true, groupId });

  } catch (error: any) {
    console.error("Failed to create FYAT Group:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}