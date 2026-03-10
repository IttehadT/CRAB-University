import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. Parse the payload that Supabase sends us
    const payload = await request.json();
    const { user, email_data } = payload;
    
    // email_data contains the OTP code or the magic link
    const { token, email_action_type } = email_data;

    // 2. Define the exact actions we want to send emails for
    const allowedActions = ["signup", "login", "magiclink", "recovery"];
    
    if (!allowedActions.includes(email_action_type)) {
      console.log(`Ignoring action type: ${email_action_type}`);
      return NextResponse.json({ message: "Action ignored" });
    }

    // 3. Dynamically set the subject line based on what they are doing
    let emailSubject = "Your CRABU Login Code";
    if (email_action_type === "recovery") {
      emailSubject = "Reset Your CRABU Password";
    }

    // HTML Template for the email
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #1d4ed8;">CRAB University</h2>
        <p>Your authentication code is:</p>
        <h1 style="letter-spacing: 4px;">${token}</h1>
        <p style="color: #64748b; font-size: 12px;">If you didn't request this, safely ignore it.</p>
      </div>
    `;

    // ==========================================
    // ATTEMPT 1: The Primary Enterprise Sender
    // ==========================================
    try {
      await resend.emails.send({
        from: "CRAB University <verify@crabu.app>",
        to: user.email,
        subject: emailSubject, // Using the dynamic subject!
        html: htmlContent,
      });
      console.log("✅ Sent securely via Resend");
      return NextResponse.json({ message: "Sent via Resend" });

    } catch (resendError) {
      console.error("🚨 RESEND FAILED! Triggering Gmail Fallback...", resendError);
      
      // ==========================================
      // ATTEMPT 2: The Cold Standby (Gmail)
      // ==========================================
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"CRABU Backup Server" <services.crabu@gmail.com>',
        to: user.email,
        subject: `${emailSubject} (Backup Route)`, // Dynamic subject here too!
        html: htmlContent,
      });
      
      console.log("✅ Sent safely via Gmail Fallback");
      return NextResponse.json({ message: "Sent via Gmail Fallback" });
    }

  } catch (error) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}