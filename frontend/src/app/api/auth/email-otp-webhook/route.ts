/**
 * ── THE PRIMARY EMAIL OTP WEBHOOK ───────────────────────────────────────────
 * WARNING: Despite its old name, this is NOT a backup file. This is the 
 * PRIMARY email sender for the entire application.
 * * HOW IT WORKS:
 * 1. A user tries to log in or sign up via the UI.
 * 2. Supabase generates an OTP and a secure token hash.
 * 3. Supabase fires a webhook directly to this URL containing the data.
 * 4. This route constructs a magic link (or grabs the OTP) and applies custom HTML.
 * 5. It attempts to send via Resend, safely falling back to Gmail.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. Parse the payload that Supabase sends us
    const payload = await request.json();
    const { user, email_data } = payload;
    
    // We need token_hash and redirect_to to build the Confirmation URL manually
    const { token, token_hash, redirect_to, email_action_type } = email_data;

    const allowedActions = ["signup", "login", "magiclink", "recovery"];
    if (!allowedActions.includes(email_action_type)) {
      console.log(`Ignoring action type: ${email_action_type}`);
      return NextResponse.json({ message: "Action ignored" });
    }

    // 2. Manually construct the {{ .ConfirmationURL }}
    // This points to Supabase's internal verifier, which validates the hash and redirects the user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const siteUrl = redirect_to || "https://crabu.app/dashboard";
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(siteUrl)}`;

    // 3. Dynamically set the subject line and HTML template
    let emailSubject = "";
    let htmlContent = "";

    if (email_action_type === "signup") {
      emailSubject = "Welcome to CRAB University! Please confirm your account";
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1d4ed8; margin: 0; font-size: 28px; font-weight: 800;">🦀 CRAB University</h1>
          </div>
          <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #0f172a; margin-top: 0;">Verify Your Student Account</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Welcome! Thank you for registering for the student portal. Please confirm your email address to activate your account and access your dashboard.
            </p>
            <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px; line-height: 1.5;">
            <h4 style="margin: 0;">&copy; 2026 CRAB University. All rights reserved.</h4>
            <p style="margin: 4px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
    } else if (email_action_type === "recovery") {
      emailSubject = "CRAB University Password Reset Code";
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1d4ed8; margin: 0; font-size: 28px; font-weight: 800;">🦀 CRAB University</h1>
          </div>
          <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #0f172a; margin-top: 0;">Password Reset Code</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              We received a request to reset the password for your student account. Enter the code below on the password recovery page:
            </p>
            <div style="margin: 32px auto; padding: 20px; background-color: #f1f5f9; border-radius: 8px; font-size: 24px; font-weight: 900; letter-spacing: 8px; color: #1e293b; max-width: 300px;">
              ${token}
            </div>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              If you did not request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px; line-height: 1.5;">
            <h4 style="margin: 0;">&copy; 2026 CRAB University. All rights reserved.</h4>
            <p style="margin: 4px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
    } else {
      // Fallback for general login / magic links
      emailSubject = "Your CRABU Login Link";
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1d4ed8; margin: 0; font-size: 28px; font-weight: 800;">🦀 CRAB University</h1>
          </div>
          <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #0f172a; margin-top: 0;">Sign In to Your Account</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Click the button below to securely sign in to your dashboard.
            </p>
            <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Sign In
            </a>
          </div>
        </div>
      `;
    }

    // ==========================================
    // ATTEMPT 1: The Primary Enterprise Sender
    // ==========================================
    try {
      await resend.emails.send({
        from: "CRAB University <verify@crabu.app>",
        to: user.email,
        subject: emailSubject,
        html: htmlContent,
      });
      console.log(`✅ Sent ${email_action_type} securely via Resend`);
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
        subject: `${emailSubject} (Backup Route)`,
        html: htmlContent,
      });
      
      console.log(`✅ Sent ${email_action_type} safely via Gmail Fallback`);
      return NextResponse.json({ message: "Sent via Gmail Fallback" });
    }

  } catch (error) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}