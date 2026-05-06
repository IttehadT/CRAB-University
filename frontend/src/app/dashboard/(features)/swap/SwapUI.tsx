"use client";

import { useState, useEffect, useTransition } from "react";
import { ArrowRightLeft, Plus, Search, CheckCircle, X, AlertCircle, Bell, Loader2, Calendar, Tag, Mail, MessageCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
// Add markNotificationsReadAction to your imports
import { createSwapAction, requestSwapAction, getNotificationsAction, acceptSwapAction, deleteNotificationAction, markSwapDoneAction, markNotificationsReadAction } from "./actions";

interface SwapUIProps {
  initialSwaps: any[];
  currentUserEmail: string;
  currentUserName: string;
}

const formatTime12h = (time24?: string | null) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

export default function SwapUI({ initialSwaps, currentUserEmail, currentUserName }: SwapUIProps) {
  const [swaps, setSwaps] = useState<any[]>(initialSwaps);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "COMPLETED" | "MY LISTINGS">("ALL");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast, ToastComponent } = useToast();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);

  // ── Form State ──
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [haveSection, setHaveSection] = useState("");
  
  // Cross-Course State
  const [wantCourseSearch, setWantCourseSearch] = useState("");
  const [isWantCourseDropdownOpen, setIsWantCourseDropdownOpen] = useState(false);
  const [wantCourseCode, setWantCourseCode] = useState("");
  const [wantSectionInput, setWantSectionInput] = useState("");
  const [wantSections, setWantSections] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [isHaveSectionDropdownOpen, setIsHaveSectionDropdownOpen] = useState(false);
  const [isWantSectionDropdownOpen, setIsWantSectionDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const res = await getNotificationsAction(currentUserEmail);
      if (res.success) setNotifications(res.data || []);

      try {
        const catRes = await fetch('/api/courses/catalog?semester=Summer 2026');
        if (catRes.ok) {
          const freshData = await catRes.json();
          const coursesArray = Array.isArray(freshData.data) ? freshData.data : freshData.data?.sections || [];
          setCatalog(coursesArray);
        }
      } catch (e) {
        console.error("Failed to load catalog");
      }
    };
    loadData();
  }, [currentUserEmail]);

  // Derived Data & Sorting
  const uniqueCourseCodes = Array.from(new Set(catalog.map(c => c.courseCode || c.course_code))).sort() as string[];
  
  // 🔥 BUG 3 FIXED: Sort Sections in Ascending Order
  const currentCourseSections = catalog
    .filter(c => (c.courseCode || c.course_code) === selectedCourse)
    .sort((a, b) => String(a.sectionName || a.section_name).localeCompare(String(b.sectionName || b.section_name), undefined, {numeric: true}));
    
  const wantCourseSections = catalog
    .filter(c => (c.courseCode || c.course_code) === wantCourseCode)
    .sort((a, b) => String(a.sectionName || a.section_name).localeCompare(String(b.sectionName || b.section_name), undefined, {numeric: true}));

  const handleAddWantSection = () => {
    if (wantCourseCode && wantSectionInput) {
      const tag = `${wantCourseCode}-${wantSectionInput}`;
      if (!wantSections.includes(tag)) {
        setWantSections([...wantSections, tag]);
        setWantSectionInput("");
      }
    }
  };

  const handleRemoveWantSection = (tag: string) => {
    setWantSections(wantSections.filter(s => s !== tag));
  };

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !haveSection || wantSections.length === 0) {
      showToast("Please fill out all required fields.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("courseCode", selectedCourse);
    formData.append("haveSec", haveSection);
    formData.append("wantSec", wantSections.join(", "));
    formData.append("notes", notes);

    startTransition(async () => {
      const res = await createSwapAction(formData, currentUserEmail, currentUserName);
      if (res.success) {
        showToast("Swap created successfully!", "success");
        setIsAddModalOpen(false);
        setCourseSearch(""); setSelectedCourse(""); setHaveSection(""); 
        setWantCourseSearch(""); setWantCourseCode(""); setWantSectionInput(""); setWantSections([]); setNotes("");
      } else {
        showToast("Failed to create swap.", "error");
      }
    });
  };

  const handleRequestSwap = (swapId: string, receiverEmail: string) => {
    startTransition(async () => {
      const res = await requestSwapAction(swapId, receiverEmail, currentUserEmail);
      if (res.success) {
        showToast("Swap requested successfully!", "success");
        const notifRes = await getNotificationsAction(currentUserEmail);
        if (notifRes.success) setNotifications(notifRes.data || []);
      } else {
        showToast(res.error || "Failed to request swap.", "error");
      }
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    startTransition(async () => {
      const res = await acceptSwapAction(requestId);
      if (res.success) {
        showToast("Swap Accepted! Check your notifications.", "success");
        const notifRes = await getNotificationsAction(currentUserEmail);
        if (notifRes.success) setNotifications(notifRes.data || []);
      }
    });
  };

  const handleDeleteNotification = (requestId: string) => {
    startTransition(async () => {
      const res = await deleteNotificationAction(requestId);
      if (res.success) {
        setNotifications(notifications.filter(n => n.id !== requestId));
        showToast("Notification deleted", "success");
      }
    });
  };

  const handleMarkDone = (swapId: string) => {
    startTransition(async () => {
      const res = await markSwapDoneAction(swapId, currentUserEmail);
      if (res.success) {
        showToast("Swap marked as completed!", "success");
        setSwaps(swaps.map(s => s.id === swapId ? { ...s, status: "COMPLETED" } : s));
      } else {
        showToast("Failed to mark as done.", "error");
      }
    });
  };

  const filteredSwaps = swaps.filter(swap => {
    const matchesSearch = swap.course_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          swap.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === "ALL" ? true : 
      filter === "MY LISTINGS" ? swap.user_email === currentUserEmail :
      swap.status === filter;
    return matchesSearch && matchesFilter;
  });

  // 🔥 UPDATED NOTIFICATION MATH
  const visibleNotifs = notifications.filter((notif: any) => {
    const isIncoming = notif.receiver_email === currentUserEmail;
    if (!isIncoming && notif.status === 'PENDING') return false; 
    return true;
  });
  
  const unreadNotifsCount = visibleNotifs.filter((n: any) => {
    if (n.receiver_email === currentUserEmail && n.status === 'PENDING') return true; // Incoming pending
    if (n.sender_email === currentUserEmail && n.status !== 'PENDING' && !n.is_read) return true; // Outgoing answered but unread
    return false;
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12 relative">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            Course Swap
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Trade sections with other students to perfect your routine.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* notification button */}
          {/* <button 
            onClick={() => {
              setIsNotificationsOpen(true);
              if (unreadNotifsCount > 0) {
                startTransition(async () => {
                  await markNotificationsReadAction(currentUserEmail);
                  // Optimistically clear the red dot locally
                  setNotifications(notifications.map(n => 
                    n.sender_email === currentUserEmail ? { ...n, is_read: 1 } : n
                  ));
                });
              }
            }} 
            className="relative p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-background">
                  {unreadNotifsCount}
              </span>
            )}
          </button> */}
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#0070F3] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0070F3]/90 hover:-translate-y-0.5">
            <Plus className="h-4 w-4" /> Add Swap
          </button>
        </div>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border">
          {["ALL", "AVAILABLE", "COMPLETED", "MY LISTINGS"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {f === "MY LISTINGS" ? "My Listings" : f === "ALL" ? "All Requests" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search course code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:border-primary transition-colors shadow-sm" />
        </div>
      </div>

      {/* ── SWAP CARDS GRID ── */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredSwaps.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-muted/10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="font-bold text-foreground">No swap requests found.</p>
          </div>
        ) : (
          filteredSwaps.map((swap) => {
            const isOwner = swap.user_email === currentUserEmail;
            const hasRequested = notifications.some(n => n.swap_id === swap.id && n.sender_email === currentUserEmail);
            const wantArray = swap.want_section ? swap.want_section.split(',').map((s:string) => s.trim()) : [];

            const offeringMatch = catalog.find(c => 
              (c.courseCode === swap.course_code || c.course_code === swap.course_code) && 
              (c.sectionName === swap.have_section || c.section_name === swap.have_section)
            );

            return (
              <div key={swap.id} className="relative flex flex-col rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden group">
                
                <div className="absolute top-4 right-4 z-10">
                  {swap.status === "COMPLETED" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">Completed</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">Active</span>
                  )}
                </div>

                <div className="p-5 flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-4">
                    {isOwner ? "Your Listing" : `Posted by ${swap.student_name}`}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Offering</span>
                  </div>
                  
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6 group-hover:bg-primary/10 transition-colors">
                    <h3 className="text-[1.1rem] font-bold text-foreground">
                      {swap.course_code}-{swap.have_section}-{offeringMatch?.faculties || swap.have_faculty || "TBA"}
                    </h3>
                    
                    {offeringMatch ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(offeringMatch.sectionSchedule?.classSchedules || []).map((s:any, idx:number) => (
                           <span key={`t-${idx}`} className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold tracking-wide">
                             {s.day?.substring(0,3).toUpperCase()} {formatTime12h(s.startTime)}-{formatTime12h(s.endTime)}
                           </span>
                        ))}
                        {(offeringMatch.labSchedules || []).map((l:any, idx:number) => (
                           <span key={`l-${idx}`} className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-[10px] font-bold tracking-wide">
                             LAB {l.day?.substring(0,3).toUpperCase()} {formatTime12h(l.startTime)}-{formatTime12h(l.endTime)}
                           </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Schedule TBA</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Looking For</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wantArray.map((secStr: string, i: number) => {
                      const isCrossCourse = secStr.includes('-');
                      const wCourse = isCrossCourse ? secStr.split('-')[0] : swap.course_code;
                      const wSec = isCrossCourse ? secStr.split('-')[1] : secStr;

                      const wantMatch = catalog.find(c => 
                        (c.courseCode === wCourse || c.course_code === wCourse) && 
                        (c.sectionName === wSec || c.section_name === wSec)
                      );
                      const facultyStr = wantMatch?.faculties ? `-${wantMatch.faculties}` : "";
                      
                      return (
                        <span key={i} className="px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-sm">
                          {wSec === "ANY" ? `${wCourse}-ANY SECTION` : `${wCourse}-${wSec}${facultyStr}`}
                        </span>
                      );
                    })}
                  </div>

                  {/* 🔥 BUG 4 FIXED: Show Additional Notes */}
                  {swap.notes && (
                    <div className="mt-5 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-500 leading-relaxed">
                        <span className="font-bold uppercase tracking-wider mr-1">📝 Note:</span> {swap.notes}
                      </p>
                    </div>
                  )}

                </div>

                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between mt-auto">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(swap.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {isOwner ? (
                    swap.status !== "COMPLETED" ? (
                      <button 
                        onClick={() => handleMarkDone(swap.id)}
                        disabled={isPending}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Mark as Done</>}
                      </button>
                    ) : (
                      <button disabled className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Completed
                      </button>
                    )
                  ) : swap.status === "AVAILABLE" ? (
                    <button 
                      onClick={() => handleRequestSwap(swap.id, swap.user_email)}
                      disabled={isPending || hasRequested}
                      className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm ${
                        hasRequested 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-not-allowed" 
                        : "bg-[#0070F3] hover:bg-[#0070F3]/90 text-white hover:-translate-y-0.5"
                      }`}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : hasRequested ? <><CheckCircle className="h-4 w-4" /> Requested</> : <><Mail className="h-4 w-4" /> Request Swap</>}
                    </button>
                  ) : (
                    <button disabled className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── NOTIFICATIONS SLIDEOUT ── */}
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
                  const isIncoming = notif.receiver_email === currentUserEmail;
                  
                  return (
                    <div key={notif.id} className="p-4 rounded-xl border border-border bg-muted/30 relative group">
                      <button 
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="absolute top-3 right-3 p-1.5 bg-background border border-border rounded-md text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Notification"
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
                           <button 
                             onClick={() => handleAcceptRequest(notif.id)}
                             disabled={isPending}
                             className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex justify-center items-center gap-1 shadow-sm transition-all"
                           >
                             {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Accept Swap</>}
                           </button>
                        ) : notif.status === 'ACCEPTED' ? (
                          <div className="space-y-3">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-primary uppercase mb-1">{isIncoming ? "Requester Email" : "Owner Email"}</p>
                              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" /> 
                                {isIncoming ? notif.sender_email : notif.receiver_email}
                              </p>
                            </div>
                            <button 
                              onClick={() => showToast("Chat system activating in Phase 3!", "success")}
                              className="w-full py-2 bg-[#0070F3] hover:bg-[#0070F3]/90 text-white text-xs font-bold rounded-lg flex justify-center items-center gap-2 shadow-sm transition-all"
                            >
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

      {/* ── ADD SWAP MODAL (Max 4 Results Dropdowns) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Post Swap Request
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateSwap} className="space-y-6">
              
              {/* Offering Block */}
              <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-4 relative">
                <span className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-bold text-primary uppercase">What you have</span>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Course Search (Now Scrolls) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Search Course</label>
                    <input 
                      required type="text" placeholder="e.g. CSE420" value={courseSearch}
                      onChange={(e) => { 
                        setCourseSearch(e.target.value.toUpperCase()); 
                        setIsCourseDropdownOpen(true); 
                        setSelectedCourse(""); setHaveSection(""); 
                      }}
                      onFocus={() => setIsCourseDropdownOpen(true)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary uppercase"
                    />
                    {isCourseDropdownOpen && courseSearch && !selectedCourse && (
                      <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                        {uniqueCourseCodes.filter(c => c.includes(courseSearch)).map(code => (
                          <button 
                            key={code} type="button"
                            onClick={() => { setSelectedCourse(code); setCourseSearch(code); setIsCourseDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold text-foreground transition-colors border-b border-border last:border-0"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section Dropdown (Custom Scrollable) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Section</label>
                    <button 
                      type="button" 
                      onClick={() => setIsHaveSectionDropdownOpen(!isHaveSectionDropdownOpen)}
                      disabled={!selectedCourse}
                      className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                    >
                      <span>{haveSection ? `Sec ${haveSection}` : "-- Select Section --"}</span>
                      <span className="text-[10px] text-muted-foreground">▼</span>
                    </button>
                    {isHaveSectionDropdownOpen && selectedCourse && (
                      <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                        {currentCourseSections.map((c, i) => (
                          <button 
                            key={i} type="button"
                            onClick={() => { setHaveSection(c.sectionName || c.section_name); setIsHaveSectionDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold text-foreground transition-colors border-b border-border last:border-0"
                          >
                            Sec {c.sectionName || c.section_name} ({c.faculties || "TBA"})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Looking For Block */}
              <div className="p-5 border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl space-y-4 relative">
                <span className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">What you want</span>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  
                  {/* Want Course Autocomplete (Now Scrolls) */}
                  <div className="relative flex-1">
                    <input 
                      type="text" placeholder="Course (e.g. CSE330)" value={wantCourseSearch}
                      onChange={(e) => { 
                        setWantCourseSearch(e.target.value.toUpperCase()); 
                        setIsWantCourseDropdownOpen(true); 
                        setWantCourseCode(""); setWantSectionInput(""); 
                      }}
                      onFocus={() => setIsWantCourseDropdownOpen(true)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-purple-500 uppercase"
                    />
                    {isWantCourseDropdownOpen && wantCourseSearch && !wantCourseCode && (
                      <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                        {uniqueCourseCodes.filter(c => c.includes(wantCourseSearch)).map(code => (
                          <button 
                            key={`w-${code}`} type="button"
                            onClick={() => { setWantCourseCode(code); setWantCourseSearch(code); setIsWantCourseDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold text-foreground transition-colors border-b border-border last:border-0"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Want Section Dropdown (Custom Scrollable) */}
                  <div className="flex-1 flex gap-2 relative">
                    <div className="flex-1 relative">
                      <button 
                        type="button" 
                        onClick={() => setIsWantSectionDropdownOpen(!isWantSectionDropdownOpen)}
                        disabled={!wantCourseCode}
                        className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      >
                        <span className="truncate">{wantSectionInput ? (wantSectionInput === "ANY" ? "ANY Section" : `Sec ${wantSectionInput}`) : "-- Section --"}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">▼</span>
                      </button>
                      
                      {isWantSectionDropdownOpen && wantCourseCode && (
                        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                          <button 
                            type="button"
                            onClick={() => { setWantSectionInput("ANY"); setIsWantSectionDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold text-foreground transition-colors border-b border-border"
                          >
                            ANY Section
                          </button>
                          {wantCourseSections.map((c, i) => (
                            <button 
                              key={i} type="button"
                              onClick={() => { setWantSectionInput(c.sectionName || c.section_name); setIsWantSectionDropdownOpen(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold text-foreground transition-colors border-b border-border last:border-0"
                            >
                              Sec {c.sectionName || c.section_name} ({c.faculties || "TBA"})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      type="button" onClick={handleAddWantSection} disabled={!wantSectionInput}
                      className="px-4 py-2 bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-purple-600 transition-colors shadow-sm shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {wantSections.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                    {wantSections.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-background border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                        {tag}
                        <button type="button" onClick={() => handleRemoveWantSection(tag)} className="text-muted-foreground hover:text-destructive">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Additional Notes (Optional)</label>
                <input type="text" placeholder="e.g. Willing to swap lab sections only..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={isPending || wantSections.length === 0} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0070F3] text-white hover:bg-[#0070F3]/90 transition-colors shadow-md disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}