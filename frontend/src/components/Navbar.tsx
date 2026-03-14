// Server Component — reads Supabase session securely on the server.
// No loading flash, no client-side auth state juggling.

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "@/config/site";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary dark:text-blue-500">
          {siteConfig.brand?.logoText || siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden gap-8 md:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          <ThemeLanguageToggle />

          {user ? (
            <Link
              href="/dashboard"
              className="hidden rounded-md bg-primary-muted px-4 py-2 text-sm font-semibold text-primary transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 md:block"
            >
              👋 {firstName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 md:block"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}