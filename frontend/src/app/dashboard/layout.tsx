"use client";

import { Sidebar } from "@/components/Sidebar";
import { siteConfig } from "@/config/site";
import { useState, useEffect, useTransition } from "react";
import { Menu, Bell, Moon, Sun, LogOut, LogIn, X, Trash2, CheckCircle, Mail, MessageCircle, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// Import the actions for the global notification bell
import { getNotificationsAction, markNotificationsReadAction, deleteNotificationAction, acceptSwapAction } from "./(features)/swap/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Auth, Profile & Theme State
  const [userProfile, setUserProfile] = useState({ name: "Loading...", initial: "...", email: "" });
  const [isDark, setIsDark] = useState(false);
  
  // Global Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast, ToastComponent } = useToast();

  const supabase = createClient();
  const router = useRouter();

  // Initialize Theme & User Data
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const initGlobalData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || "Student";
        const firstName = fullName.split(" ")[0].toUpperCase();
        const email = user.email || "";
        setUserProfile({ name: firstName, initial: firstName.charAt(0), email });

        // Fetch notifications globally
        const res = await getNotificationsAction(email);
        if (res.success) setNotifications(res.data || []);
      } else {
        setUserProfile({ name: "GUEST", initial: "G", email: "" });
      }
    };
    initGlobalData();
  }, [supabase]);

  // Handle Theme Toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Handle Auth
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Handle Notifications
  const handleDeleteNotification = (requestId: string) => {
    startTransition(async () => {
      const res = await deleteNotificationAction(requestId);
      if (res.success) {
        setNotifications(notifications.filter(n => n.id !== requestId));
        showToast("Notification deleted", "success");
      }
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    startTransition(async () => {
      const res = await acceptSwapAction(requestId);
      if (res.success) {
        showToast("Swap Accepted!", "success");
        const notifRes = await getNotificationsAction(userProfile.email);
        if (notifRes.success) setNotifications(notifRes.data || []);
      }
    });
  };

  // Calculate Unread Notifications
  const visibleNotifs = notifications.filter((notif: any) => {
    const isIncoming = notif.receiver_email === userProfile.email;
    if (!isIncoming && notif.status === 'PENDING') return false; 
    return true;
  });
  
  const unreadNotifsCount = visibleNotifs.filter((n: any) => {
    if (n.receiver_email === userProfile.email && n.status === 'PENDING') return true; 
    if (n.sender_email === userProfile.email && n.status !== 'PENDING' && !n.is_read) return true; 
    return false;
  }).length;

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors">
      
      <Sidebar isOpen={isSidebarOpen} closeMobileMenu={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col w-full min-w-0 relative">
        
        {/* ── GLOBAL DASHBOARD HEADER ── */}
        <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between bg-card/80 backdrop-blur-md px-4 md:px-8 transition-colors border-b border-border/50">
          
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-bold text-primary truncate text-lg">
              {siteConfig.brand.shortName}
            </span>
          </div>

          <div className="hidden md:block flex-1"></div>

          {/* Right Side Tools (SCALED DOWN SIZES) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. Theme & Language Toggle Pill (h-9) */}
            <button onClick={toggleTheme} className="flex h-8 items-center gap-2.5 rounded-full border border-border bg-card px-3.5 shadow-sm transition-colors hover:bg-muted">
              {isDark ? <Sun className="h-3 w-3 text-slate-500" /> : <Moon className="h-3 w-3 text-slate-500" />}
              {/* <span className="h-3.5 w-px bg-border"></span> */}
              {/* <span className="text-xs font-bold text-slate-500">EN</span> */}
            </button>

            {/* 2. Notification Bell (Rounded Square h-9 w-9) */}
            <button 
              onClick={() => {
                setIsNotificationsOpen(true);
                if (unreadNotifsCount > 0) {
                  startTransition(async () => {
                    await markNotificationsReadAction(userProfile.email);
                    setNotifications(notifications.map(n => 
                      n.sender_email === userProfile.email ? { ...n, is_read: 1 } : n
                    ));
                  });
                }
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-card shadow-sm transition-colors hover:bg-muted"
            >
              <Bell className="h-[18px] w-[18px] text-slate-700 dark:text-slate-300" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3B30] text-[9px] font-bold text-white shadow-sm ring-2 ring-card">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* 3. User Profile Pill (h-9) */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-9 items-center gap-2 rounded-full bg-[#EFF6FF] dark:bg-blue-900/30 py-1 pl-1 pr-3.5 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                {/* Scaled down avatar to h-7 w-7 */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F43F5E] text-[11px] font-bold text-white shadow-sm">
                  {userProfile.initial}
                </div>
                <span className="text-[12px] font-extrabold tracking-wide text-[#2563EB] dark:text-blue-400">
                  {userProfile.name}
                </span>
              </button>

              {/* Dynamic Dropdown: Profile, Sign In vs Sign Out */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                    
                    {userProfile.name === "GUEST" ? (
                      <button 
                        onClick={() => {
                          router.push("/login");
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#0070F3] transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        <LogIn className="h-4 w-4" /> Sign In
                      </button>
                    ) : (
                      <>
                        {/* UPDATE PROFILE BUTTON */}
                        <button 
                          onClick={() => {
                            router.push("/dashboard/profile");
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                        >
                          <User className="h-4 w-4" /> Update Profile
                        </button>
                        
                        <div className="h-px bg-border/50 my-1 mx-2"></div>
                        
                        {/* SIGN OUT BUTTON */}
                        <button 
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </>
                    )}

                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── GLOBAL NOTIFICATIONS DRAWER ── */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsNotificationsOpen(false)}>
            <div className="w-full max-w-md bg-card h-full border-l border-border shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</h2>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-muted rounded-full transition"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                {visibleNotifs.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No active notifications.</p>
                ) : (
                  visibleNotifs.map((notif: any) => {
                    const isIncoming = notif.receiver_email === userProfile.email;
                    return (
                      <div key={notif.id} className="p-4 rounded-xl border border-border bg-muted/30 relative group">
                        <button 
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="absolute top-3 right-3 p-1.5 bg-background border border-border rounded-md text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex justify-between items-start mb-2 pr-8">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${isIncoming ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-600'}`}>
                            {isIncoming ? 'Received' : 'Sent'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-foreground mt-2 leading-relaxed">
                          {isIncoming 
                            ? <><span className="font-bold text-primary">{notif.sender_name || notif.sender_email}</span> wants your <b>{notif.course_code} (Sec {notif.have_section})</b></>
                            : <>Your request for <b>{notif.course_code} (Sec {notif.have_section})</b> was {notif.status.toLowerCase()}</>
                          }
                        </p>
                        <div className="mt-4 pt-4 border-t border-border/50">
                          {isIncoming && notif.status === 'PENDING' ? (
                             <button onClick={() => handleAcceptRequest(notif.id)} disabled={isPending} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex justify-center items-center gap-1 shadow-sm transition-all">
                               {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Accept Swap</>}
                             </button>
                          ) : notif.status === 'ACCEPTED' ? (
                            <div className="space-y-3">
                              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-primary uppercase mb-1">{isIncoming ? "Requester Email" : "Owner Email"}</p>
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" /> {isIncoming ? notif.sender_email : notif.receiver_email}
                                </p>
                              </div>
                              <button onClick={() => showToast("Chat system activating in Phase 3!", "success")} className="w-full py-2 bg-[#0070F3] hover:bg-[#0070F3]/90 text-white text-xs font-bold rounded-lg flex justify-center items-center gap-2 shadow-sm transition-all">
                                <MessageCircle className="h-4 w-4" /> Chat with {isIncoming ? "Requester" : "Owner"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">Status: {notif.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
        {ToastComponent}
      </main>
    </div>
  );
}