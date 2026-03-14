import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-border bg-card dark:bg-slate-950">
      <div className="container mx-auto px-4 py-16">
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

          {/* ── LEFT COLUMN: Brand, Source Code, & Actions (Spans 5 columns) ── */}
          <div className="md:col-span-5">
            {/* 1. Inline Brand */}
            <div className="mb-3 flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-500">
              🦀 CRAB University
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.brand.description} Built for students, by students.
            </p>

            {/* 2. Source Code & Star Button */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-foreground">View Source Code:</span>
              <a href={siteConfig.links.projectGithub} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition hover:text-foreground" aria-label="GitHub Repository">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href={siteConfig.links.projectGithub} target="_blank" rel="noopener noreferrer" className="flex items-center rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Star <span className="ml-2 border-l border-border pl-2">1.2k</span>
              </a>
            </div>

            {/* 3. Community Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="#" className="rounded-md bg-emerald-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600">
                Join Community
              </Link>
              <Link href="#" className="rounded-md bg-blue-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-blue-600">
                Apply for Membership
              </Link>
            </div>
          </div>

          {/* ── MIDDLE COLUMNS: Utilities & Legal (Spans 4 columns) ── */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            {/* Column 2: Quick Tools */}
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Platform Utilities
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard/bug" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    <span>🐛</span> Report a Bug
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/developer" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    <span>👨‍💻</span> Developer Profile
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    <span>🔐</span> Student Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Resources */}
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Legal & Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <a href={siteConfig.links.bracu} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                    BRAC University ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Meet the Developer & Contact (Spans 3 columns) ── */}
          <div className="md:col-span-3">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Meet the Developer
            </h4>

            <div className="mb-8 flex gap-3">
              {/* Portfolio Briefcase Icon (First) */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2.5 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Portfolio">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </a>
              {/* GitHub */}
              <a href={siteConfig.developer.github} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2.5 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              {/* LinkedIn */}
              <a href={siteConfig.developer.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2.5 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              {/* Facebook */}
              <a href={siteConfig.developer.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2.5 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              {/* YouTube */}
              <a href={siteConfig.developer.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2.5 text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>

            {/* Support Contact */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Contact Support:</p>
              <a href="mailto:support@crabu.app" className="text-sm font-semibold text-foreground transition hover:text-blue-600 dark:hover:text-blue-400">
                support@crabu.app
              </a>
              <a href="mailto:support@crabu.app" className="mt-4 flex w-fit items-center justify-center rounded-md bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600">
                Get in Touch
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </>
  );
}