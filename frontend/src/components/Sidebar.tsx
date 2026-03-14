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
  
  const [userProfile, setUserProfile] = useState({ name: "Loading...", avatar: "" });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const rawName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Student";
        const rawAvatar = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=2563eb&color=fff`;
        
        setUserProfile({ name: rawName, avatar: rawAvatar });
      }
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const activeFeatures = siteConfig.dashboardFeatures.filter(feature => feature.is_enabled);

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={closeMobileMenu}
      />

      <aside 
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border dark:border-slate-800 bg-card dark:bg-slate-900 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border dark:border-slate-800 px-6">
          <Link href="/" className="text-xl font-bold text-primary dark:text-blue-500">
            {siteConfig.brand.logoText}
          </Link>
          <button onClick={closeMobileMenu} className="text-muted-foreground dark:text-slate-400 hover:text-red-500 md:hidden">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto p-4 flex-1 scrollbar-hide">
          {activeFeatures.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-muted text-primary dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-muted-foreground hover:bg-background hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </div>
                {link.is_beta && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-500">
                    BETA
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto shrink-0 w-full border-t border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-lg bg-background dark:bg-slate-800 p-3 overflow-hidden">
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="h-10 w-10 shrink-0 rounded-full border border-border dark:border-slate-700 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=2563eb&color=fff`;
                }}
              />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary dark:text-blue-400 font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="truncate">
              <p className="text-sm font-semibold text-foreground dark:text-slate-100 truncate" title={userProfile.name}>
                {userProfile.name}
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Student</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full rounded-md border border-border dark:border-slate-700 bg-card dark:bg-slate-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}