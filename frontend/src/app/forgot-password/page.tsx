"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  // STEP 1: Send the 8-digit OTP to their email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Sending 8-digit code...");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Code sent! Please check your email.");
      setStep(2);
    }
    setLoading(false);
  };

  // STEP 2: Verify the OTP they typed in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Verifying code...");
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Code verified! Please enter your new password.");
      setStep(3);
    }
    setLoading(false);
  };

  // STEP 3: Save the new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Enforce your strict password rules!
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage("Weak password: Must be 8+ chars with an uppercase, lowercase, number, and symbol.");
      setLoading(false);
      return;
    }

    setMessage("Updating password...");
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Success! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1 && "Enter your email to receive an 8-digit reset code."}
            {step === 2 && "Enter the 8-digit code sent to your email."}
            {step === 3 && "Create a new, strong password."}
          </p>
        </div>

        {message && (
          <div className={`rounded-lg p-3 text-center text-sm font-medium ${message.includes("Success") || message.includes("sent") || message.includes("verified") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            {message}
          </div>
        )}

        {/* --- STEP 1 FORM: EMAIL --- */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Student Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Processing..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* --- STEP 2 FORM: OTP --- */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <input
                type="text"
                required
                maxLength={8}
                className="relative block w-full rounded-md border border-slate-300 px-3 py-3 text-center tracking-widest text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Enter Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 8}
              className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* --- STEP 3 FORM: NEW PASSWORD --- */}
        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <input
                type="password"
                required
                minLength={8}
                className="relative block w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="New Password (8+ chars, mix of A-z, 0-9, !@#)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="text-center text-sm mt-4">
          <Link href="/login" className="font-medium text-slate-600 hover:text-blue-500">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}