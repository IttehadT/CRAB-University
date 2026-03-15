import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

// ── App Store Download Badges ─────────────────────────────────────────────────
function AppStoreSection() {
  return (
    <div className="border-b border-border">
      <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold text-foreground">Take CRAB University Anywhere</p>
          <p className="mt-1 text-xs text-muted-foreground">Native apps are currently in active development.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* App Store */}
          <a
            href="#"
            aria-label="Download on App Store"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition hover:border-blue-300 hover:shadow-sm dark:hover:border-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0 text-foreground">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
            </svg>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Coming Soon To</p>
              <p className="text-xs font-bold text-foreground">App Store</p>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="#"
            aria-label="Get it on Google Play"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition hover:border-blue-300 hover:shadow-sm dark:hover:border-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0 text-foreground">
              <path d="M3.18 23.76C3.06 23.68 3 23.54 3 23.38V0.62C3 0.46 3.06 0.32 3.18 0.24L3.22 0.2L12.76 9.74V9.84L3.22 19.38L3.18 23.76Z" fill="#00D2FF"/>
              <path d="M15.96 13.02L12.76 9.84V9.74L15.96 6.56L16 6.58L19.84 8.78C20.94 9.4 20.94 10.42 19.84 11.04L16 13.24L15.96 13.02Z" fill="#FFD700"/>
              <path d="M16 13.24L12.76 9.84L3.18 19.38C3.54 19.76 4.14 19.8 4.8 19.42L16 13.24Z" fill="#FF3D00"/>
              <path d="M16 6.58L4.8 0.4C4.14 0.02 3.54 0.06 3.18 0.44L12.76 9.74L16 6.58Z" fill="#00E676"/>
            </svg>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Coming Soon To</p>
              <p className="text-xs font-bold text-foreground">Google Play</p>
            </div>
          </a>

          {/* Windows */}
          <a
            href="#"
            aria-label="Get it for Windows"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition hover:border-blue-300 hover:shadow-sm dark:hover:border-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 shrink-0">
              <path fill="#0078D4" d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6H9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Coming Soon For</p>
              <p className="text-xs font-bold text-foreground">Windows</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  // Correctly mapping to our single source of truth (siteConfig.ts)
  const projectGithub = siteConfig.links?.projectGithub || "#";
  const bracu         = siteConfig.links?.bracu || "https://www.bracu.ac.bd";
  const devPortfolio  = siteConfig.developer?.github || "#"; // Defaulting to github as portfolio until added to config
  const devGithub     = siteConfig.developer?.github || "#";
  const devLinkedin   = siteConfig.developer?.linkedin || "#";
  const devFacebook   = siteConfig.developer?.facebook || "#";
  const devYoutube    = siteConfig.developer?.youtube || "#";

  return (
    <footer className="border-t border-border bg-card dark:bg-slate-950">

      {/* App store badges */}
      <AppStoreSection />

      {/* Main grid */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

          {/* ── Col 1: Brand + GitHub + Actions ── */}
          <div className="md:col-span-5">
            <div className="mb-3 text-2xl font-bold text-blue-600 dark:text-blue-500">
              {siteConfig.brand.logoText}
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.brand?.description} Built for students, by students.
            </p>

            {/* GitHub row */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-foreground">View Source Code:</span>
              <a href={projectGithub} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground transition hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href={projectGithub} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Star <span className="border-l border-border pl-2 text-muted-foreground">1.2k</span>
              </a>
            </div>

            {/* Community buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href="#" className="rounded-lg bg-emerald-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600 hover:-translate-y-0.5">
                Join Community
              </Link>
              <Link href="#" className="rounded-lg bg-blue-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600 hover:-translate-y-0.5">
                Access to Beta
              </Link>
            </div>
          </div>

          {/* ── Col 2: Platform + Legal ── */}
          <div className="grid grid-cols-2 gap-8 md:col-span-4">
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Platform Utilities</h4>
              <ul className="space-y-3.5">
                <li><Link href="/dashboard/bug" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400"><span>🐛</span> Report a Bug</Link></li>
                <li><Link href="/dashboard/developer" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400"><span>👨‍💻</span> Developer Profile</Link></li>
                <li><Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400"><span>🔐</span> Student Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Legal & Resources</h4>
              <ul className="space-y-3.5">
                <li><Link href="/privacy" className="text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">Terms & Conditions</Link></li>
                <li><a href={bracu} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">BRAC University ↗</a></li>
              </ul>
            </div>
          </div>

          {/* ── Col 3: Developer ── */}
          <div className="md:col-span-3">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Meet the Developer</h4>

            <div className="mb-6 flex flex-wrap gap-2">
              {[
                { href: devPortfolio, label: "Portfolio", icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
                { href: devGithub, label: "GitHub", icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> },
                { href: devLinkedin, label: "LinkedIn", icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> },
                { href: devFacebook, label: "Facebook", icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> },
                { href: devYoutube, label: "YouTube", icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-400">
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="mb-1 text-xs text-muted-foreground">Contact Support</p>
              <a href="mailto:support@crabu.app" className="block text-sm font-semibold text-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                support@crabu.app
              </a>
              <a href="mailto:support@crabu.app" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600">
                Get in Touch →
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer />
    </>
  );
}