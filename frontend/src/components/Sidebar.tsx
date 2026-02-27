"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  closeMobileMenu: () => void;
}

export function Sidebar({ isOpen, closeMobileMenu }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // State to hold the logged-in user's email
  // State to hold the logged-in user's profile data
  const [userProfile, setUserProfile] = useState({ name: "Loading...", avatar: "" });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fallback logic: If they don't have a name (old accounts), use the first part of their email
        const rawName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Student";
        // Fallback logic: If they don't have a Google avatar, generate a blue initials avatar
        const rawAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=2563eb&color=fff`;
        
        setUserProfile({
          name: rawName,
          avatar: rawAvatar
        });
      }
    };
    getUser();
  }, [supabase]);

  // Secure Sign Out function
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Send them back to the gate
    router.refresh();      // Force Next.js to clear its cache
  };

  const activeFeatures = siteConfig.dashboardFeatures.filter(feature => feature.is_enabled);

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={closeMobileMenu}
      />

      <aside 
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/" className="text-xl font-bold text-blue-700">
            {siteConfig.brand.logoText}
          </Link>
          <button onClick={closeMobileMenu} className="text-slate-500 hover:text-red-500 md:hidden">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4 overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
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
                {link.is_beta && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700">
                    BETA
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* UPDATED: Dynamic User Profile & Sign Out Button */}
        {/* UPDATED: Dynamic User Profile & Sign Out Button */}
        <div className="absolute bottom-0 w-full border-t border-slate-200 p-4 bg-white flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 overflow-hidden">
            
            {/* Display the Avatar Picture */}
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="h-10 w-10 flex-shrink-0 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Display the Full Name */}
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 truncate" title={userProfile.name}>
                {userProfile.name}
              </p>
              <p className="text-xs text-slate-500">Student</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}