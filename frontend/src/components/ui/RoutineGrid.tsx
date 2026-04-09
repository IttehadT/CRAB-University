"use client";

import { useMemo } from "react";
import { CourseMold } from "@/lib/db/mold";

interface RoutineGridProps {
  courses: Partial<CourseMold>[];
  showExams?: boolean;
}

// ── CONSTANTS & HELPERS ──
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

const formatTime12h = (time24?: string | null) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const isInTimeSlot = (start: string, slotStart: string, slotEnd: string) => {
  const s = toMinutes(start); return s >= toMinutes(slotStart) - 5 && s <= toMinutes(slotEnd);
};
const getDayIndex = (day: string) => DAYS.findIndex(d => d.toLowerCase().startsWith(day.toLowerCase().substring(0, 3)));

/**
 * ── REUSABLE ROUTINE GRID COMPONENT ─────────────────────────────────────────
 * Renders the beautiful desktop grid, mobile cards, and exam schedule.
 * Driven entirely by our global semantic CSS variables for perfect theming.
 */
export function RoutineGrid({ courses, showExams = true }: RoutineGridProps) {
  
  // 1. Calculate Grid Engine
  const calendarGrid = useMemo(() => {
    type Entry = { course: Partial<CourseMold>; isLab: boolean; isConflict: boolean; };
    const grid: Entry[][][] = TIME_SLOTS.map(() => DAYS.map(() => []));
    const cellCounts: number[][] = TIME_SLOTS.map(() => new Array(7).fill(0));

    courses.forEach(course => {
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
        if (cellCounts[slotIdx][dayIdx] > 1) {
          grid[slotIdx][dayIdx] = grid[slotIdx][dayIdx].map(item => ({ ...item, isConflict: true }));
        }
      });
    });
    return grid;
  }, [courses]);

  // 2. Calculate Exam Engine
  const examRows = useMemo(() => {
    const rows: { courseCode: string; sectionName: string; type: string; date: string; time: string; rawDate: string; }[] = [];
    courses.forEach(c => {
      const s = c.sectionSchedule as any;
      if (s?.midExamDate) rows.push({
        courseCode: c.courseCode || "", sectionName: c.sectionName || "", type: "MID",
        date: new Date(s.midExamDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
        time: `${formatTime12h(s.midExamStartTime)} – ${formatTime12h(s.midExamEndTime)}`,
        rawDate: s.midExamDate,
      });
      if (s?.finalExamDate) rows.push({
        courseCode: c.courseCode || "", sectionName: c.sectionName || "", type: "FINAL",
        date: new Date(s.finalExamDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
        time: `${formatTime12h(s.finalExamStartTime)} – ${formatTime12h(s.finalExamEndTime)}`,
        rawDate: s.finalExamDate,
      });
    });
    rows.sort((a, b) => {
      const da = new Date(a.rawDate).getTime();
      const db = new Date(b.rawDate).getTime();
      return da !== db ? da - db : a.time.localeCompare(b.time);
    });
    return rows;
  }, [courses]);

  if (courses.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── DESKTOP GRID ── */}
      <div className="hidden md:block bg-card rounded-2xl border border-border overflow-x-auto shadow-sm">
        <div className="min-w-[900px]">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-[130px] px-4 py-4 text-left font-bold text-muted-foreground border-r border-border text-[11px] uppercase tracking-wider">Time / Day</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-3 py-4 text-center font-bold text-muted-foreground border-r border-border last:border-r-0 text-[11px] uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot.label} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 align-top border-r border-border text-muted-foreground font-medium bg-muted/20 text-[11px] leading-snug whitespace-nowrap">
                    {slot.label.split("–").map((t, i) => <div key={i}>{t}</div>)}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const entries = calendarGrid[slotIdx][dayIdx];
                    return (
                      <td key={dayIdx} className="p-1.5 align-top border-r border-border last:border-r-0 min-w-[120px]">
                        {entries.length === 0 ? <div className="min-h-[80px]" /> : (
                          <div className="flex flex-col gap-1.5">
                            {entries.map((item, i) => (
                              <div key={i} className={`relative rounded-xl p-3 min-h-[80px] flex flex-col justify-center transition-all border
                                ${item.isConflict ? 'bg-destructive-muted border-destructive text-destructive' 
                                : item.isLab ? 'bg-info-muted border-info text-info-foreground' 
                                : 'bg-primary-muted border-primary/20 text-primary'}`}>
                                <div className="font-bold text-[12px] tracking-tight leading-tight flex items-center gap-1.5 pr-1">
                                  {item.course.courseCode}
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-foreground/10">{item.course.sectionName}</span>
                                  {item.isLab && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-info border border-info-foreground/20 text-info-foreground">LAB</span>}
                                </div>
                                <div className="text-[11px] mt-2 flex items-start gap-1 opacity-80 font-medium">
                                  📍 {item.course.roomName || "TBA"}
                                </div>
                                <div className="text-[11px] mt-0.5 flex items-center gap-1 opacity-70 font-medium">
                                  👨‍🏫 {item.course.faculties || "TBA"}
                                </div>
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
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 px-5 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><div className="h-3 w-3 rounded-full bg-primary-muted border border-primary" />Class</div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-info"><div className="h-3 w-3 rounded-full bg-info-muted border border-info" />Lab</div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive"><div className="h-3 w-3 rounded-full bg-destructive-muted border border-destructive" />Conflict</div>
          </div>
        </div>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="flex md:hidden flex-col gap-3">
        {courses.map((course) => (
          <div key={course.sectionId} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">{course.courseCode} <span className="text-sm font-normal text-muted-foreground">[{course.sectionName}]</span></h3>
              <p className="mt-0.5 text-xs text-primary font-semibold uppercase">{course.faculties || "TBA"}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(course.sectionSchedule?.classSchedules || []).map((s:any, i:number) => (
                <span key={i} className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-primary-muted text-primary border border-primary/20">
                  {s.day?.substring(0, 3)} {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)}
                </span>
              ))}
              {(course.labSchedules || []).map((s:any, i:number) => (
                <span key={i} className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-info-muted text-info border border-info/20">
                  {s.day?.substring(0, 3)} {formatTime12h(s.startTime)}–{formatTime12h(s.endTime)} <span className="ml-1 bg-info/20 px-1 rounded">LAB</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── EXAM SCHEDULE ── */}
      {showExams && examRows.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-bold text-foreground">Exam Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-xs font-semibold text-muted-foreground">
                  <th className="px-6 py-3 text-left">Course</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {examRows.map((row, i) => {
                  const isClash = examRows.some((other, j) => j !== i && other.rawDate === row.rawDate && other.time === row.time);
                  return (
                    <tr key={i} className={`transition-colors ${isClash ? "bg-destructive-muted" : "hover:bg-muted/30"}`}>
                      <td className="px-6 py-3 font-semibold text-foreground">
                        {row.courseCode} <span className="text-muted-foreground font-normal">[{row.sectionName}]</span>
                        {isClash && <span className="ml-3 text-[10px] font-bold text-destructive bg-destructive-muted border border-destructive/20 px-2 py-0.5 rounded-full">⚠ CLASH</span>}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${row.type === "MID" ? "bg-warning-muted text-warning" : "bg-destructive-muted text-destructive"}`}>{row.type}</span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{row.date}</td>
                      <td className="px-6 py-3 text-muted-foreground font-medium">{row.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}