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

  // ── UI INTERACTIVITY STATES ──
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    // Default all categories to open when the app first loads
    const initialState: Record<string, boolean> = {};
    siteConfig.sidebarCategories.forEach(c => initialState[c.title] = true);
    return initialState;
  });

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

  // ── TOGGLE LOGIC ──
  const toggleCategory = (title: string) => {
    // If user clicks a category while sidebar is closed, instantly open the sidebar
    if (isCollapsed) setIsCollapsed(false); 
    setOpenCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={closeMobileMenu}
      />

      <aside className={`fixed left-0 top-0 z-40 flex h-screen ${isCollapsed ? 'w-20' : 'w-72'} flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* ── HEADER ── */}
        <div className={`flex h-16 shrink-0 items-center border-b border-border px-4 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="text-xl font-bold text-primary truncate">
              {siteConfig.brand.logoText}
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="text-xl font-bold text-primary">
              🦀
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary md:block"
            >
              {isCollapsed ? (
                // Expand Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
              ) : (
                // Collapse Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>
              )}
            </button>
            <button onClick={closeMobileMenu} className="text-muted-foreground hover:text-red-500 md:hidden">✕</button>
          </div>
        </div>

        {/* ── SCROLLABLE ACCORDION MENU ── */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-3 scrollbar-hide">
          {siteConfig.sidebarCategories.map((category, catIndex) => (
            <div key={catIndex}>
              
              {/* Category Header (Clickable) */}
              <div 
                onClick={() => toggleCategory(category.title)}
                className={`mb-1 flex cursor-pointer items-center text-xs font-bold uppercase tracking-wider text-muted-foreground/70 transition hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}
              >
                {!isCollapsed && <span>{category.title}</span>}
                {isCollapsed ? (
                  <span className="text-[10px] opacity-50">• • •</span>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                    className={`h-3 w-3 transition-transform duration-200 ${openCategories[category.title] ? 'rotate-180' : 'rotate-0'}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </div>

              {/* Category Links (Expandable) */}
              <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${openCategories[category.title] || isCollapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {category.items.map((link) => {
                  const isActive = pathname === link.href;
                  
                  const isAiStyling = link.isAi ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300" : "border border-transparent";
                  const disabledStyling = link.isDisabled ? "opacity-50 pointer-events-none grayscale" : "hover:bg-muted";
                  const activeStyling = isActive && !link.isAi ? "bg-primary/10 text-primary font-bold" : "text-card-foreground";

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { if (window.innerWidth < 768) closeMobileMenu(); }}
                      title={isCollapsed ? link.label : undefined}
                      className={`flex items-center rounded-lg py-2.5 transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} ${isAiStyling} ${disabledStyling} ${activeStyling}`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                        <span className="text-xl">{link.icon}</span>
                        {!isCollapsed && <span className="truncate">{link.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1 shrink-0">
                          {link.isAi && <span className="text-xs">✨</span>}
                          {link.isBeta && !link.isDisabled && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">BETA</span>}
                          {link.isNew && !link.isDisabled && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">NEW</span>}
                          {link.isDisabled && <span className="text-xs opacity-50">🔒</span>}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── PROFILE & SIGN OUT ── */}
        {/* Notice the pb-8 (Padding Bottom) here. This creates safe space for the Copyright bar to slide under! */}
        <div className="shrink-0 border-t border-border bg-card p-3 flex flex-col gap-2 pb-8">
          <div className={`flex items-center rounded-lg bg-muted p-2 overflow-hidden ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="h-9 w-9 flex-shrink-0 rounded-full border border-border object-cover" />
            ) : (
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-sm font-semibold text-card-foreground truncate">{userProfile.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Student</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleSignOut} 
            title={isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center justify-center rounded-md border border-border bg-card py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 ${isCollapsed ? 'px-0' : 'px-4'}`}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            ) : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}