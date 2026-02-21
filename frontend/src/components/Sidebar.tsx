"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

interface SidebarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

export function Sidebar({ isOpen, closeMobileMenu }: SidebarProps) {
  const pathname = usePathname();

  // Filter out any features that you disabled in the control center
  const activeFeatures = siteConfig.dashboardFeatures.filter(feature => feature.is_enabled);

  return (
    <>
      {/* Dark Overlay for Mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header (Using Central Name) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/" className="text-xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </Link>
          <button onClick={closeMobileMenu} className="text-slate-500 hover:text-red-500 md:hidden">
            ✕
          </button>
        </div>

        {/* Dynamic Links */}
        <div className="flex flex-col gap-1 p-4 overflow-y-auto">
          {activeFeatures.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </div>
                
                {/* AUTOMATIC BETA BADGE */}
                {link.is_beta && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700">
                    BETA
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="absolute bottom-0 w-full border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">User Name</p>
              <p className="text-xs text-slate-500">Student ID: 23201642</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}