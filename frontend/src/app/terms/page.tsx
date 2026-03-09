"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: "📜",
    content: `By accessing or using CRAB University (CRABU), you agree to be bound by these Terms of Conditions. If you do not agree with any part of these terms, you may not access the platform. CRABU is a student portal developed as a university project at BRAC University. These terms govern your use of the platform and all its features.`,
  },
  {
    id: "eligibility",
    title: "Who Can Use CRABU",
    icon: "🎓",
    items: [
      {
        label: "Current Students",
        detail: "CRABU is primarily intended for enrolled students of BRAC University. You must use your university-issued email or a valid personal account to register.",
      },
      {
        label: "Age Requirement",
        detail: "You must be at least 16 years old to use this platform. By signing up, you confirm you meet this requirement.",
      },
      {
        label: "One Account Per Person",
        detail: "You may only maintain one active account. Creating duplicate accounts to bypass restrictions is not permitted.",
      },
      {
        label: "Accurate Information",
        detail: "You agree to provide truthful information when registering. Impersonating another student or staff member is strictly prohibited.",
      },
    ],
  },
  {
    id: "account",
    title: "Your Account & Responsibilities",
    icon: "🔑",
    items: [
      {
        label: "Keep your credentials secure",
        detail: "You are responsible for maintaining the confidentiality of your password. Do not share your account with others.",
      },
      {
        label: "You are responsible for all activity",
        detail: "Any activity that occurs under your account is your responsibility, whether or not you authorised it.",
      },
      {
        label: "Report unauthorised access",
        detail: "If you suspect your account has been compromised, sign out immediately and contact the CRABU team.",
      },
      {
        label: "Account termination",
        detail: "We reserve the right to suspend or terminate accounts that violate these terms, engage in abuse, or misuse platform features.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    icon: "✅",
    content: `You agree to use CRABU only for its intended purpose: managing your academic life, accessing campus tools, and interacting with the AI Mentor for educational guidance. The following are strictly prohibited:`,
    items: [
      {
        label: "No harmful or illegal activity",
        detail: "You may not use CRABU to engage in any activity that is illegal, harmful, threatening, abusive, or harassing.",
      },
      {
        label: "No automated scraping or bots",
        detail: "Automated access, scraping, or using bots to interact with the platform without written permission is not allowed.",
      },
      {
        label: "No attempt to breach security",
        detail: "Attempting to gain unauthorised access to any part of the platform, its servers, or connected databases is prohibited.",
      },
      {
        label: "No misuse of the AI Mentor",
        detail: "The AI Mentor is designed for academic guidance. Using it to generate harmful, deceptive, or inappropriate content is a violation of these terms.",
      },
    ],
  },
  {
    id: "ai-mentor",
    title: "AI Mentor — Limitations & Disclaimer",
    icon: "🤖",
    content: `The AI Mentor is an experimental tool powered by Retrieval-Augmented Generation (RAG) using university handbooks and course catalogs. It is designed to assist — not replace — official academic advising.`,
    items: [
      {
        label: "Not a substitute for official advice",
        detail: "Always verify critical academic decisions (course registration, graduation requirements, etc.) with an official university advisor.",
      },
      {
        label: "AI can make mistakes",
        detail: "The AI Mentor may occasionally provide inaccurate or outdated information. CRABU is not liable for decisions made solely based on AI responses.",
      },
      {
        label: "Conversations are not monitored",
        detail: "We do not actively read your AI Mentor conversations. However, we reserve the right to review conversations flagged for abuse of the system.",
      },
    ],
  },
  {
    id: "academic-data",
    title: "Academic Data You Enter",
    icon: "📊",
    content: `Grades, schedules, and CGPA data you enter into CRABU are stored securely and associated only with your account. This data is never shared with BRAC University administration, other students, or third parties. It exists solely to power the tools you use. You own your data and can request deletion at any time.`,
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: "💡",
    items: [
      {
        label: "CRABU platform",
        detail: "The CRABU codebase, design, and features are the intellectual property of the CRABU development team. You may not copy, redistribute, or commercialise any part of the platform.",
      },
      {
        label: "University content",
        detail: "Course catalogs, handbooks, and other university materials used by the AI Mentor remain the property of BRAC University.",
      },
      {
        label: "Your content",
        detail: "Any data you enter (grades, notes, schedules) remains yours. By submitting it, you grant CRABU a limited licence to store and display it back to you.",
      },
    ],
  },
  {
    id: "availability",
    title: "Platform Availability",
    icon: "⚡",
    content: `CRABU is provided as-is. As a student project, we strive for reliability but cannot guarantee 100% uptime. We reserve the right to take the platform down for maintenance, updates, or other operational reasons without prior notice. We are not liable for any inconvenience caused by downtime, especially during exam periods — please do not rely solely on CRABU for critical academic deadlines.`,
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    icon: "🔄",
    content: `We may update these Terms of Conditions from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of CRABU after changes are posted constitutes your acceptance of the new terms. For significant changes, we will try to notify users via the platform dashboard.`,
  },
  {
    id: "contact",
    title: "Questions & Contact",
    icon: "📬",
    content: `If you have any questions about these Terms of Conditions or wish to report a violation, please reach out to the CRABU development team. We are fellow students and take all concerns seriously. We will do our best to respond within a reasonable timeframe.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
            Legal
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Terms of Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500">
            The rules of the road for using CRABU. Written to be read, not ignored.
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Last updated:{" "}
            <span className="font-medium text-slate-600">March 2026</span>
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* Sidebar TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Contents
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <span>{s.icon}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Main sections */}
          <main className="space-y-8">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    {s.icon}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
                </div>

                {s.content && (
                  <p className="text-sm leading-relaxed text-slate-600 mb-4">{s.content}</p>
                )}

                {s.items && (
                  <ul className="space-y-4">
                    {s.items.map((item) => (
                      <li key={item.label} className="flex gap-3">
                        <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="block h-1.5 w-1.5 rounded-full bg-blue-600" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Agreement banner */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    By using CRABU, you agree to these terms.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Also read our{" "}
                    <Link href="/privacy" className="font-semibold underline hover:text-blue-800">
                      Privacy Policy
                    </Link>{" "}
                    to understand how we handle your data.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="flex-shrink-0 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  Sign In to CRABU →
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {siteConfig.brand.name} · Built with ❤️ at BRAC University ·{" "}
        <Link href="/privacy" className="underline hover:text-slate-600 mr-3">
          Privacy Policy
        </Link>
        <Link href="/terms" className="underline hover:text-slate-600">
          Terms of Conditions
        </Link>
      </footer>
    </div>
  );
}
