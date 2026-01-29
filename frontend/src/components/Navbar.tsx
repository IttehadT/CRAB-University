"use client"; // <--- This is REQUIRED for buttons to work!

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // State to track if menu is open

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* 1. Logo */}
          <Link href="/" className="text-xl font-bold text-blue-700">
            {siteConfig.logo.text}
          </Link>

          {/* 2. Desktop Menu (Hidden on Mobile) */}
          <div className="hidden gap-8 md:flex">
            {siteConfig.navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 3. Login Button (Desktop) */}
          <div className="hidden md:block">
            <Link 
              href="/dashboard"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Login
            </Link>
          </div>

          {/* 4. Mobile Hamburger Button (Visible ONLY on Mobile) */}
          <button 
            className="text-slate-700 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Show X if open, Hamburger if closed */}
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>

        {/* 5. Mobile Menu Dropdown (Conditionally Rendered) */}
        {isOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {siteConfig.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-slate-600 hover:text-blue-600"
                  onClick={() => setIsOpen(false)} // Close menu when clicked
                >
                  {item.label}
                </Link>
              ))}
              <hr />
              <Link 
                href="/dashboard"
                className="block text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                onClick={() => setIsOpen(false)}
              >
                Login to Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}