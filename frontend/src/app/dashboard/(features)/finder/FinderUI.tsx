"use client";

// ─────────────────────────────────────────────────────────────────────────────
// BEFORE USING: Ensure html-to-image is installed (npm install html-to-image)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import { CourseMold } from "@/lib/db/mold";

interface FinderUIProps {
  initialCourses: Partial<CourseMold>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & NORMALIZERS
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

const normalizeCourse = (raw: any): Partial<CourseMold> => {
  let sectionSchedule = raw.sectionSchedule;
  if (!sectionSchedule && raw.class_schedule) {
    try {
      sectionSchedule = {
        classSchedules: typeof raw.class_schedule === "string" ? JSON.parse(raw.class_schedule) : raw.class_schedule,
        finalExamDate: raw.final_exam_date || null,
        finalExamStartTime: raw.final_exam_start_time || null,
        finalExamEndTime: raw.final_exam_end_time || null,
      };
    } catch {}
  }
  let labSchedules = raw.labSchedules;
  if (!labSchedules && raw.lab_schedule) {
    try { labSchedules = typeof raw.lab_schedule === "string" ? JSON.parse(raw.lab_schedule) : raw.lab_schedule; } catch {}
  }
  return {
    ...raw,
    sectionId: raw.sectionId || raw.id,
    courseCode: raw.courseCode || raw.course_code,
    sectionName: raw.sectionName || raw.section_name,
    courseCredit: raw.courseCredit ?? raw.credits,
    consumedSeat: raw.consumedSeat ?? raw.consumed_seat,
    prerequisiteCourses: raw.prerequisiteCourses || raw.prerequisite_courses || null,
    faculties: raw.faculties,
    capacity: raw.capacity,
    roomName: raw.roomName || raw.room_name || null,
    sectionSchedule,
    labSchedules,
  };
};

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
  if (start && end) return `${dateStr} ${start} – ${end}`;
  return dateStr;
};

const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const isInTimeSlot = (start: string, slotStart: string, slotEnd: string) => {
  const s = toMinutes(start); return s >= toMinutes(slotStart) - 5 && s <= toMinutes(slotEnd);
};
const getDayIndex = (day: string) => DAYS.findIndex(d => d.toLowerCase().startsWith(day.toLowerCase().substring(0, 3)));

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FinderUI({ initialCourses }: FinderUIProps) {
  const courses = useMemo(() => initialCourses.map(normalizeCourse), [initialCourses]);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ hideFilled: false, avoidFaculties: [] as string[], labFilter: 'all', onlySelected: false });
  const [sortConfig, setSortConfig] = useState({ key: null as string | null, direction: 'asc' });
  const [selectedCourses, setSelectedCourses] = useState<Partial<CourseMold>[]>([]);
  const [displayCount, setDisplayCount] = useState(50);
  
  // UI Toggles
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSelectionOpen, setIsMobileSelectionOpen] = useState(false);
  
  // Faculty Search State
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyDropdownOpen, setFacultyDropdownOpen] = useState(false);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) setFilterDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Faculty List
  const cdnFacultyList = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => { if (c.faculties) c.faculties.split(',').forEach(f => { const init = f.trim().toUpperCase(); if (init && init !== 'TBA') set.add(init); }); });
    return Array.from(set).sort();
  }, [courses]);

  // Filtering & Sorting
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.courseCode?.toLowerCase().includes(q) || c.faculties?.toLowerCase().includes(q));
    }
    if (filters.hideFilled) {
      filtered = filtered.filter(c => (c.capacity || 0) > (c.consumedSeat || 0));
    }
    if (filters.avoidFaculties.length > 0) {
      filtered = filtered.filter(c => !filters.avoidFaculties.some(f => c.faculties?.toUpperCase().includes(f)));
    }
    if (filters.labFilter === 'with-lab') filtered = filtered.filter(c => c.labSchedules && c.labSchedules.length > 0);
    if (filters.labFilter === 'without-lab') filtered = filtered.filter(c => !c.labSchedules || c.labSchedules.length === 0);
    if (filters.onlySelected) filtered = filtered.filter(c => selectedCourses.some(sc => sc.sectionId === c.sectionId));

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Partial<CourseMold>];
        let bVal: any = b[sortConfig.key as keyof Partial<CourseMold>];
        if (sortConfig.key === 'available') {
          aVal = (a.capacity || 0) - (a.consumedSeat || 0); bVal = (b.capacity || 0) - (b.consumedSeat || 0);
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [courses, searchTerm, filters, sortConfig, selectedCourses]);

  const displayedCourses = useMemo(() => filteredCourses.slice(0, displayCount), [filteredCourses, displayCount]);
  const totalCredits = selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0);
  const activeFilterCount = (filters.hideFilled ? 1 : 0) + filters.avoidFaculties.length + (filters.labFilter !== 'all' ? 1 : 0) + (filters.onlySelected ? 1 : 0);

  // Handlers
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else { setSortConfig({ key: null, direction: 'asc' }); return; }
    }
    setSortConfig({ key, direction });
  };

  const toggleCourse = (course: Partial<CourseMold>) => {
    setSelectedCourses(prev => {
      const exists = prev.some(c => c.sectionId === course.sectionId);
      return exists ? prev.filter(c => c.sectionId !== course.sectionId) : [...prev, course];
    });
  };

  const handleDownloadPNG = async () => {
    if (!calendarRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(calendarRef.current, { quality: 0.95, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = "CRABU_Routine.png"; link.href = dataUrl; link.click();
    } catch { alert("Failed to export PNG."); }
  };

  // Calendar Engine
  const calendarGrid = useMemo(() => {
    type Entry = { course: Partial<CourseMold>; isLab: boolean; isConflict: boolean; };
    const grid: Entry[][][] = TIME_SLOTS.map(() => DAYS.map(() => []));
    const cellCounts: number[][] = TIME_SLOTS.map(() => new Array(7).fill(0));

    selectedCourses.forEach(course => {
      // FIX: Added `| undefined | null` to the schedules type
      const addToGrid = (schedules: any[] | undefined | null, isLab: boolean) => {
        (schedules || []).forEach(s => {
          const dayIdx = getDayIndex(s.day);
          if (dayIdx !== -1) {
            TIME_SLOTS.forEach((slot, slotIdx) => {
              if (isInTimeSlot(s.startTime, slot.start, slot.end)) {
                cellCounts[slotIdx][dayIdx]++;
                grid[slotIdx][dayIdx].push({ course, isLab, isConflict: false });
              }
            });
          }
        });
      };
      
      addToGrid(course.sectionSchedule?.classSchedules, false);
      addToGrid(course.labSchedules, true);
    });

    TIME_SLOTS.forEach((_, slotIdx) => {
      DAYS.forEach((_, dayIdx) => {
        if (cellCounts[slotIdx][dayIdx] > 1) grid[slotIdx][dayIdx] = grid[slotIdx][dayIdx].map(item => ({ ...item, isConflict: true }));
      });
    });
    return grid;
  }, [selectedCourses]);

  // Icons & Renderers
  const renderSortIcon = (key: string) => {
    const active = sortConfig.key === key;
    return (
      <div className="flex flex-col -space-y-[6px] ml-1 opacity-50">
        <span className={`text-[10px] ${active && sortConfig.direction === 'asc' ? 'text-primary opacity-100' : ''}`}>▲</span>
        <span className={`text-[10px] ${active && sortConfig.direction === 'desc' ? 'text-primary opacity-100' : ''}`}>▼</span>
      </div>
    );
  };

  const renderScheduleCell = (schedules: any[] | undefined | null) => {
    if (!schedules?.length) return <span className="text-muted-foreground text-xs">N/A</span>;
    return (
      <div className="flex flex-col gap-0.5">
        {schedules.map((s, i) => (
          <div key={i} className="text-[11px] text-muted-foreground whitespace-nowrap">
            <span className="font-semibold text-foreground uppercase">{s.day?.substring(0, 3)}</span> {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Finder</h1>
        <p className="text-sm text-muted-foreground">Search, filter, and build your perfect routine.</p>
      </div>

      {/* TOP CONTROLS (B.O.R.A.C.L.E Style) */}
      <div className="flex gap-2 relative z-30">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Enter Course Code or Faculty Initial..." 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setDisplayCount(50); }} 
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <button onClick={() => setShowFilterModal(true)} className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 font-medium text-sm transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters
        </button>

        {activeFilterCount > 0 && (
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} className="h-full px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg flex items-center justify-center transition-colors shadow-sm">
              <div className="relative flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="absolute -top-2 -right-2 bg-card text-destructive text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold ring-2 ring-destructive">
                  {activeFilterCount}
                </span>
              </div>
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground text-sm">Active Filters</h3>
                  <button onClick={() => { setFilters({ hideFilled: false, avoidFaculties: [], labFilter: 'all', onlySelected: false }); setFilterDropdownOpen(false); }} className="text-xs text-destructive hover:underline">Clear All</button>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                  {filters.hideFilled && (
                    <button onClick={() => setFilters(p => ({ ...p, hideFilled: false }))} className="w-full flex justify-between items-center px-3 py-2 hover:bg-muted rounded text-sm group">
                      <span className="flex items-center gap-2 text-foreground"><div className="w-2 h-2 rounded-full bg-primary" />Hide Filled</span>
                      <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                    </button>
                  )}
                  {filters.onlySelected && (
                    <button onClick={() => setFilters(p => ({ ...p, onlySelected: false }))} className="w-full flex justify-between items-center px-3 py-2 hover:bg-muted rounded text-sm group">
                      <span className="flex items-center gap-2 text-foreground"><div className="w-2 h-2 rounded-full bg-emerald-500" />Only Selected</span>
                      <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                    </button>
                  )}
                  {filters.labFilter !== 'all' && (
                    <button onClick={() => setFilters(p => ({ ...p, labFilter: 'all' }))} className="w-full flex justify-between items-center px-3 py-2 hover:bg-muted rounded text-sm group">
                      <span className="flex items-center gap-2 text-foreground"><div className="w-2 h-2 rounded-full bg-purple-500" />{filters.labFilter === 'with-lab' ? 'Has Lab' : 'No Lab'}</span>
                      <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                    </button>
                  )}
                  {filters.avoidFaculties.map(f => (
                    <button key={f} onClick={() => setFilters(p => ({ ...p, avoidFaculties: p.avoidFaculties.filter(x => x !== f) }))} className="w-full flex justify-between items-center px-3 py-2 hover:bg-muted rounded text-sm group">
                      <span className="flex items-center gap-2 text-foreground"><div className="w-2 h-2 rounded-full bg-destructive" />Avoid: {f}</span>
                      <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SELECTED COURSES ACCORDION */}
      {selectedCourses.length > 0 && (
        <div className="z-20">
          <div className="hidden md:flex flex-wrap gap-1.5 p-3 rounded-lg border border-border bg-card">
            <span className="text-sm font-semibold text-foreground mr-2 py-0.5">{selectedCourses.length} Selected:</span>
            {selectedCourses.map((course) => (
              <span key={course.sectionId} onClick={() => toggleCourse(course)} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition">
                {course.courseCode}–[{course.sectionName}] <span className="ml-1 text-[10px]">✕</span>
              </span>
            ))}
          </div>
          <div className="md:hidden border border-border rounded-lg bg-card overflow-hidden">
            <button onClick={() => setIsMobileSelectionOpen(!isMobileSelectionOpen)} className="w-full px-4 py-3 flex justify-between items-center text-sm font-bold text-primary bg-primary/5">
              {selectedCourses.length} courses selected <span>{isMobileSelectionOpen ? "▲" : "▼"}</span>
            </button>
            {isMobileSelectionOpen && (
              <div className="p-3 flex flex-wrap gap-2 border-t border-border">
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

      {/* ── DESKTOP TABLE ─────────────────────────────────────────────────── */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden shadow-sm mt-2 z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground select-none">
              <tr>
                <th className="py-3 px-2 w-[140px] cursor-pointer hover:bg-muted/80 transition" onClick={() => handleSort('courseCode')}>
                  <div className="flex items-center">Course Code {renderSortIcon('courseCode')}</div>
                </th>
                <th className="py-3 px-2 min-w-[100px] cursor-pointer hover:bg-muted/80 transition" onClick={() => handleSort('faculties')}>
                  <div className="flex items-center">Fac. Init. {renderSortIcon('faculties')}</div>
                </th>
                <th className="py-3 px-2 w-[150px]">Prereq</th>
                <th className="py-3 px-2 text-center min-w-[120px] cursor-pointer hover:bg-muted/80 transition" onClick={() => handleSort('capacity')}>
                  <div className="flex items-center justify-center">Seat / Booked {renderSortIcon('capacity')}</div>
                </th>
                <th className="py-3 px-2 min-w-[160px]">Class Schedule</th>
                <th className="py-3 px-2 min-w-[160px]">Lab Schedule</th>
                <th className="py-3 px-2 min-w-[120px]">Exam Day</th>
                <th className="py-3 px-2 text-center min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedCourses.map((course) => {
                const isSelected  = selectedCourses.some((c) => c.sectionId === course.sectionId);
                const capacity    = course.capacity || 0;
                const booked      = course.consumedSeat || 0;
                const available   = capacity - booked;

                return (
                  <tr key={course.sectionId} className={`transition-colors hover:bg-muted/40 ${isSelected ? "bg-emerald-500/10 dark:bg-emerald-500/10" : ""}`}>
                    <td className="py-3 px-2 font-medium text-foreground align-middle leading-tight">
                      {course.courseCode} <span className="block text-[11px] font-normal text-muted-foreground">[{course.sectionName}]</span>
                    </td>
                    <td className="py-3 px-2 font-medium text-primary align-middle">{course.faculties || "TBA"}</td>
                    <td className="py-3 px-2 text-muted-foreground text-[11px] max-w-[150px] whitespace-normal break-words align-middle">{course.prerequisiteCourses || "None"}</td>
                    <td className="py-3 px-2 text-center align-middle">
                      <div className="flex flex-col items-center justify-center leading-tight">
                        <span className="text-sm font-medium">{capacity} / {booked}</span>
                        <span className={`text-[11px] font-bold mt-0.5 ${available > 0 ? "text-emerald-500" : available < 0 ? "text-destructive" : "text-foreground"}`}>
                          ({available > 0 ? `+${available}` : available})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle">{renderScheduleCell(course.sectionSchedule?.classSchedules)}</td>
                    <td className="py-3 px-2 align-middle">{renderScheduleCell(course.labSchedules)}</td>
                    <td className="py-3 px-2 text-[11px] text-muted-foreground whitespace-nowrap align-middle">{formatExam(course.sectionSchedule)}</td>
                    <td className="py-3 px-2 text-center align-middle">
                      <button onClick={() => toggleCourse(course)} className={`flex h-7 w-7 items-center justify-center rounded-lg border transition mx-auto ${isSelected ? "border-destructive bg-destructive text-destructive-foreground hover:opacity-80" : "border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/10"}`}>
                        {isSelected ? "✕" : "+"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Trigger */}
        {displayCount < filteredCourses.length && (
          <div className="p-4 border-t border-border flex flex-col items-center justify-center bg-muted/10">
            <span className="text-xs text-muted-foreground mb-3">Showing {displayCount} of {filteredCourses.length} courses</span>
            <button onClick={() => setDisplayCount(prev => Math.min(prev + 50, filteredCourses.length))} className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm rounded-lg transition border border-border shadow-sm">
              Load More
            </button>
          </div>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="flex md:hidden flex-col gap-3 mt-2">
        {displayedCourses.map((course) => {
          const isSelected = selectedCourses.some((c) => c.sectionId === course.sectionId);
          const capacity = course.capacity || 0; const booked = course.consumedSeat || 0; const available = capacity - booked;

          return (
            <div key={course.sectionId} className={`relative flex flex-col gap-2 rounded-xl border p-3.5 shadow-sm transition-all ${isSelected ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">{course.courseCode} <span className="text-sm font-normal text-muted-foreground">[{course.sectionName}]</span></h3>
                  <p className="mt-0.5 text-xs text-primary font-semibold uppercase">{course.faculties || "TBA"}</p>
                </div>
                <div className={`flex flex-col items-center rounded-lg px-2 py-1 text-xs font-bold border ${available < 0 ? "border-destructive/30 bg-destructive/10 text-destructive" : available > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border bg-muted text-foreground"}`}>
                  <span>{capacity}/{booked}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(course.sectionSchedule?.classSchedules || []).map((s:any, i:number) => (
                  <span key={i} className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                    {s.day?.substring(0, 3)} {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)}
                  </span>
                ))}
                {(course.labSchedules || []).map((s:any, i:number) => (
                  <span key={i} className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {s.day?.substring(0, 3)} {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)} <span className="ml-1 bg-purple-500/20 px-1 rounded">LAB</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5">📅 {formatExam(course.sectionSchedule)}</span>
                <button onClick={() => toggleCourse(course)} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition ${isSelected ? "border-destructive bg-destructive text-destructive-foreground shadow-md" : "border-border text-foreground bg-muted/50"}`}>
                  {isSelected ? "✕" : "+"}
                </button>
              </div>
            </div>
          );
        })}
        {displayCount < filteredCourses.length && (
          <div className="text-center py-4">
            <button onClick={() => setDisplayCount(prev => Math.min(prev + 50, filteredCourses.length))} className="px-6 py-2.5 bg-muted border border-border text-foreground text-sm font-medium rounded-lg w-full">
              Load More Courses
            </button>
          </div>
        )}
      </div>

      {/* FILTER MODAL (B.O.R.A.C.L.E Perfect) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowFilterModal(false)}>
          <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl z-[70] overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-lg font-bold text-foreground">Filters</h2>
                <p className="text-xs text-muted-foreground">Customize your course view</p>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors"><span className="text-muted-foreground">✕</span></button>
            </div>

            <div className="p-5 space-y-6 bg-card text-sm">
              
              {/* Avoid Faculties UI */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Avoid Faculties</label>
                <div className="relative">
                  <div className="flex items-center w-full bg-background border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                    <input 
                      type="text" placeholder="Search faculties..." value={facultySearch}
                      onChange={(e) => { setFacultySearch(e.target.value); setFacultyDropdownOpen(true); }}
                      onFocus={() => setFacultyDropdownOpen(true)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button onClick={() => setFacultyDropdownOpen(!facultyDropdownOpen)} className="px-3 py-2.5 text-muted-foreground hover:bg-muted border-l border-border transition-colors">▼</button>
                  </div>
                  {facultyDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto p-1">
                      {cdnFacultyList.filter(f => f.toLowerCase().includes(facultySearch.toLowerCase())).map(f => (
                        <button 
                          key={f} 
                          onClick={() => {
                            if (!filters.avoidFaculties.includes(f)) setFilters(p => ({ ...p, avoidFaculties: [...p.avoidFaculties, f] }));
                            setFacultySearch(""); setFacultyDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-foreground rounded text-sm transition-colors"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filters.avoidFaculties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {filters.avoidFaculties.map(f => (
                      <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                        {f} <button onClick={() => setFilters(p => ({ ...p, avoidFaculties: p.avoidFaculties.filter(x => x !== f) }))} className="hover:text-destructive/70 transition">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border transition-colors">
                  <input type="checkbox" checked={filters.onlySelected} onChange={e => setFilters(p => ({ ...p, onlySelected: e.target.checked }))} className="w-5 h-5 rounded border-border accent-emerald-500 bg-background" />
                  <div>
                    <span className="block font-medium text-foreground">Only Show Selected</span>
                    <span className="text-[11px] text-muted-foreground">Filter list to display only your routine</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border transition-colors">
                  <input type="checkbox" checked={filters.hideFilled} onChange={e => setFilters(p => ({ ...p, hideFilled: e.target.checked }))} className="w-5 h-5 rounded border-border accent-primary bg-background" />
                  <div>
                    <span className="block font-medium text-foreground">Hide Filled Sections</span>
                    <span className="text-[11px] text-muted-foreground">Remove sections with no available seats</span>
                  </div>
                </label>
              </div>

              {/* Segmented Control */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Lab Requirement</label>
                <div className="flex p-1 bg-muted rounded-lg border border-border">
                  <button onClick={() => setFilters(p => ({ ...p, labFilter: 'all' }))} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filters.labFilter === 'all' ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}>All Courses</button>
                  <button onClick={() => setFilters(p => ({ ...p, labFilter: 'with-lab' }))} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filters.labFilter === 'with-lab' ? 'bg-card text-purple-500 shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}>With Labs</button>
                  <button onClick={() => setFilters(p => ({ ...p, labFilter: 'without-lab' }))} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filters.labFilter === 'without-lab' ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}>Without Labs</button>
                </div>
              </div>

            </div>

            <div className="flex gap-3 p-4 border-t border-border bg-muted/30">
              <button onClick={() => { setFilters({ hideFilled: false, avoidFaculties: [], labFilter: 'all', onlySelected: false }); setShowFilterModal(false); }} className="flex-1 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-lg text-sm transition">Reset</button>
              <button onClick={() => setShowFilterModal(false)} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm transition shadow-sm">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING VIEW ROUTINE BUTTON */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition hover:-translate-y-0.5 z-40">
        <span className="relative">
          📅
          {selectedCourses.length > 0 && (
            <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold border-2 border-primary">
              {selectedCourses.length}
            </span>
          )}
        </span>
        View Routine
      </button>

      {/* WEEKLY CALENDAR ROUTINE MODAL (B.O.R.A.C.L.E Visuals) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-2 md:p-6">
          <div className="relative flex h-[95vh] w-full max-w-[1400px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border bg-muted/40 px-5 py-4 shrink-0 gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">My Routine</h2>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  Total Credits: <span className={`font-bold ${totalCredits > 18 ? "text-destructive" : "text-emerald-500"}`}>{totalCredits} / 25</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => alert("Routine Saved!")} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm">
                  💾 Save Routine
                </button>
                <button onClick={handleDownloadPNG} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm">
                  ⬇ Save as PNG
                </button>
                <button onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted bg-background ml-auto sm:ml-2">
                  ✕
                </button>
              </div>
            </div>

            {/* Calendar Body */}
            <div className="flex-1 overflow-auto p-4 bg-[#0a0f1c] dark:bg-[#060913]">
              {selectedCourses.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  No courses selected. Close this and click + on any course.
                </div>
              ) : (
                <div ref={calendarRef} className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden min-w-[900px] shadow-lg text-slate-200">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#1e293b] bg-[#0f172a]">
                        <th className="w-[110px] px-3 py-3.5 text-left font-bold text-slate-400 border-r border-[#1e293b] text-[10px] uppercase tracking-wider">Time / Day</th>
                        {DAYS.map((day) => <th key={day} className="px-2 py-3.5 text-center font-bold text-slate-400 border-r border-[#1e293b] last:border-r-0 text-[10px] uppercase tracking-wider">{day}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot, slotIdx) => (
                        <tr key={slot.label} className="border-b border-[#1e293b] last:border-b-0">
                          <td className="px-3 py-2 align-top border-r border-[#1e293b] text-slate-400 font-medium bg-[#0b1121] text-[10px] leading-tight">
                            {slot.label.split("–").map((t, i) => <div key={i}>{t}</div>)}
                          </td>
                          {DAYS.map((_, dayIdx) => {
                            const entries = calendarGrid[slotIdx][dayIdx];
                            return (
                              <td key={dayIdx} className="px-1.5 py-1.5 align-top border-r border-[#1e293b] last:border-r-0 min-w-[120px]">
                                {entries.length === 0 ? ( <div className="min-h-[64px]" /> ) : (
                                  <div className="flex flex-col gap-1.5 h-full">
                                    {entries.map((item, i) => (
                                      <div key={i} className={`relative rounded-lg p-2.5 shadow-sm border ${
                                        item.isConflict ? "bg-red-950/40 border-red-900/50 text-red-200" : 
                                        item.isLab ? "bg-[#2d1b4e] border-[#4c2a85] text-[#d8b4fe]" : 
                                        "bg-[#1e293b] border-[#334155] text-blue-100"
                                      }`}>
                                        <button onClick={() => toggleCourse(item.course)} className="absolute top-1.5 right-1.5 text-[10px] opacity-40 hover:opacity-100 hover:text-red-400 transition bg-black/20 rounded-full w-4 h-4 flex items-center justify-center">✕</button>
                                        <div className="font-bold pr-4 text-xs tracking-tight">
                                          {item.course.courseCode} <span className="font-medium opacity-70 ml-0.5">{item.course.sectionName}</span>
                                        </div>
                                        <div className="opacity-70 text-[10px] mt-1 flex items-center gap-1 font-medium">📍 {item.course.roomName || "TBA"}</div>
                                        <div className="opacity-70 text-[10px] mt-0.5 flex items-center gap-1 font-medium">👤 {item.course.faculties || "TBA"}</div>
                                        {item.isLab && <div className="mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/50 inline-block text-purple-300">LAB</div>}
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
                  <div className="flex justify-center md:justify-end gap-5 px-5 py-3 border-t border-[#1e293b] bg-[#0b1121]">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider"><div className="h-2.5 w-2.5 rounded bg-[#1e293b] border border-[#334155]" />Class</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider"><div className="h-2.5 w-2.5 rounded bg-[#2d1b4e] border border-[#4c2a85]" />Lab</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider"><div className="h-2.5 w-2.5 rounded bg-red-950/40 border border-red-900/50" />Conflict</div>
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