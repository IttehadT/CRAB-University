"use client";

import { useState, useEffect, useTransition } from "react";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import { submitFyatRoutineAction } from "./actions";

export default function SubmitUI({ groupId, groupName }: { groupId: string, groupName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Catalog State
  const [catalog, setCatalog] = useState<any[]>([]);

  // Form State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [addedCourses, setAddedCourses] = useState<string[]>([]);

  // Dropdown State
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sectionInput, setSectionInput] = useState("");
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch the live course catalog so the dropdown works instantly
    fetch('/api/courses/catalog')
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data.data) ? data.data : data.data?.sections || [];
        setCatalog(arr);
      })
      .catch(console.error);
  }, []);

  const uniqueCourseCodes = Array.from(new Set(catalog.map(c => c.courseCode || c.course_code))).sort() as string[];
  const currentCourseSections = catalog
    .filter(c => (c.courseCode || c.course_code) === selectedCourse)
    .sort((a, b) => String(a.sectionName || a.section_name).localeCompare(String(b.sectionName || b.section_name), undefined, {numeric: true}));

  const handleAddCourse = () => {
    if (selectedCourse && sectionInput) {
      const tag = `${selectedCourse}-${sectionInput.padStart(2, '0')}`;
      if (!addedCourses.includes(tag)) {
        setAddedCourses([...addedCourses, tag]);
        setSelectedCourse(""); setCourseSearch(""); setSectionInput("");
      }
    }
  };

  const handleRemoveCourse = (tag: string) => {
    setAddedCourses(addedCourses.filter(c => c !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addedCourses.length === 0) return alert("Please add at least one course.");
    setIsSubmitting(true);
    
    startTransition(async () => {
      try {
        await submitFyatRoutineAction(groupId, studentName, studentId, addedCourses.join(", "));
        setIsSuccess(true);
      } catch (error: any) {
        alert("Failed to submit routine: " + error.message);
        setIsSubmitting(false);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl animate-in zoom-in-95 duration-500">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Routine Submitted!</h2>
        <p className="text-muted-foreground">Thank you, {studentName}. Your schedule has been successfully mapped.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="mb-8 border-b border-border pb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">{groupName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Please add your registered courses below.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Full Name</label>
          <input required type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Student ID</label>
          <input required type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-4 relative">
          <span className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-bold text-primary uppercase">Your Enrolled Courses</span>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text" placeholder="Course Code" value={courseSearch}
                onChange={(e) => { setCourseSearch(e.target.value.toUpperCase()); setIsCourseDropdownOpen(true); setSelectedCourse(""); setSectionInput(""); }}
                onFocus={() => setIsCourseDropdownOpen(true)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary uppercase"
              />
              {isCourseDropdownOpen && courseSearch && !selectedCourse && (
                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                  {uniqueCourseCodes.filter(c => c.includes(courseSearch)).map(code => (
                    <button key={code} type="button" onClick={() => { setSelectedCourse(code); setCourseSearch(code); setIsCourseDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold border-b border-border last:border-0">{code}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 flex gap-2 relative">
              <div className="flex-1 relative">
                <button type="button" onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)} disabled={!selectedCourse} className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold focus:border-primary disabled:opacity-50">
                  <span>{sectionInput ? `Sec ${sectionInput}` : "Section"}</span><span className="text-[10px] text-muted-foreground">▼</span>
                </button>
                {isSectionDropdownOpen && selectedCourse && (
                  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-[160px]">
                    {currentCourseSections.map((c, i) => (
                      <button key={i} type="button" onClick={() => { setSectionInput(c.sectionName || c.section_name); setIsSectionDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-bold border-b border-border last:border-0">
                        Sec {c.sectionName || c.section_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={handleAddCourse} disabled={!sectionInput} className="px-4 py-2 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 shrink-0">Add</button>
            </div>
          </div>

          {addedCourses.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              {addedCourses.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-background border border-primary/30 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                  {tag} <button type="button" onClick={() => handleRemoveCourse(tag)} className="text-muted-foreground hover:text-destructive">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || addedCourses.length === 0} className="w-full flex justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#0070F3] text-white hover:bg-[#0070F3]/90 disabled:opacity-50">
          {isPending || isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Schedule</>}
        </button>
      </form>
    </div>
  );
}