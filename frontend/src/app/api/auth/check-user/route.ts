import { NextResponse } from "next/server";
import { userService } from "@/services/user.service";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Securely ask the MySQL service if this user exists
    const user = await userService.findByEmail(email);

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