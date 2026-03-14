"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// ─── Webview Detection Utility (iOS ONLY) ────────────────────────────────
function isWebview(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad|iPod/.test(ua);
  if (!isIOS) return false;
  return !/Safari/.test(ua) || /FBAN|FBAV|Instagram|Messenger/.test(ua);
}

function openInBrowser(url: string) {
  if (/Android/.test(navigator.userAgent)) {
    window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  } else {
    window.location.href = url;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [webviewDetected, setWebviewDetected] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setWebviewDetected(isWebview());
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false);
        setIsRedirecting(false);
        setMessage(""); 
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsRedirecting(true);
        try {
          await fetch("/api/auth/sync-user", { method: "POST" });
        } catch (e) {
          console.error("Failed to trigger sync", e);
        }
        router.push("/dashboard");
        router.refresh();
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(isSignUp ? "Creating your account..." : "Verifying credentials...");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage("Passwords do not match. Please try again.");
        setLoading(false);
        return;
      }
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setMessage("Weak password: Must be 8+ chars with an uppercase, lowercase, number, and symbol.");
        setLoading(false);
        return;
      }

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || email)}&background=2563eb&color=fff&size=128`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            avatar_url: defaultAvatar,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      } else {
        if (data.session) {
          setMessage("Account created successfully! Redirecting...");
          setIsRedirecting(true);
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Registration successful! Please check your email to verify your account.");
          setLoading(false);
          setIsSignUp(false);
          setPassword("");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(
          error.message.includes("Invalid login credentials")
            ? "Invalid credentials. Please Sign Up or try again."
            : error.message
        );
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
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: "openid email profile",
        queryParams: {
          access_type: "online",
          prompt: "select_account",
          fedcm_enabled: "false",
        },
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
      provider: "azure",
      options: {
        scopes: "email profile",
        redirectTo: `${window.location.origin}/dashboard`,
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
      provider: "github",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="text-4xl font-bold text-primary dark:text-blue-500">{siteConfig.brand?.logoText || siteConfig.name}</span>
          <p className="text-muted-foreground dark:text-slate-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (webviewDetected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6 font-sans">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-card dark:bg-slate-900 shadow-2xl">
          <div className="bg-blue-600 p-6 text-center text-white">
            <span className="text-3xl font-bold tracking-tight">{siteConfig.brand?.logoText || siteConfig.name}</span>
          </div>
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground dark:text-slate-100">Action Required</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground dark:text-slate-400">
                To keep your account secure, Google requires you to sign in using a standard web browser. Please tap the button below to continue securely.
              </p>
            </div>
            <button
              onClick={() => openInBrowser("https://crabu.itausif.tech/login")}
              className="w-full rounded-xl bg-slate-900 dark:bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
            >
              Open securely in Browser
            </button>
            <div className="rounded-lg bg-background dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 text-left">
               <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Having trouble?</p>
               <p className="text-xs text-muted-foreground dark:text-slate-400">
                 Tap the <span className="font-bold">three dots (...)</span> in the top corner of this screen and select <span className="font-bold text-slate-800 dark:text-slate-200">"Open in system browser"</span>.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card dark:bg-slate-900 p-8 shadow-lg border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-primary dark:text-blue-500">
            {siteConfig.brand?.logoText || siteConfig.name}
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground dark:text-slate-100">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">
            {isSignUp
              ? "Sign up to access your student portal."
              : "Please sign in to access your student portal."}
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-center text-sm font-medium ${
              message.includes("Success") || message.includes("created")
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-primary-muted text-primary dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {message}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleEmailAuth}>
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={isSignUp}
                className="relative block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-3 py-3 text-foreground dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-3 py-3 text-foreground dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="relative block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-3 py-3 pr-10 text-foreground dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none z-20"
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
                  className="relative block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-3 py-3 pr-10 text-foreground dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Retype Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none z-20"
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

          {!isSignUp && (
            <div className="flex justify-start">
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors"
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground dark:text-slate-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
            className="ml-1 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card dark:bg-slate-900 px-2 text-muted-foreground dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border dark:border-slate-700 bg-background dark:bg-slate-800 px-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-muted-foreground"
              >
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                CRABU only accesses your{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">Name, Email,</span>
                {" "}and{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">Photo</span>
                . No other data is accessed.
              </p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-background dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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

            <button
              onClick={handleMicrosoftLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-background dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#ffb900" d="M11 11h9v9h-9z"/>
              </svg>
              Continue with Microsoft
            </button>

            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-background dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="fill-slate-900 dark:fill-white" viewBox="0 0 24 24" width="25" height="25">
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