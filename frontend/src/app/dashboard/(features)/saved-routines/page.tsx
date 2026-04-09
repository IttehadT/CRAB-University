"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Pencil, 
  Copy, 
  Check, 
  Info, 
  Eye, 
  Share2, 
  Trash2 
} from "lucide-react";

import { PopupModal } from "@/components/ui/PopupModal";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/ui/ShareModal";

export default function SavedRoutinesPage() {
  // ── STATE MANAGEMENT ──────────────────────────────────────────────────────
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [routineToShare, setRoutineToShare] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);  
  
  // UI states for interactive elements
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── DATA FETCHING ─────────────────────────────────────────────────────────
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

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const confirmDelete = (id: string) => setRoutineToDelete(id);

  const executeDelete = async () => {
    if (!routineToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/routine/${routineToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete));
        setRoutineToDelete(null); 
      }
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000); // Reset checkmark after 3s
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // ── UTILITIES ─────────────────────────────────────────────────────────────
  /**
   * Helper to count the number of courses inside the Base64 string.
   */
  const parseRoutineCount = (routineStr: string) => {
    try {
      const sections = JSON.parse(atob(routineStr));
      return sections.length;
    } catch {
      return 0;
    }
  };

  /**
   * Formats the timestamp into a beautiful "May 27, 11:00 PM" layout.
   */
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* ── PAGE HEADER ── */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">My Routines</h1>
        <p className="text-muted-foreground mt-2">Manage, view, and share your saved schedules.</p>
      </div>

      {/* ── LOADING STATE ── */}
      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground animate-pulse font-medium">
          Loading your routines...
        </div>
      ) 
      
      // ── EMPTY STATE ──
      : routines.length === 0 ? (
        <div className="mx-auto max-w-md flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl shadow-sm text-center p-6">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No routines found</h3>
          <p className="text-muted-foreground text-sm mb-6">You haven't saved any routines yet. Head over to the Finder to build your perfect schedule.</p>
          <Button asChild size="lg" className="rounded-xl font-bold px-8">
            <Link href="/dashboard/finder">Build a Routine</Link>
          </Button>
        </div>
      ) 
      
      // ── GRID OF SAVED ROUTINES ──
      : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {routines.map((routine, index) => {
            const courseCount = parseRoutineCount(routine.routineStr);
            const isCopied = copiedId === routine.id;

            return (
              <div 
                key={routine.id} 
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* ── CARD TOP SECTION (Icon + Info) ── */}
                <div className="flex items-start gap-4 mb-4">
                  
                  {/* Calendar Icon Bubble */}
                  <div className="shrink-0 p-3 bg-primary/10 rounded-xl text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>

                  {/* Routine Details */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Title & Edit Icon */}
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <h3 className="font-bold text-base text-foreground truncate">
                        {routine.routineName || `Routine #${routines.length - index}`}
                      </h3>
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary shrink-0" />
                    </div>

                    {/* ID, Copy, and Info Tooltip */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Truncated ID Badge */}
                      <code className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {routine.id.substring(0, 4)} ... {routine.id.substring(routine.id.length - 4)}
                      </code>
                      
                      {/* Copy Action */}
                      <button 
                        onClick={() => handleCopyId(routine.id)}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                          isCopied ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isCopied ? "Copied" : "Copy"}
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>

                      {/* CSS-Only Hover Tooltip for Info */}
                      <div className="relative group/tooltip flex items-center">
                        <Info className="w-3.5 h-3.5 text-primary/70 hover:text-primary cursor-help transition-colors" />
                        
                        {/* Tooltip Content (Hidden by default, visible on hover) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                          
                          {/* FIXED: Changed bg-popover to bg-card and text-popover-foreground to text-foreground */}
                          <div className="bg-card border border-border text-foreground text-xs rounded-lg shadow-xl p-3 text-center leading-relaxed">
                            Share this Routine ID with your friends. They can use it to Import and View your routine as well as use it in the Merge Routine Page!
                          </div>
                          
                          {/* Triangle Pointer */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-border" />
                          
                          {/* FIXED: Changed border-t-popover to border-t-card so the triangle matches the box */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-[5px] border-transparent border-t-card" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata: Date & Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatDateTime(routine.createdAt)}
                      </span>
                      
                      {/* Placeholder Semester Bubble */}
                      <span className="bg-primary/10 text-primary text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-wider">
                        Spring 2026
                      </span>
                    </div>

                    {/* Course & Credit Count */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {courseCount} {courseCount === 1 ? "course" : "courses"}
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      {/* Note: In the future, parse actual credits here */}
                      <span className="text-xs text-muted-foreground">
                        9 credits
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      {/* Note: In the future, parse actual hours here */}
                      <span className="text-xs text-muted-foreground">
                        18 hours
                      </span>
                    </div>

                  </div>
                </div>
                
                {/* ── CARD BOTTOM SECTION (Actions) ── */}
                {/* Pushes to the bottom and matches the requested layout */}
                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border">
                  
                  {/* Primary View Button (Takes up remaining space) */}
                  <Button asChild className="flex-1 rounded-xl font-bold gap-2">
                    {/* Note: This assumes you have the public view page from earlier setup at /routine/[id] */}
                    <Link href={`/routine/${routine.id}`}>
                      <Eye className="w-4 h-4" /> View
                    </Link>
                  </Button>

                  {/* Icon Buttons for Share and Delete */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => setRoutineToShare(routine.id)}
                    title="Share Routine"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => confirmDelete(routine.id)}
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ── */}
      {routineToShare && (
        <ShareModal 
          routineId={routineToShare} 
          onClose={() => setRoutineToShare(null)} 
        />
      )}

      <PopupModal 
        isOpen={!!routineToDelete}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={executeDelete}
        title="Delete Routine?"
        description="Are you absolutely sure you want to delete this routine? This action cannot be undone."
        confirmText="Yes, delete it"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </main>
  );
}