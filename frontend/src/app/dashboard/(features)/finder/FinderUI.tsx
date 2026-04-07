// src/app/dashboard/(features)/finder/FinderUI.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { CourseMold } from "@/lib/db/mold";

interface FinderUIProps {
  initialCourses: Partial<CourseMold>[];
}

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────

const formatTime12h = (time24?: string | null) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const formatExam = (schedule?: any) => {
  if (!schedule?.finalExamDate) return "N/A";
  const dateObj = new Date(schedule.finalExamDate);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const start = formatTime12h(schedule.finalExamStartTime);
  const end = formatTime12h(schedule.finalExamEndTime);
  if (start && end) return `${dateStr} ${start} - ${end}`;
  return dateStr;
};

export default function FinderUI({ initialCourses }: FinderUIProps) {
  // ── 1. CORE STATE ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [hideFilled, setHideFilled] = useState(false);
  const [labReq, setLabReq] = useState<"ALL" | "WITH_LAB" | "NO_LAB">("ALL");
  const [selectedCourses, setSelectedCourses] = useState<Partial<CourseMold>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSelectionOpen, setIsMobileSelectionOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // -1 represents "All"

  // ── 2. FILTERING ENGINE ───────────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const searchLower = searchTerm.toLowerCase();
      const codeMatch = course.courseCode?.toLowerCase().includes(searchLower);
      const facultyMatch = course.faculties?.toLowerCase().includes(searchLower);
      if (searchTerm && !codeMatch && !facultyMatch) return false;

      if (hideFilled && (course.capacity || 0) <= (course.consumedSeat || 0)) return false;

      const hasLab = course.labSchedules && course.labSchedules.length > 0;
      if (labReq === "WITH_LAB" && !hasLab) return false;
      if (labReq === "NO_LAB" && hasLab) return false;

      return true;
    });
  }, [initialCourses, searchTerm, hideFilled, labReq]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hideFilled, labReq, itemsPerPage]);

  // ── 3. PAGINATION ENGINE ──────────────────────────────────────────────────
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredCourses.length / itemsPerPage);
  
  const paginatedCourses = useMemo(() => {
    if (itemsPerPage === -1) return filteredCourses;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  // ── 4. SELECTION HANDLERS ─────────────────────────────────────────────────
  const toggleCourse = (course: Partial<CourseMold>) => {
    setSelectedCourses((prev) => {
      const isAlreadySelected = prev.some((c) => c.sectionId === course.sectionId);
      if (isAlreadySelected) return prev.filter((c) => c.sectionId !== course.sectionId);
      return [...prev, course];
    });
  };

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0);

  // ── 5. RENDERERS ──────────────────────────────────────────────────────────
  const renderDesktopSchedule = (schedules: any[] | undefined | null) => {
    if (!schedules || schedules.length === 0) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex flex-col gap-0.5">
        {schedules.map((s, i) => (
          <div key={i} className="text-[11px] whitespace-nowrap text-muted-foreground">
            <span className="font-semibold text-foreground uppercase mr-1">{s.day?.substring(0, 3)}</span>
            {formatTime12h(s.startTime)} - {formatTime12h(s.endTime)}
          </div>
        ))}
      </div>
    );
  };

  const renderMobilePills = (schedules: any[] | undefined | null, isLab: boolean) => {
    if (!schedules || schedules.length === 0) return null;
    return schedules.map((s, i) => (
      <span key={i} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
        isLab ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      }`}>
        {s.day?.substring(0, 3)} {formatTime12h(s.startTime)} - {formatTime12h(s.endTime)}
        {isLab && <span className="ml-1 text-[9px] bg-purple-500/20 px-1 rounded">LAB</span>}
      </span>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── TOP CONTROLS: SEARCH & EXPOSED FILTERS ── */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
            <input
              type="text"
              placeholder="Enter Course Code or Faculty Initial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between md:justify-start gap-4">
            <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer hover:text-blue-500 transition">
              <input type="checkbox" checked={hideFilled} onChange={(e) => setHideFilled(e.target.checked)} className="rounded border-border text-blue-600 focus:ring-blue-500"/>
              Hide Filled
            </label>
            <div className="h-4 w-px bg-border hidden md:block"></div>
            <select value={labReq} onChange={(e) => setLabReq(e.target.value as any)} className="rounded-lg border border-border bg-background py-2 px-3 text-sm focus:border-blue-500 focus:outline-none">
              <option value="ALL">All Courses</option>
              <option value="WITH_LAB">Requires Lab</option>
              <option value="NO_LAB">No Lab</option>
            </select>
          </div>
        </div>

        {selectedCourses.length > 0 && (
          <div className="pt-2 border-t border-border border-dashed">
            <div className="hidden md:flex flex-wrap gap-2">
              {selectedCourses.map((course) => (
                <span key={course.sectionId} onClick={() => toggleCourse(course)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition dark:text-blue-400">
                  {course.courseCode}-[{course.sectionName}] - {course.faculties} <span className="text-blue-500/50">✕</span>
                </span>
              ))}
            </div>
            
            <div className="md:hidden">
              <button onClick={() => setIsMobileSelectionOpen(!isMobileSelectionOpen)} className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm font-bold text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/10 dark:text-blue-400">
                {selectedCourses.length} courses selected
                <span className="text-blue-500">{isMobileSelectionOpen ? "▲" : "▼"}</span>
              </button>
              {isMobileSelectionOpen && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCourses.map((course) => (
                    <span key={course.sectionId} onClick={() => toggleCourse(course)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-500/20 dark:text-blue-400">
                      {course.courseCode}-[{course.sectionName}] - {course.faculties} <span>✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP VIEW: DATA TABLE ── */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* FIX: Removed whitespace-nowrap from table so text can wrap normally */}
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-semibold">Course Code</th>
                <th className="px-4 py-3 font-semibold">Fac. Init.</th>
                <th className="px-4 py-3 font-semibold">Prereq</th>
                <th className="px-4 py-3 font-semibold text-center">Seat / Booked</th>
                <th className="px-4 py-3 font-semibold">Class Schedule</th>
                <th className="px-4 py-3 font-semibold">Lab Schedule</th>
                <th className="px-4 py-3 font-semibold">Exam Day</th>
                <th className="px-4 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCourses.map((course) => {
                const isSelected = selectedCourses.some((c) => c.sectionId === course.sectionId);
                const capacity = course.capacity || 0;
                const booked = course.consumedSeat || 0;
                const available = capacity - booked;

                return (
                  <tr key={course.sectionId} className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-emerald-500/10 dark:bg-emerald-500/20" : ""}`}>
                    {/* FIX: Allowed wrapping on course name if needed */}
                    <td className="px-4 py-3 font-bold text-foreground">
                      {course.courseCode} <br className="hidden lg:block"/> <span className="font-normal text-muted-foreground">[{course.sectionName}]</span>
                    </td>
                    <td className="px-4 py-3 text-blue-500 font-semibold">{course.faculties || "TBA"}</td>
                    {/* FIX: Restrained width and forced wrapping for Prereqs */}
                    <td className="px-4 py-3 text-muted-foreground text-[11px] max-w-[150px] whitespace-normal break-words">
                      {course.prerequisiteCourses || "None"}
                    </td>
                    {/* FIX: Merged back into Seat / Booked format */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span>{capacity} / {booked}</span>
                        <span className={`text-xs font-bold ${available > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          ({available > 0 ? "+" : ""}{available})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderDesktopSchedule(course.sectionSchedule?.classSchedules)}</td>
                    <td className="px-4 py-3">{renderDesktopSchedule(course.labSchedules)}</td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{formatExam(course.sectionSchedule)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleCourse(course)} className={`flex h-7 w-7 items-center justify-center rounded-full border transition mx-auto ${isSelected ? "border-red-500 bg-red-500 text-white shadow-md hover:bg-red-600" : "border-border text-foreground hover:border-blue-500 hover:text-blue-500"}`}>
                        {isSelected ? "✕" : "＋"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── DESKTOP PAGINATION CONTROLS ── */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>
              {filteredCourses.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {itemsPerPage === -1 ? filteredCourses.length : Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="rounded p-1 hover:bg-muted disabled:opacity-50"
              >
                ◀
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="rounded p-1 hover:bg-muted disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW: CARD LIST (Hidden on Desktop) ── */}
      <div className="flex md:hidden flex-col gap-4">
        {paginatedCourses.map((course) => {
          const isSelected = selectedCourses.some((c) => c.sectionId === course.sectionId);
          const capacity = course.capacity || 0;
          const booked = course.consumedSeat || 0;
          const isFull = booked >= capacity;

          return (
            <div key={course.sectionId} className={`relative flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all ${isSelected ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground leading-none">{course.courseCode}-[{course.sectionName}]</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground uppercase">{course.faculties || "TBA"}</p>
                </div>
                <div className={`flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${isFull ? "border-red-500/30 bg-red-500/10 text-red-600" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                  {capacity}/{booked}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {renderMobilePills(course.sectionSchedule?.classSchedules, false)}
                {renderMobilePills(course.labSchedules, true)}
                {(!course.sectionSchedule?.classSchedules?.length && !course.labSchedules?.length) && <span className="text-xs text-muted-foreground">TBA</span>}
              </div>

              <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>📅</span>
                  <span className="truncate max-w-[200px]">{formatExam(course.sectionSchedule)}</span>
                </div>
                <button onClick={() => toggleCourse(course)} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${isSelected ? "border-red-500 bg-red-500 text-white shadow-md" : "border-border text-foreground"}`}>
                  {isSelected ? "✕" : "＋"}
                </button>
              </div>
            </div>
          );
        })}
        {filteredCourses.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
            No courses found matching your criteria.
          </div>
        )}
        
        {/* Mobile Pagination (Simplified) */}
        {filteredCourses.length > 0 && itemsPerPage !== -1 && (
           <div className="flex justify-center gap-4 py-2">
             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded border border-border bg-card disabled:opacity-50 text-sm">Previous</button>
             <span className="flex items-center text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded border border-border bg-card disabled:opacity-50 text-sm">Next</button>
           </div>
        )}
      </div>

      {/* ── FLOATING VIEW ROUTINE BUTTON & MODAL ── */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1 hover:bg-blue-700 z-40">
        <span className="relative">
          📅 
          {selectedCourses.length > 0 && (
            <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {selectedCourses.length}
            </span>
          )}
        </span>
        View Routine
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
           <div className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
             <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
               <div>
                 <h2 className="text-xl font-bold text-foreground">My Routine</h2>
                 <p className="text-sm font-medium text-muted-foreground">Total Credits: <span className={totalCredits > 18 ? "text-red-500" : "text-emerald-500"}>{totalCredits} / 25</span></p>
               </div>
               <div className="flex items-center gap-3">
                 <button onClick={() => alert("Routine Saved!")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">💾 Save</button>
                 <button onClick={() => setIsModalOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">✕</button>
               </div>
             </div>
             <div className="flex-1 overflow-auto p-6 bg-[#0f172a] dark:bg-slate-950">
               {selectedCourses.length === 0 ? (
                 <div className="flex h-full flex-col items-center justify-center text-slate-500"><p>No courses selected.</p></div>
               ) : (
                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCourses.map((course) => (
                      <div key={course.sectionId} className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 relative">
                        <button onClick={() => toggleCourse(course)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 text-xs font-bold">✕</button>
                        <h4 className="font-bold text-blue-400 text-sm">{course.courseCode} <span className="bg-slate-800 px-1 rounded text-slate-300 ml-1">{course.sectionName}</span></h4>
                        <div className="mt-2 space-y-1">{renderDesktopSchedule(course.sectionSchedule?.classSchedules)}</div>
                      </div>
                    ))}
                  </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}