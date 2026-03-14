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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          {siteConfig.brand?.logoText || siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden gap-8 md:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
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
              className="hidden rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 md:block"
            >
              👋 {firstName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 md:block"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}