"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeLanguageToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"en" | "bn">("en");

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  
  if (!mounted) {
    return <div className="h-[42px] w-[116px] animate-pulse rounded-full bg-muted shadow-sm"></div>;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm transition-colors duration-300">

      {/* ── Dark Mode Toggle ── */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle dark mode"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.59-1.59a.75.75 0 00-1.06-1.061l-1.59 1.59z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-700 dark:text-slate-300">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* ── Divider ── */}
      <div className="h-4 w-px bg-border" />

      {/* ── Language Toggle ── */}
      <button
        onClick={() => setLanguage(language === "en" ? "bn" : "en")}
        aria-label="Toggle language"
        className="flex h-8 items-center gap-0.5 rounded-full px-2.5 text-xs font-semibold transition hover:bg-muted"
      >
        <span className={language === "en" ? "text-primary" : "text-muted-foreground"}>
          EN
        </span>
        <span className="mx-0.5 text-muted-foreground/40">/</span>
        <span className={language === "bn" ? "text-primary" : "text-muted-foreground"}>
          বাং
        </span>
      </button>

    </div>
  );
}