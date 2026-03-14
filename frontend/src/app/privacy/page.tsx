"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

const sections = [
  {
    id: "overview",
    title: "Overview",
    icon: "🦀",
    content: `CRAB University (CRABU) is a student portal built to make academic life easier — not to harvest your data. This policy explains clearly and honestly what we collect, why we collect it, and what we never do with it. We are a university student project, not a corporation. Your trust matters to us.`,
  },
  {
    id: "what-we-collect",
    title: "What We Collect",
    icon: "📋",
    items: [
      { label: "Name & Email", detail: "Collected when you sign up or log in via Google, Microsoft, GitHub, or email. Used to identify your account and display your profile." },
      { label: "Profile Avatar", detail: "Either your OAuth provider's photo, or a generated initial-based avatar via ui-avatars.com. Never uploaded or stored by us directly." },
      { label: "Academic Data You Enter", detail: "Grades, schedules, and CGPA inputs you manually provide inside the portal. Stored securely in your personal account only." },
      { label: "Session Cookies", detail: "HTTP-only cookies used to keep you logged in securely across pages. These are never readable by JavaScript and expire when you sign out." },
    ],
  },
  {
    id: "what-we-dont",
    title: "What We Never Do",
    icon: "🚫",
    items: [
      { label: "We never sell your data", detail: "To anyone. Ever. Full stop." },
      { label: "We never access your Gmail, Drive, or calendar", detail: "OAuth is used only to confirm your identity and retrieve your name and email address." },
      { label: "We never run ads", detail: "CRABU has no ad network, no tracking pixels, and no third-party marketing integrations." },
      { label: "We never share your data with third parties", detail: "Your data is only used to power features you interact with inside the portal." },
    ],
  },
  {
    id: "oauth",
    title: "Google, Microsoft & GitHub Sign-In",
    icon: "🔐",
    content: `When you choose "Continue with Google" (or Microsoft / GitHub), you are redirected to that provider's secure login page. CRABU only requests access to your basic profile: name and email address. We do not request access to your emails, files, contacts, calendar, or any other services. The permission prompt you see is standard OAuth behaviour — it is Google/Microsoft/GitHub confirming your identity on our behalf, not us gaining broad access to your account.`,
  },
  {
    id: "storage",
    title: "Data Storage & Security",
    icon: "🔒",
    content: `All data is stored in Supabase, a PostgreSQL-based platform with enterprise-grade security. Your session is managed via HTTP-only secure cookies, meaning it cannot be accessed by browser scripts or extensions. Passwords (for email sign-ups) are hashed and never stored in plain text. We use Vercel for hosting, which provides HTTPS encryption on all connections.`,
  },
  {
    id: "ai-mentor",
    title: "AI Mentor Conversations",
    icon: "🤖",
    content: `The AI Mentor feature uses Retrieval-Augmented Generation (RAG) to answer academic questions. Conversations may be temporarily processed to generate responses but are not used to train AI models, are not shared with third parties, and are not permanently stored beyond your session unless you explicitly save them. The AI is powered by university handbook data — not your personal information.`,
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: "✅",
    items: [
      { label: "Access", detail: "You can view all data associated with your account inside the portal at any time." },
      { label: "Deletion", detail: "You can request full account and data deletion by contacting us. We will process it within 7 days." },
      { label: "Correction", detail: "You can update your name and profile information from your dashboard." },
      { label: "Portability", detail: "You can request an export of your stored academic data at any time." },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "📬",
    content: `If you have any questions, concerns, or requests regarding your privacy, please reach out. CRABU is maintained by a student development team at BRAC University. We take all privacy concerns seriously and will respond promptly.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors">

      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            {siteConfig.brand.logoText}
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-80"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="border-b border-border bg-card transition-colors">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Legal
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Plain English. No legalese. Here is exactly what CRABU does — and
            doesn&apos;t do — with your data.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Last updated:{" "}
            <span className="font-medium text-foreground">March 2026</span>
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* Sidebar TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Contents
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <span>{s.icon}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Main sections */}
          <main className="space-y-12">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-card p-8 shadow-sm transition-colors"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-xl">
                    {s.icon}
                  </span>
                  <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
                </div>

                {s.content && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.content}</p>
                )}

                {s.items && (
                  <ul className="mt-2 space-y-4">
                    {s.items.map((item) => (
                      <li key={item.label} className="flex gap-3">
                        <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-primary-muted flex items-center justify-center">
                          <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Footer note */}
            <div className="rounded-2xl border border-primary-muted bg-primary-muted/50 p-6 text-center">
              <p className="text-sm text-primary">
                Questions? Email the CRABU dev team or open an issue on GitHub.
                We&apos;re students too — we get it.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                Back to Home
              </Link>
            </div>
          </main>
        </div>
      </div>

      
    </div>
  );
}