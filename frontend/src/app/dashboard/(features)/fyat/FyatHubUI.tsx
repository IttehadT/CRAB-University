"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, ChevronRight, X, LayoutDashboard } from "lucide-react";
import { createFyatGroupAction } from "./actions"; // Importing the Server Action directly

export default function FyatHubUI({ initialGroups }: { initialGroups: any[] }) {
  const [groups, setGroups] = useState<any[]>(initialGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [groupName, setGroupName] = useState("");
  const [mentorCourses, setMentorCourses] = useState("");

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calls the secure server function directly!
      await createFyatGroupAction(groupName, mentorCourses);
      
      // Note: We don't need a success state here because the Server Action 
      // uses redirect(), which instantly sends the user to the new page.
      
    } catch (error: any) {
      alert("Failed to create group: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto relative">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            FYAT Routine Mapper
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Automate session scheduling. Generate a link, collect courses, and instantly map common free slots.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Create FYAT Group
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        
        {/* ── LEFT: YOUR GROUPS ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            📂 Your Active Groups
          </h2>
          
          {groups.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-2xl bg-muted/20 text-center">
              <LayoutDashboard className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="font-bold text-foreground">No groups created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click the button above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map((group) => (
                <Link key={group.id} href={`/dashboard/fyat/${group.id}`} className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{group.group_name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Created {new Date(group.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: HOW IT WORKS ── */}
        <div>
          <div className="rounded-2xl border border-border bg-muted/10 p-6 sticky top-24">
            <h2 className="text-base font-bold text-foreground mb-4">How it works</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">1</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Create a Group</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Generate a dedicated workspace for your mentees.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">2</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Share the Link</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Send the auto-generated collection form link to your students.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">3</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Visualize the Map</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">CRABU instantly builds a heatmap showing exactly when everyone is free.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── CREATE GROUP MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Create Workspace
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Group Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Fall 2026 - Group 12" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                  Your Courses (Optional)
                  <span className="ml-2 font-normal text-muted-foreground/60 normal-case">So your own classes block out slots on the heatmap</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. CSE420-01, MAT120-05" 
                  value={mentorCourses}
                  onChange={(e) => setMentorCourses(e.target.value.toUpperCase())}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none uppercase" 
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}