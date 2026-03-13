import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="mb-3 text-2xl font-bold text-blue-700 dark:text-blue-500">
              {siteConfig.brand.logoText}
            </div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {siteConfig.brand.description} Built for students, by students, at BRAC University.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Live & Active
            </span>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.dashboardFeatures.map((feature) => (
                <li key={feature.href}>
                  <Link
                    href={feature.href}
                    className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <span>{feature.icon}</span>
                    {feature.label}
                    {feature.is_beta && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-400">
                        BETA
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & University */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  Terms of Conditions
                </Link>
              </li>
            </ul>

            <h4 className="mb-4 mt-8 text-xs font-bold uppercase tracking-widest text-slate-400">
              University
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={siteConfig.links.bracu} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  BRAC University ↗
                </a>
              </li>
              <li>
                <a href={siteConfig.links.usis} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                  USIS Portal ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Note: Bottom Bar was removed because it is now securely handled by GlobalCopyright in RootLayout */}
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