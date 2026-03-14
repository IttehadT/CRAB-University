"use client";

import { Sidebar } from "@/components/Sidebar";
import { siteConfig } from "@/config/site";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background dark:bg-slate-950 transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeMobileMenu={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col w-full min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-card dark:bg-slate-900 border-b border-border dark:border-slate-800 px-4 md:hidden transition-colors">
          <span className="font-bold text-primary dark:text-blue-500">
            {siteConfig.brand.logoText}
          </span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded p-2 text-muted-foreground hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}