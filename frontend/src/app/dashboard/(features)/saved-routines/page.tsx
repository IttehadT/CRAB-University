"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SavedRoutinesPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const deleteRoutine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    
    try {
      const res = await fetch(`/api/routine/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRoutines((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const parseRoutineCount = (routineStr: string) => {
    try {
      const sections = JSON.parse(atob(routineStr));
      return sections.length;
    } catch {
      return 0;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">My Routines</h1>
        <p className="text-muted-foreground mt-2">Manage and share your saved schedules.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground">Loading your routines...</div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-sm">
          <p className="text-muted-foreground mb-4">You haven't saved any routines yet.</p>
          <Link href="/dashboard/finder" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition hover:bg-primary/90">
            Build a Routine
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine, index) => (
            <div key={routine.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col hover:border-primary/50 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <span className="text-primary text-xl">📅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{routine.routineName || `Routine #${routines.length - index}`}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(routine.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted text-xs font-medium text-foreground">
                  <span>{parseRoutineCount(routine.routineStr)} Courses Saved</span>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Routine ID</p>
                  <code className="text-xs bg-muted/50 px-2 py-1 rounded border border-border block truncate">
                    {routine.id}
                  </code>
                </div>
              </div>

              <div className="flex gap-2 border-t border-border pt-4">
                <button onClick={() => navigator.clipboard.writeText(routine.id)} className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition">
                  Copy ID
                </button>
                <button onClick={() => deleteRoutine(routine.id)} className="flex-1 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium rounded-lg transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}