import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "@/config/site";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import { MobileNav } from "@/components/MobileNav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Robust Profile & Avatar Extraction
  const rawName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const firstName = rawName.split(" ")[0];
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=2563eb&color=fff`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-500">
          {siteConfig.brand?.logoText || siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden gap-8 md:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          <ThemeLanguageToggle />

          {/* Desktop User CTA */}
          {user ? (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400 md:flex"
            >
              <img 
                src={avatar} 
                alt="Profile" 
                className="h-6 w-6 rounded-full border border-blue-200 object-cover dark:border-blue-800"
              />
              <span>{firstName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 md:block"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Interactive Menu */}
          <MobileNav user={user} firstName={firstName} fullName={rawName} avatar={avatar} />
        </div>
        
      </div>
    </header>
  );
}