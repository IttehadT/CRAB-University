"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const dashboardLinks = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Class Schedule", href: "/dashboard/schedule", icon: "📅" },
  { label: "Advising Panel", href: "/dashboard/advising", icon: "🎓" },
  { label: "Grade Sheet", href: "/dashboard/grades", icon: "📊" },
  { label: "Bus Tracker", href: "/dashboard/bus", icon: "🚌" },
  { label: "AI Mentor", href: "/chat", icon: "🤖" },
];

interface SidebarProps {
  isOpen: boolean;           // <--- It expects this signal
  closeMobileMenu: () => void; // <--- It expects this command
}

export function Sidebar({ isOpen, closeMobileMenu }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Dark Overlay (Click to close) */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={closeMobileMenu}
      />

      {/* The Sidebar Itself */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/" className="text-xl font-bold text-blue-700">
            {siteConfig.logo.text}
          </Link>
          {/* Close Button (X) */}
          <button 
            onClick={closeMobileMenu} 
            className="text-slate-500 hover:text-red-500 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-1 p-4">
          {dashboardLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu} // Close menu when clicking a link
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 w-full border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">User Name</p>
              <p className="text-xs text-slate-500">Student ID: 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}