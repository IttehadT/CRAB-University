import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

function Footer() {
  // We grab the first 3 categories to display as columns in the footer
  const footerCategories = siteConfig.sidebarCategories.slice(0, 3);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="mb-3 text-2xl font-bold text-primary">
              {siteConfig.brand.logoText}
            </div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.brand.description} Built for students, by students, at BRAC University.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Platform is Live
            </span>
          </div>

          {/* Dynamic Platform Links */}
          {footerCategories.map((category, idx) => (
            <div key={idx}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {category.title}
              </h4>
              <ul className="space-y-2.5">
                {category.items
                  // Don't show fully disabled items in the public footer to save space
                  .filter(item => !item.isDisabled) 
                  .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
                    >
                      <span>{link.icon}</span>
                      {link.label}
                      {link.isBeta && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">BETA</span>}
                      {link.isNew && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">NEW</span>}
                      {link.isAi && <span className="text-xs">✨</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

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