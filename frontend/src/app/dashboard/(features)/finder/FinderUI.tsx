"use client";

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE USING THIS FILE:
// Run: npm install html-to-image
// This is required for the "Save as PNG" button to work.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import { CourseMold } from "@/lib/db/mold";

interface FinderUIProps {
  initialCourses: Partial<CourseMold>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY CALENDAR CONFIG
// These are the standard time slots used in the grid (rows).
// ─────────────────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  { label: "08:00 AM–09:20 AM", start: "08:00", end: "09:20" },
  { label: "09:30 AM–10:50 AM", start: "09:30", end: "10:50" },
  { label: "11:00 AM–12:20 PM", start: "11:00", end: "12:20" },
  { label: "12:30 PM–01:50 PM", start: "12:30", end: "13:50" },
  { label: "02:00 PM–03:20 PM", start: "14:00", end: "15:20" },
  { label: "03:30 PM–04:50 PM", start: "15:30", end: "16:50" },
  { label: "05:00 PM–06:20 PM", start: "17:00", end: "18:20" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─────────────────────────────────────────────────────────────────────────────
// DATA NORMALIZER
// Bridges the gap between Aiven MySQL (snake_case JSON strings) 
// and CDN Data (camelCase Objects).
// ─────────────────────────────────────────────────────────────────────────────
const normalizeCourse = (raw: any): Partial<CourseMold> => {
  let sectionSchedule = raw.sectionSchedule;

  if (!sectionSchedule && raw.class_schedule) {
    try {
      const classSchedules =
        typeof raw.class_schedule === "string"
          ? JSON.parse(raw.class_schedule)
          : raw.class_schedule;

      sectionSchedule = {
        classSchedules,
        midExamDate:      raw.mid_exam_date       || null,
        midExamStartTime: raw.mid_exam_start_time || null,
        midExamEndTime:   raw.mid_exam_end_time   || null,
        finalExamDate:      raw.final_exam_date       || null,
        finalExamStartTime: raw.final_exam_start_time || null,
        finalExamEndTime:   raw.final_exam_end_time   || null,
      };
    } catch {
      // Silently fail — schedule will show N/A
    }
  }

  let labSchedules = raw.labSchedules;

  if (!labSchedules && raw.lab_schedule) {
    try {
      labSchedules =
        typeof raw.lab_schedule === "string"
          ? JSON.parse(raw.lab_schedule)
          : raw.lab_schedule;
    } catch {
      // Silently fail
    }
  }

  return {
    ...raw,
    sectionId:   raw.sectionId   || raw.id,
    courseCode:  raw.courseCode  || raw.course_code,
    sectionName: raw.sectionName || raw.section_name,
    courseCredit: raw.courseCredit ?? raw.credits,
    consumedSeat: raw.consumedSeat ?? raw.consumed_seat,
    prerequisiteCourses: raw.prerequisiteCourses || raw.prerequisite_courses || null,
    faculties: raw.faculties,
    capacity:  raw.capacity,
    roomName:  raw.roomName || raw.room_name || null,
    sectionSchedule,
    labSchedules,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
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
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const start = formatTime12h(schedule.finalExamStartTime);
  const end   = formatTime12h(schedule.finalExamEndTime);
  if (start && end) return `${dateStr} ${start} – ${end}`;
  return dateStr;
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isInTimeSlot = (startTime: string, slotStart: string, slotEnd: string) => {
  const s = toMinutes(startTime);
  return s >= toMinutes(slotStart) - 5 && s <= toMinutes(slotEnd);
};

const getDayIndex = (day: string): number => {
  const map: Record<string, number> = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };
  return map[day?.toLowerCase()] ?? -1;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FinderUI({ initialCourses }: FinderUIProps) {

  const courses = useMemo(() => initialCourses.map(normalizeCourse), [initialCourses]);

  const [searchTerm,           setSearchTerm]           = useState("");
  const [hideFilled,           setHideFilled]           = useState(false);
  const [labReq,               setLabReq]               = useState<"ALL" | "WITH_LAB" | "NO_LAB">("ALL");
  const [selectedCourses,      setSelectedCourses]      = useState<Partial<CourseMold>[]>([]);
  const [isModalOpen,          setIsModalOpen]          = useState(false);
  const [isMobileSelectionOpen, setIsMobileSelectionOpen] = useState(false);
  const [currentPage,          setCurrentPage]          = useState(1);
  const [itemsPerPage,         setItemsPerPage]         = useState(25);

  const calendarRef = useRef<HTMLDivElement>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchTerm.toLowerCase();
      if (q) {
        const codeMatch    = course.courseCode?.toLowerCase().includes(q);
        const facultyMatch = course.faculties?.toLowerCase().includes(q);
        if (!codeMatch && !facultyMatch) return false;
      }
      if (hideFilled && (course.capacity || 0) <= (course.consumedSeat || 0)) return false;
      const hasLab = course.labSchedules && course.labSchedules.length > 0;
      if (labReq === "WITH_LAB" && !hasLab) return false;
      if (labReq === "NO_LAB"   &&  hasLab) return false;
      return true;
    });
  }, [courses, searchTerm, hideFilled, labReq]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, hideFilled, labReq, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredCourses.length / itemsPerPage);

  const paginatedCourses = useMemo(() => {
    if (itemsPerPage === -1) return filteredCourses;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const toggleCourse = (course: Partial<CourseMold>) => {
    setSelectedCourses((prev) => {
      const exists = prev.some((c) => c.sectionId === course.sectionId);
      return exists ? prev.filter((c) => c.sectionId !== course.sectionId) : [...prev, course];
    });
  };

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0);

  const handleDownloadPNG = async () => {
    if (!calendarRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(calendarRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff", // Add explicit white background for transparent grids
      });
      const link = document.createElement("a");
      link.download = "CRABU_Routine.png";
      link.href = dataUrl;
      link.click();
    } catch {
      alert("PNG export failed. Please try again.");
    }
  };

  const calendarGrid = useMemo(() => {
    type CalendarEntry = { course: Partial<CourseMold>; isLab: boolean; isConflict: boolean; };
    const grid: CalendarEntry[][][] = TIME_SLOTS.map(() => DAYS.map(() => []));
    const cellCounts: number[][] = TIME_SLOTS.map(() => new Array(7).fill(0));

    selectedCourses.forEach((course) => {
      (course.sectionSchedule?.classSchedules || []).forEach((s: any) => {
        const dayIdx = getDayIndex(s.day);
        if (dayIdx === -1) return;
        TIME_SLOTS.forEach((slot, slotIdx) => {
          if (isInTimeSlot(s.startTime, slot.start, slot.end)) {
            cellCounts[slotIdx][dayIdx]++;
            grid[slotIdx][dayIdx].push({ course, isLab: false, isConflict: false });
          }
        });
      });

      (course.labSchedules || []).forEach((s: any) => {
        const dayIdx = getDayIndex(s.day);
        if (dayIdx === -1) return;
        TIME_SLOTS.forEach((slot, slotIdx) => {
          if (isInTimeSlot(s.startTime, slot.start, slot.end)) {
            cellCounts[slotIdx][dayIdx]++;
            grid[slotIdx][dayIdx].push({ course, isLab: true, isConflict: false });
          }
        });
      });
    });

    TIME_SLOTS.forEach((_, slotIdx) => {
      DAYS.forEach((_, dayIdx) => {
        if (cellCounts[slotIdx][dayIdx] > 1) {
          grid[slotIdx][dayIdx] = grid[slotIdx][dayIdx].map((item) => ({ ...item, isConflict: true }));
        }
      });
    });

    return grid;
  }, [selectedCourses]);

  const renderScheduleCell = (schedules: any[] | null | undefined) => {
    if (!schedules || schedules.length === 0) return <span className="text-muted-foreground text-xs">N/A</span>;
    return (
      <div className="flex flex-col gap-0.5">
        {schedules.map((s, i) => (
          <div key={i} className="text-[11px] text-muted-foreground whitespace-nowrap">
            <span className="font-semibold text-foreground uppercase">{s.day?.substring(0, 3)}</span>{" "}
            {formatTime12h(s.startTime)} – {formatTime12h(s.endTime)}
          </div>
        ))}
      </div>
    );
  };

  const renderMobilePills = (schedules: any[] | null | undefined, isLab: boolean) => {
    if (!schedules || schedules.length === 0) return null;
    return schedules.map((s, i) => (
      <span key={i} className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        isLab ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" : "bg-primary/10 text-primary"
      }`}>
        {s.day?.substring(0, 3)} {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)}
        {isLab && <span className="ml-0.5 bg-purple-500/20 px-1 rounded text-[9px]">LAB</span>}
      </span>
    ));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* SEARCH & FILTER BAR */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input type="text" placeholder="Enter Course Code or Faculty Initial..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={hideFilled} onChange={(e) => setHideFilled(e.target.checked)} className="rounded border-border accent-primary"/>
              Hide Filled
            </label>

            <div className="relative">
              <select value={labReq} onChange={(e) => setLabReq(e.target.value as any)} className="appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-7 text-sm focus:border-primary focus:outline-none cursor-pointer">
                <option value="ALL">All Courses</option>
                <option value="WITH_LAB">Requires Lab</option>
                <option value="NO_LAB">No Lab</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {selectedCourses.length > 0 && (
          <div className="pt-2 border-t border-dashed border-border">
            <div className="hidden md:flex flex-wrap gap-1.5">
              {selectedCourses.map((course) => (
                <span key={course.sectionId} onClick={() => toggleCourse(course)} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/20 transition">
                  {course.courseCode}–[{course.sectionName}]–{course.faculties} <span className="text-primary/50 text-[10px] ml-1">✕</span>
                </span>
              ))}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileSelectionOpen(!isMobileSelectionOpen)} className="flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
                {selectedCourses.length} courses selected <span>{isMobileSelectionOpen ? "▲" : "▼"}</span>
              </button>
              {isMobileSelectionOpen && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedCourses.map((course) => (
                    <span key={course.sectionId} onClick={() => toggleCourse(course)} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                      {course.courseCode}–[{course.sectionName}] <span className="ml-1">✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Course Code</th>
                <th className="px-3 py-2.5">Fac. Init.</th>
                <th className="px-3 py-2.5">Prereq</th>
                <th className="px-3 py-2.5 text-center">Seat / Booked</th>
                <th className="px-3 py-2.5">Class Schedule</th>
                <th className="px-3 py-2.5">Lab Schedule</th>
                <th className="px-3 py-2.5">Exam Day</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCourses.map((course) => {
                const isSelected  = selectedCourses.some((c) => c.sectionId === course.sectionId);
                const capacity    = course.capacity    || 0;
                const booked      = course.consumedSeat || 0;
                const available   = capacity - booked;

                return (
                  <tr key={course.sectionId} className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-emerald-500/10 dark:bg-emerald-500/10" : ""}`}>
                    <td className="px-3 py-2 font-semibold text-foreground leading-tight">
                      {course.courseCode} <span className="block text-xs font-normal text-muted-foreground">[{course.sectionName}]</span>
                    </td>
                    <td className="px-3 py-2 text-primary font-semibold">{course.faculties || "TBA"}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs max-w-[140px] whitespace-normal">{course.prerequisiteCourses || "None"}</td>
                    <td className="px-3 py-2 text-center text-sm">
                    <div className="flex flex-col items-center justify-center leading-tight">
                        <span>{booked} / {capacity}</span>
                        <span
                        className={`text-[11px] font-bold mt-0.5 ${
                            available > 0
                            ? "text-emerald-500"
                            : available < 0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                        >
                        ({available > 0 ? `+${available}` : available})
                        </span>
                    </div>
                    </td>
                    <td className="px-3 py-2">{renderScheduleCell(course.sectionSchedule?.classSchedules)}</td>
                    <td className="px-3 py-2">{renderScheduleCell(course.labSchedules)}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground whitespace-nowrap">{formatExam(course.sectionSchedule)}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleCourse(course)} className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition mx-auto ${isSelected ? "border-destructive bg-destructive text-white hover:opacity-80" : "border-border text-foreground hover:border-primary hover:text-primary"}`}>
                        {isSelected ? "✕" : "+"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedCourses.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground text-sm">No courses found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Rows per page:</span>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="rounded border border-border bg-background px-1.5 py-0.5 text-xs focus:outline-none">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{filteredCourses.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}–${itemsPerPage === -1 ? filteredCourses.length : Math.min(currentPage * itemsPerPage, filteredCourses.length)}` : "0"} of {filteredCourses.length}</span>
            <div className="flex gap-0.5">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded px-1.5 py-0.5 hover:bg-muted disabled:opacity-40">◀</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded px-1.5 py-0.5 hover:bg-muted disabled:opacity-40">▶</button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="flex md:hidden flex-col gap-2.5">
        {paginatedCourses.map((course) => {
          const isSelected = selectedCourses.some((c) => c.sectionId === course.sectionId);
          const capacity   = course.capacity    || 0;
          const booked     = course.consumedSeat || 0;
          const isFull     = booked >= capacity;

          return (
            <div key={course.sectionId} className={`relative flex flex-col gap-2 rounded-lg border p-3 shadow-sm transition-all ${isSelected ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none">{course.courseCode}–[{course.sectionName}]</h3>
                  <p className="mt-0.5 text-xs text-primary font-semibold uppercase">{course.faculties || "TBA"}</p>
                </div>
                <div className={`flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${isFull ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                  {capacity}/{booked}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {renderMobilePills(course.sectionSchedule?.classSchedules, false)}
                {renderMobilePills(course.labSchedules, true)}
                {!course.sectionSchedule?.classSchedules?.length && !course.labSchedules?.length && <span className="text-xs text-muted-foreground">TBA</span>}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📅</span>
                  <span className="truncate max-w-[200px]">{formatExam(course.sectionSchedule)}</span>
                </div>
                <button onClick={() => toggleCourse(course)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition ${isSelected ? "border-destructive bg-destructive text-white" : "border-border text-foreground"}`}>
                  {isSelected ? "✕" : "+"}
                </button>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="py-12 text-center text-muted-foreground bg-card rounded-lg border border-border text-sm">
            No courses found matching your criteria.
          </div>
        )}

        {filteredCourses.length > 0 && itemsPerPage !== -1 && (
          <div className="flex justify-center items-center gap-3 py-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded border border-border bg-card disabled:opacity-50 text-xs">Previous</button>
            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded border border-border bg-card disabled:opacity-50 text-xs">Next</button>
          </div>
        )}
      </div>

      {/* FLOATING "VIEW ROUTINE" BUTTON */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 z-40">
        <span className="relative">
          📅
          {selectedCourses.length > 0 && (
            <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] text-white font-bold">
              {selectedCourses.length}
            </span>
          )}
        </span>
        View Routine
      </button>

      {/* WEEKLY CALENDAR ROUTINE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2">
          <div className="relative flex h-[95vh] w-full max-w-7xl flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3 shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">My Routine</h2>
                <p className="text-xs text-muted-foreground">
                  Total Credits: <span className={`font-bold ${totalCredits > 18 ? "text-destructive" : "text-emerald-500"}`}>{totalCredits} / 25</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => alert("Connect this to your save API!")} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                  💾 Save Routine
                </button>
                <button onClick={handleDownloadPNG} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition">
                  ⬇ Save as PNG
                </button>
                <button onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm">
                  ✕
                </button>
              </div>
            </div>

            {/* Calendar body */}
            <div className="flex-1 overflow-auto p-4 bg-background">
              {selectedCourses.length === 0 ? (
                <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground text-sm">
                  No courses selected. Close this and click + on any course.
                </div>
              ) : (
                <div ref={calendarRef} className="bg-background dark:bg-slate-950 rounded-lg border border-border overflow-hidden min-w-[850px] shadow-sm">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="w-[120px] px-3 py-3 text-left font-semibold text-muted-foreground border-r border-border text-xs">Time/Day</th>
                        {DAYS.map((day) => <th key={day} className="px-2 py-3 text-center font-semibold text-muted-foreground border-r border-border last:border-r-0 text-xs">{day}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot, slotIdx) => (
                        <tr key={slot.label} className="border-b border-border last:border-b-0">
                          <td className="px-3 py-2 align-top border-r border-border text-muted-foreground whitespace-nowrap leading-tight text-[11px] font-medium bg-muted/10">
                            {slot.label}
                          </td>
                          {DAYS.map((_, dayIdx) => {
                            const entries = calendarGrid[slotIdx][dayIdx];
                            return (
                              <td key={dayIdx} className="px-1.5 py-1.5 align-top border-r border-border last:border-r-0 min-w-[110px]">
                                {entries.length === 0 ? (
                                  <div className="min-h-[60px]" />
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    {entries.map((item, i) => (
                                      <div key={i} className={`relative rounded p-2 leading-tight shadow-sm border ${
                                        item.isConflict ? "bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20" : 
                                        item.isLab ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" : 
                                        "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20"
                                      }`}>
                                        <button onClick={() => toggleCourse(item.course)} className="absolute top-1 right-1.5 text-[10px] opacity-40 hover:opacity-100 hover:text-destructive transition" title="Remove">✕</button>
                                        <div className="font-bold pr-3 text-[11px] tracking-tight">
                                          {item.course.courseCode} <span className="font-normal opacity-80 ml-0.5">[{item.course.sectionName}]</span>
                                        </div>
                                        {item.course.roomName && <div className="opacity-75 text-[10px] mt-0.5 flex items-center gap-1">📍 {item.course.roomName}</div>}
                                        <div className="opacity-75 text-[10px] mt-0.5 flex items-center gap-1">👤 {item.course.faculties || "TBA"}</div>
                                        {item.isLab && <div className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 inline-block">LAB</div>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Legend Footer for PNG output */}
                  <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"><div className="h-3 w-3 rounded border border-primary/30 bg-primary/10" />Class</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"><div className="h-3 w-3 rounded border border-purple-500/30 bg-purple-500/10" />Lab</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"><div className="h-3 w-3 rounded border border-destructive/30 bg-destructive/10" />Conflict</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}