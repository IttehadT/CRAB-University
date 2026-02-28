import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Your server client

export async function GET(request: Request) {
  // Get the URL and the special code Supabase sent in the email
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Get the intended destination (or default to dashboard)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // If we have a code, exchange it for a secure cookie!
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Cookie successfully created! Now open the door to the dashboard.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, send them back to login
  return NextResponse.redirect(`${origin}/login?error=CouldNotVerifyEmail`);
}