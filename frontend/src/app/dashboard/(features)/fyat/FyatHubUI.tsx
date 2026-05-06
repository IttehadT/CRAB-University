"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, ChevronRight, X, LayoutDashboard } from "lucide-react";
import { createFyatGroupAction } from "./actions";

export default function FyatHubUI({ initialGroups }: { initialGroups: any[] }) {
  const [groups, setGroups] = useState<any[]>(initialGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [groupName, setGroupName] = useState("");
  const [addedCourses, setAddedCourses] = useState<string[]>([]);
  
  // Catalog State
  const [catalog, setCatalog] = useState<any[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sectionInput, setSectionInput] = useState("");
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/courses/catalog').then(res => res.json()).then(data => {
      const arr = Array.isArray(data.data) ? data.data : data.data?.sections || [];
      setCatalog(arr);
    }).catch(console.error);
  }, []);

  const uniqueCourseCodes = Array.from(new Set(catalog.map(c => c.courseCode || c.course_code))).sort() as string[];
  const currentCourseSections = catalog.filter(c => (c.courseCode || c.course_code) === selectedCourse)
    .sort((a, b) => String(a.sectionName || a.section_name).localeCompare(String(b.sectionName || b.section_name), undefined, {numeric: true}));

  const handleAddCourse = () => {
    if (selectedCourse && sectionInput) {
      const tag = `${selectedCourse}-${sectionInput.padStart(2, '0')}`;
      if (!addedCourses.includes(tag)) setAddedCourses([...addedCourses, tag]);
      setSelectedCourse(""); setCourseSearch(""); setSectionInput("");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createFyatGroupAction(groupName, addedCourses.join(", "));
    } catch (error: any) {
      // 🔥 FIX: Next.js uses errors to trigger redirects. If it's a redirect, let it through!
      if (error.message === "NEXT_REDIRECT" || error.digest?.startsWith("NEXT_REDIRECT")) {
        throw error; 
      }
      
      alert("Failed to create group: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> FYAT Routine Mapper
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Automate session scheduling. Generate a link and map common free slots.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5">
          <Plus className="h-4 w-4" /> Create FYAT Group
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* Left: Groups list */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">📂 Your Active Groups</h2>
          {groups.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-2xl bg-muted/20 text-center">
              <LayoutDashboard className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="font-bold text-foreground">No groups created yet.</p>
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

        {/* Right: How it works */}
        <div>
          <div className="rounded-2xl border border-border bg-muted/10 p-6 sticky top-24">
            <h2 className="text-base font-bold text-foreground mb-4">How it works</h2>
            <div className="space-y-6">
              {[1,2,3].map((num, i) => (
                <div key={num} className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">{num}</div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{["Create a Group", "Share the Link", "Visualize the Map"][i]}</p>
                    <p className="text-xs text-muted-foreground mt-1">{["Generate a workspace.", "Send the auto-generated link.", "CRABU builds a heatmap."][i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl max-w-xl w-full">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Create Workspace</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Group Name</label>
                <input required type="text" placeholder="e.g. Fall 2026 - Group 12" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold focus:border-primary" />
              </div>

              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-3 relative">
                <span className="absolute -top-2.5 left-4 bg-background px-2 text-[10px] font-bold text-primary uppercase">Your Classes (Blackout Slots)</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Course" value={courseSearch} onChange={(e) => { setCourseSearch(e.target.value.toUpperCase()); setIsCourseDropdownOpen(true); setSelectedCourse(""); setSectionInput(""); }} onFocus={() => setIsCourseDropdownOpen(true)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold uppercase" />
                    {isCourseDropdownOpen && courseSearch && !selectedCourse && (
                      <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                        {uniqueCourseCodes.filter(c => c.includes(courseSearch)).map(code => (
                          <button key={code} type="button" onClick={() => { setSelectedCourse(code); setCourseSearch(code); setIsCourseDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-muted text-sm font-bold border-b last:border-0">{code}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex gap-2 relative">
                    <div className="flex-1 relative">
                      <button type="button" onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)} disabled={!selectedCourse} className="w-full flex justify-between items-center bg-background border rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-50">
                        <span>{sectionInput ? `Sec ${sectionInput}` : "Section"}</span><span className="text-[10px]">▼</span>
                      </button>
                      {isSectionDropdownOpen && selectedCourse && (
                        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                          {currentCourseSections.map((c, i) => (
                            <button key={i} type="button" onClick={() => { setSectionInput(c.sectionName || c.section_name); setIsSectionDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-muted text-sm font-bold border-b last:border-0">Sec {c.sectionName || c.section_name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={handleAddCourse} disabled={!sectionInput} className="px-3 py-2 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90">Add</button>
                  </div>
                </div>

                {addedCourses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {addedCourses.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-background border border-primary/30 text-primary rounded-md text-xs font-bold flex items-center gap-1">{tag} <button type="button" onClick={() => setAddedCourses(addedCourses.filter(c => c !== tag))}>✕</button></span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90">
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