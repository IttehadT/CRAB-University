// src/app/api/auth/check-user/route.ts

import { NextResponse } from "next/server";
// FIX: We now import directly from our unified service file
import { findUserByEmail } from "@/lib/service"; 

/**
 * Pre-login check — Ensures the email exists before sending OTP
 * ── PRE-FLIGHT CHECK API ────────────────────────────────────────────────────
 * This route is called by the UI *before* sending an OTP email. 
 * It ensures the email actually exists in our MySQL database.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Securely ask the master service if this user exists
    const user = await findUserByEmail(email);

    if (!user) {
      // Bouncer rejects unknown emails instantly
      return NextResponse.json(
        { error: "Account not found. If you used Google, please sign in with Google." },
        { status: 404 }
      );
    }

    // User exists! Tell the frontend it's safe to send the OTP.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}