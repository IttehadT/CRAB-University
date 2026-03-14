import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-16">
        
        {/* ── TOP SECTION: App Downloads ── */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 border-b border-border pb-12 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground">Take CRAB University Anywhere</h3>
            <p className="mt-1 text-sm text-muted-foreground">Native apps are currently in active development.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {/* Apple / iOS (Disabled) */}
            <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 opacity-60 transition-opacity hover:opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M13.64 4c.48-.6.8-1.42.71-2.22-.72.04-1.6.5-2.11 1.09-.45.52-.83 1.37-.71 2.14.77.06 1.58-.45 2.11-1.01zM11.9 19.34c-1.28 0-1.87-.83-3.23-.83-1.33 0-2.02.8-3.23.83-1.63.04-3.15-1.55-4.08-2.91-1.37-2-2.34-5.69-1.4-8.2.45-1.2 1.51-1.98 2.76-2.01 1.25-.04 2.4.83 3.2.83.82 0 2.22-.98 3.73-.85 1.58.07 2.91.68 3.73 1.77-3.04 1.77-2.55 5.89.37 7.07-.74 1.9-2.07 4.31-3.85 4.3z"/></svg>
              <div className="text-left">
                <div className="text-[10px] font-medium uppercase leading-none text-muted-foreground">Coming soon to</div>
                <div className="text-sm font-bold leading-none text-foreground">App Store</div>
              </div>
            </button>

            {/* Google Play / Android (Disabled) */}
            <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 opacity-60 transition-opacity hover:opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.73 2.05A2.32 2.32 0 003 3.9v16.2c0 .76.28 1.43.73 1.85l.13.13 9.14-9.14v-.28L3.86 1.92l-.13.13zM13.43 13.2L17.3 17.07l2.45-1.4c1.4-.8 1.4-2.1 0-2.9l-2.45-1.4-3.87 3.83zM13.43 10.8L3.92 1.28 2.65 2.55l8.52 8.52 2.26-2.27zM3.92 22.72l9.51-9.52-2.26-2.27-8.52 8.52 1.27 1.27z"/></svg>
              <div className="text-left">
                <div className="text-[10px] font-medium uppercase leading-none text-muted-foreground">Coming soon to</div>
                <div className="text-sm font-bold leading-none text-foreground">Google Play</div>
              </div>
            </button>

            {/* Windows (Disabled) */}
            <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 opacity-60 transition-opacity hover:opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801"/></svg>
              <div className="text-left">
                <div className="text-[10px] font-medium uppercase leading-none text-muted-foreground">Coming soon for</div>
                <div className="text-sm font-bold leading-none text-foreground">Windows</div>
              </div>
            </button>
          </div>
        </div>

        {/* ── BOTTOM SECTION: Grid Links ── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Column 1: Brand & Project Info */}
          <div className="md:col-span-1">
            <div className="mb-4 text-2xl font-bold text-primary">
              {siteConfig.brand.logoText}
            </div>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.brand.description} Built for students, by students.
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.links.projectGithub} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition hover:text-primary" aria-label="Project GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <Link href={siteConfig.links.projectGuidelines} className="text-muted-foreground transition hover:text-primary" aria-label="Project Guidelines">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Tools */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Platform Utilities
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard/bug" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
                  <span>🐛</span> Report a Bug
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developer" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
                  <span>👨‍💻</span> Developer Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
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
                <Link href="/privacy" className="text-sm text-muted-foreground transition hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href={siteConfig.links.bracu} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition hover:text-primary">
                  BRAC University ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect with the Developer */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Meet the Developer
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Built with ❤️ by <span className="font-semibold text-foreground">{siteConfig.developer.name}</span>.
            </p>
            <div className="flex gap-3">
              <a href={siteConfig.developer.github} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href={siteConfig.developer.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href={siteConfig.developer.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href={siteConfig.developer.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
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