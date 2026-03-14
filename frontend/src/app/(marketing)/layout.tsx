import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

function Footer() {
  // Extract all active features that have the isFooter flag set to true
  const footerFeatures = siteConfig.sidebarCategories
    .flatMap(category => category.items)
    .filter(feature => !feature.isDisabled && feature.isFooter);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">

          {/* Column 1 & 2: Brand Information */}
          <div className="md:col-span-2">
            <div className="mb-4 text-2xl font-bold text-primary">
              {siteConfig.brand.logoText}
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.brand.description} Built for students, by students, at BRAC University.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Platform is Live
            </span>
          </div>

          {/* Column 3: Platform Tools (Filtered from Config) */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Platform Tools
            </h4>
            <ul className="space-y-3">
              {footerFeatures.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                    {link.isBeta && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">BETA</span>}
                    {link.isNew && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">NEW</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support & Community (Mandatory) */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard/bug" className="text-sm text-muted-foreground transition hover:text-primary">
                  Report a Bug 🐛
                </Link>
              </li>
              <li>
                <Link href="/dashboard/developer" className="text-sm text-muted-foreground transition hover:text-primary">
                  Developer Profile 👨‍💻
                </Link>
              </li>
              <li>
                <a href={siteConfig.links.usis} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition hover:text-primary">
                  BRACU USIS ↗
                </a>
              </li>
              <li>
                <a href={siteConfig.links.bracu} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition hover:text-primary">
                  BRAC University ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal (Mandatory) */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Legal
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
            </ul>
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