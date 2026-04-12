"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Pencil, Copy, Check, Info, Eye, Share2, Trash2, AlertTriangle } from "lucide-react";

import { PopupModal } from "@/components/ui/PopupModal";
import { Button } from "@/components/ui/button";

export default function SavedRoutinesPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ── MODAL STATES ──
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [routineToShare, setRoutineToShare] = useState<string | null>(null);
  
  // New Rename States
  const [routineToRename, setRoutineToRename] = useState<any>(null);
  const [newRoutineName, setNewRoutineName] = useState("");
  
  const [isDeleting, setIsDeleting] = useState(false);  
  const [isRenaming, setIsRenaming] = useState(false);  
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // ── FETCH DATA ──
  useEffect(() => {
    fetchRoutines();
  }, []);

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

  // ── ACTIONS ──
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
        body: JSON.stringify({ routineName: newRoutineName })
      });
      if (res.ok) {
        // Optimistically update the UI without reloading the page
        setRoutines((prev) => prev.map((r) => 
          r.id === routineToRename.id ? { ...r, routineName: newRoutineName.trim() } : r
        ));
        setRoutineToRename(null);
      }
    } finally { setIsRenaming(false); }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {}
  };

  // ── UTILS ──
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  // Fallback for older routines saved before we added the new DB columns
  const getCourseCount = (r: any) => r.courseCount || JSON.parse(atob(r.routineStr) || "[]").length;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* ── HEADER ── */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">My Routines</h1>
        <p className="text-muted-foreground mt-2">Manage, view, and share your saved schedules.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground animate-pulse font-medium">
          Loading your routines...
        </div>
      ) : routines.length === 0 ? (
        <div className="mx-auto max-w-md flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl shadow-sm text-center p-6">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No routines found</h3>
          <p className="text-muted-foreground text-sm mb-6">You haven't saved any routines yet. Head over to the Finder to build your perfect schedule.</p>
          <Button asChild size="lg" className="rounded-xl font-bold px-8">
            <Link href="/dashboard/finder">Build a Routine</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {routines.map((routine, index) => {
            const courseCount = getCourseCount(routine);
            const isCopied = copiedId === routine.id;

            return (
              <div key={routine.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative">
                
                {/* CLASH WARNING BADGE (Absolute positioned to Top Right) */}
                {routine.hasClash && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-destructive-muted text-destructive px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" /> Clash
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 p-3 bg-primary-muted rounded-xl text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-12">
                    {/* TITLE WITH RENAME TRIGGER */}
                    <div 
                      className="flex items-center gap-2 group cursor-pointer"
                      onClick={() => {
                        setRoutineToRename(routine);
                        setNewRoutineName(routine.routineName);
                      }}
                    >
                      <h3 className="font-bold text-base text-foreground truncate" title={routine.routineName}>
                        {routine.routineName || `Routine #${routines.length - index}`}
                      </h3>
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {routine.id.substring(0, 4)} ... {routine.id.substring(routine.id.length - 4)}
                      </code>
                      <button 
                        onClick={() => handleCopyId(routine.id)}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                          isCopied ? "text-success" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isCopied ? "Copied" : "Copy"}
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatDateTime(routine.createdAt)}
                      </span>
                      {/* REAL SEMESTER DATA */}
                      <span className="bg-info-muted text-info text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                        {routine.semester || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {/* REAL STAT DATA */}
                      <span className="text-xs text-muted-foreground">{courseCount} crs</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-xs text-muted-foreground">{routine.totalCredits || 0} creds</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-xs text-muted-foreground">{routine.totalHours || 0} hrs</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border">
                  <Button asChild className="flex-1 rounded-xl font-bold gap-2">
                    <Link href={`/routine/${routine.id}`}><Eye className="w-4 h-4" /> View</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setRoutineToShare(routine.id)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive-muted" onClick={() => setRoutineToDelete(routine.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      ```tsx
      {/* ── MODALS ── */}
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
              <div>
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
          </div>
        </>
      )}

      {/* DELETE MODAL */}
      {routineToDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setRoutineToDelete(null)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <h2 className="text-lg font-semibold text-foreground">Delete Routine?</h2>
                </div>
                <button onClick={() => setRoutineToDelete(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Are you absolutely sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setRoutineToDelete(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-sm font-medium transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete it"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENAME MODAL */}
      {routineToRename && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setRoutineToRename(null)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Rename Routine</h2>
                </div>
                <button onClick={() => setRoutineToRename(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mb-6">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Name</label>
                <input
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="e.g. My Spring Schedule"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={40}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRoutineToRename(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button
                  onClick={executeRename}
                  disabled={isRenaming}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition disabled:opacity-50"
                >
                  {isRenaming ? "Saving..." : "Save Name"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}