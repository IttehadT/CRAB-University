"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation"; // Added Next.js router
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // NEW: State to toggle between Sign In and Sign Up
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter(); // Initialize the router

  // NEW: Listen for background auth changes (like Google OAuth or OTP returning)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsRedirecting(true);
        router.push("/dashboard");
        router.refresh(); // Forces Next.js to update the server cookies instantly
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // COMBINED: Handles both signing in and signing up
const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(isSignUp ? "Creating your account..." : "Verifying credentials...");

    if (isSignUp) {
      // --- NEW: MATCHING PASSWORD CHECK ---
      if (password !== confirmPassword) {
        setMessage("Passwords do not match. Please try again.");
        setLoading(false);
        return; // Stop the signup process here
      }
      // --- NEW: STRICT PASSWORD VALIDATION ---
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setMessage("Weak password: Must be 8+ chars with an uppercase, lowercase, number, and symbol.");
        setLoading(false);
        return; // Stop the signup process here
      }

      // Generate a default avatar using their name (or email if name is missing)
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || email)}&background=2563eb&color=fff&size=128`;

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: defaultAvatar, // Save the generated picture
          }
        }
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      } else {
        // --- SMART REDIRECT LOGIC ---
        // Check if Supabase gave us a session, or if it's waiting for email confirmation
        if (data.session) {
          setMessage("Account created successfully! Redirecting...");
          setIsRedirecting(true);
          router.push("/dashboard");
          router.refresh();
        } else {
          // Email confirmation is ON in Supabase
          setMessage("Registration successful! Please check your email to verify your account.");
          setLoading(false);
          setIsSignUp(false); // Automatically flip the UI back to "Sign In"
          setPassword("");    // Clear the password field for security
        }
      }
    } else {
      // --- SIGN IN LOGIC ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
           setMessage("Invalid credentials. Please Sign Up or try again.");
        } else {
           setMessage(error.message);
        }
        setLoading(false);
      } else {
        setMessage("Success! Redirecting...");
        setIsRedirecting(true);
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("Redirecting to Google...");
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };  
  
  
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setMessage("Redirecting to Microsoft...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure', 
      options: { 
        scopes: 'email profile', // <-- ADD THIS LINE: Forces Microsoft to send the email
        redirectTo: `${window.location.origin}/dashboard` 
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true); 
    setMessage("Redirecting to GitHub...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });  
    if (error) { setMessage(error.message); setLoading(false); }
  };    

  // NEW: Intercept the render if we are transitioning to the dashboard
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="text-4xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </span>
          <p className="text-slate-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
        
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp ? "Sign up to access your student portal." : "Please sign in to access your student portal."}
          </p>
        </div>

        {message && (
          <div className={`rounded-lg p-3 text-center text-sm font-medium ${message.includes("Success") || message.includes("created") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            {message}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleEmailAuth}>
          
          {/* Full Name field only shows during Sign Up */}
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={isSignUp}
                className="relative block w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full rounded-md border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Password Input Block */}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="relative block w-full rounded-md border border-slate-300 px-3 py-3 pr-10 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 focus:outline-none z-20"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.61-3.092M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0-3h.01M21.542 12a10.05 10.05 0 01-1.61 3.092m-4.522 1.943A10.05 10.05 0 0012 5c-4.478 0-8.268 2.943-9.542 7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input Block (Only shows during Sign Up) */}
          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required={isSignUp}
                  minLength={8}
                  className="relative block w-full rounded-md border border-slate-300 px-3 py-3 pr-10 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Retype Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 focus:outline-none z-20"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.61-3.092M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0a3 3 0 003 3m0-3h.01M21.542 12a10.05 10.05 0 01-1.61 3.092m-4.522 1.943A10.05 10.05 0 0012 5c-4.478 0-8.268 2.943-9.542 7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link - Left Aligned */}
          {!isSignUp && (
            <div className="flex justify-start">
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </div>
        </form>

        {/* TOGGLE BETWEEN SIGN IN AND SIGN UP */}
        <div className="text-center text-sm">
          <span className="text-slate-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(""); // Clear any old errors
            }} 
            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

            <div className="mt-6 space-y-3">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </button>

            {/* Microsoft Button */}
            <button
              onClick={handleMicrosoftLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#ffb900" d="M11 11h9v9h-9z"/>
              </svg>
              Continue with Microsoft
            </button>

            {/* GitHub Button */}
            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg fill="#24292F" viewBox="0 0 24 24" width="25" height="25">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button> 
          </div>
        </div>
      </div>
    </div>
  );
}