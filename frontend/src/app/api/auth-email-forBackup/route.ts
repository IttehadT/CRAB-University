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

    // We only want to handle signup and login OTPs for now
    if (email_action_type !== "signup" && email_action_type !== "login") {
      return NextResponse.json({ message: "Action ignored" });
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
        subject: "Your CRABU Login Code",
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
        subject: "Your CRABU Login Code (Backup Route)",
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