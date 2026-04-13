"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Pencil, Copy, Check, Eye, Share2, Trash2, AlertTriangle, Star, CheckCircle } from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";
import { Button } from "@/components/ui/button";

export default function SavedRoutinesPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [routineToShare, setRoutineToShare] = useState<string | null>(null);
  const [routineToRename, setRoutineToRename] = useState<any>(null);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => { fetchRoutines(); }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch("/api/routine");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setRoutines(data.routines);
      }
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!routineToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/routine/${routineToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete));
        setRoutineToDelete(null);
      }
    } finally { setIsDeleting(false); }
  };

  const executeRename = async () => {
    if (!routineToRename || !newRoutineName.trim()) return;
    setIsRenaming(true);
    try {
      const res = await fetch(`/api/routine/${routineToRename.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineName: newRoutineName }),
      });
      if (res.ok) {
        setRoutines((prev) => prev.map((r) =>
          r.id === routineToRename.id ? { ...r, routineName: newRoutineName.trim() } : r
        ));
        setRoutineToRename(null);
      }
    } finally { setIsRenaming(false); }
  };

  const toggleActive = async (routine: any) => {
    // 1. Find the current state (checking both DB snake_case and React camelCase)
    const isCurrentlyActive = routine.isActive === true || routine.is_active === 1;
    const newVal = !isCurrentlyActive;

    // 2. OPTIMISTIC UI: Instantly update the screen so it feels fast
    setRoutines((prev) => 
      prev.map((r) => {
        if (r.id === routine.id) {
          // Toggle the clicked one
          return { ...r, isActive: newVal, is_active: newVal ? 1 : 0 };
        } else if (newVal === true) {
          // IF we just turned one ON, instantly turn all others OFF
          return { ...r, isActive: false, is_active: 0 };
        }
        // If we are just turning one off, leave the others alone
        return r;
      })
    );

    // 3. Send the command to the database in the background
    try {
      await fetch(`/api/routine/${routine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newVal }),
      });
    } catch (e) { 
      console.error("Failed to toggle default routine:", e); 
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {}
  };

// We added ": string | Date" right here to make TypeScript happy!
  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return "Unknown date";
    
    // 1. Fix MySQL's raw string format
    let safeStr = typeof dateInput === 'string' ? dateInput : String(dateInput);
    
    // Replace the space with a 'T' so JavaScript knows it's a strict time string
    safeStr = safeStr.replace(' ', 'T');
    
    // Add 'Z' at the end to explicitly force JavaScript to read this as UTC (GMT 0)
    if (!safeStr.endsWith('Z')) {
      safeStr += 'Z';
    }
    
    const date = new Date(safeStr);

    // 2. Now that JS definitely knows it's UTC, we can safely tell it to output Dhaka time
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka", // Automatically handles the +6 math beautifully
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true
    });
  };

  const getCourseCount = (r: any) => {
    try { return r.courseCount || r.course_count || JSON.parse(atob(r.routineStr)).length; }
    catch { return 0; }
  };

  const getUniqueDays = (r: any): number => {
    // Check for both camelCase and snake_case
    const days = r.totalDays ?? r.total_days;
    return days && days > 0 ? Number(days) : 0;
  };

  const getCampusHours = (r: any): string => {
    const totalMins = Number(r.totalMinutes ?? r.total_minutes);
    if (!totalMins || totalMins <= 0) return "0 hrs";
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">My Routines</h1>
        <p className="text-muted-foreground mt-1">Manage, view, and share your saved schedules.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground animate-pulse font-medium">Loading your routines...</div>
      ) : routines.length === 0 ? (
        <div className="mx-auto max-w-md flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl shadow-sm text-center p-6">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No routines found</h3>
          <p className="text-muted-foreground text-sm mb-6">You haven't saved any routines yet.</p>
          <Button asChild size="lg" className="rounded-xl font-bold px-8">
            <Link href="/dashboard/finder">Build a Routine</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {routines.map((routine, index) => {
            const courseCount = getCourseCount(routine);
            const isCopied = copiedId === routine.id;
            
            // Check for both camelCase and snake_case
            const rawCredits = routine.totalCredits ?? routine.total_credits ?? 0;
            const credits = parseFloat(rawCredits).toFixed(1);
            
            const hours = getCampusHours(routine);
            const days = getUniqueDays(routine);
            const isRoutineActive = routine.isActive == 1;
            
            const courseLabel = courseCount === 1 ? "1 course" : `${courseCount} courses`;
            const creditLabel = `${credits} credits`;
            const dayLabel = days === 1 ? "1 day" : `${days} days`;

            return (
              <div key={routine.id} className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">

                {/* Top color bar + clash badge */}
                <div className={`h-1.5 w-full ${routine.hasClash == 1 ? "bg-destructive" : isRoutineActive ? "bg-success" : "bg-primary/30"}`} />

                <div className="p-5 flex flex-col flex-1">

                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 p-2.5 bg-primary-muted rounded-xl text-primary mt-0.5">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-foreground leading-tight truncate">
                            {routine.routineName || `Routine #${routines.length - index}`}
                          </h3>
                          <button
                            onClick={() => { setRoutineToRename(routine); setNewRoutineName(routine.routineName); }}
                            className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary transition"
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-info-muted text-info">
                            {routine.semester || "Unknown"}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-warning-muted text-warning">
                            {hours}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* {routine.hasClash == 1 ? (
                        <span className="flex items-center gap-1 bg-destructive-muted text-destructive px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" /> Clash
                        </span>
                      ) : null} */}
                      {/* <button
                        onClick={() => toggleActive(routine)}
                        title={routine.isActive ? "Active routine" : "Set as active"}
                        className={`p-1.5 rounded-lg transition-colors ${routine.isActive ? "text-success bg-success-muted" : "text-muted-foreground hover:text-success hover:bg-success-muted"}`}
                      >
                        <Star className="w-4 h-4" fill={routine.isActive ? "currentColor" : "none"} />
                      </button> */}
                      <button
                        onClick={() => toggleActive(routine)}
                        title={isRoutineActive ? "Default routine" : "Set default"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isRoutineActive 
                            ? "text-success bg-success-muted" 
                            : "text-muted-foreground hover:text-success hover:bg-success-muted"
                        }`}
                      >
                        <CheckCircle 
                          className="w-5 h-5" 
                          fill={isRoutineActive ? "currentColor" : "none"} 
                          stroke={isRoutineActive ? "white" : "currentColor"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                    <span className="text-xs text-muted-foreground">{courseLabel}</span>
                    <span className="text-muted-foreground/30 text-xs">•</span>
                    <span className="text-xs text-muted-foreground">{creditLabel}</span>
                    <span className="text-muted-foreground/30 text-xs">•</span>
                    <span className="text-xs text-muted-foreground">{dayLabel}</span>
                  </div>

                  {/* ID row */}
                  <div className="flex items-center gap-2 mb-4 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">ID</span>
                    <code className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {routine.id.substring(0, 8)}...{routine.id.substring(routine.id.length - 4)}
                    </code>
                    <button
                      onClick={() => handleCopyId(routine.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors shrink-0 ${isCopied ? "text-success" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button asChild className="flex-1 rounded-xl font-bold gap-1.5 text-sm">
                      <Link href={`/routine/${routine.id}`}><Eye className="w-4 h-4" /> View</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-xl font-bold gap-1.5 text-sm">
                      <Link href={`/dashboard/finder?edit=${routine.id}`}><Pencil className="w-4 h-4" /> Edit</Link>
                    </Button>
                    <button
                      onClick={() => setRoutineToShare(routine.id)}
                      className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRoutineToDelete(routine.id)}
                      className="p-2.5 rounded-xl border border-border text-destructive hover:bg-destructive-muted transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date at bottom */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] text-muted-foreground">
                      Saved {formatDate(routine.createdAt)}
                    </p>
                    {routine.hasClash == 1 && (
                      <span className="flex items-center gap-1 bg-destructive-muted text-destructive px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3" /> Clash
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHARE MODAL */}
      {routineToShare && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => { setRoutineToShare(null); setShareCopied(false); }} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Share Routine</h2>
                </div>
                <button onClick={() => { setRoutineToShare(null); setShareCopied(false); }} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Shareable Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2.5 min-w-0">
                  <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  <span className="text-sm text-foreground truncate font-mono">
                    {typeof window !== "undefined" ? `${window.location.origin}/routine/${routineToShare}` : ""}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/routine/${routineToShare}`);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 3000);
                  }}
                  className={`shrink-0 px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${shareCopied ? "bg-success text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                >
                  {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {shareCopied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELETE MODAL */}
      <PopupModal
        isOpen={!!routineToDelete} onClose={() => setRoutineToDelete(null)}
        onConfirm={executeDelete} title="Delete Routine?"
        icon={<Trash2 className="w-5 h-5" />}
        description="Are you absolutely sure? This action cannot be undone."
        confirmText="Yes, delete it" isDestructive isLoading={isDeleting}
      />

      {/* RENAME MODAL */}
      <PopupModal
        isOpen={!!routineToRename} onClose={() => setRoutineToRename(null)}
        onConfirm={executeRename} title="Rename Routine"
        icon={<Pencil className="w-5 h-5" />}
        confirmText="Save Name" isLoading={isRenaming}
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">New Name</label>
          <input
            type="text" value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="e.g. My Spring Schedule"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={40} autoFocus
          />
        </div>
      </PopupModal>
    </main>
  );
}