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
    <div className="min-h-screen bg-slate-50">
      
      {/* The Sidebar (Passes the state down) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeMobileMenu={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="transition-all md:ml-64">
        
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
          
          <span className="font-bold text-blue-700">
            {siteConfig.logo.text}
          </span>

          {/* The Hamburger Button */}
          <button 
            onClick={() => {
              console.log("Button Clicked!"); // Check your browser console
              setIsSidebarOpen(true);
            }}
            className="rounded p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
          >
            {/* Hamburger Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}