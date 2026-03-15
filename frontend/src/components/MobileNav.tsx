"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function MobileNav({ user, firstName }: { user: any; firstName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-16 w-full animate-in slide-in-from-top-2 border-b border-border bg-background p-4 shadow-xl">
          <nav className="flex flex-col gap-4">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-border" />
            {user ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-blue-700">
                Dashboard (👋 {firstName})
              </Link>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-blue-700">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}