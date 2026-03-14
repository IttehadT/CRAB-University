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
    // The flex container is the secret to stopping the desktop overlap
    <div className="flex min-h-screen w-full bg-background transition-colors">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeMobileMenu={() => setIsSidebarOpen(false)} 
      />

      {/* flex-1 and min-w-0 ensure the content sits cleanly next to the sticky sidebar */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        
        {/* Mobile Header (Hamburger Menu) - Hidden on Desktop */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden transition-colors">
          <span className="font-bold text-primary">
            {siteConfig.brand.logoText}
          </span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded p-2 text-muted-foreground hover:bg-muted transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
        
      </main>
    </div>
  );
}