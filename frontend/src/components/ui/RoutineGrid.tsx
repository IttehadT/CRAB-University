"use client";

import { useMemo } from "react";
import { CourseMold } from "@/lib/db/mold";

interface RoutineGridProps {
  courses: Partial<CourseMold>[];
  showExams?: boolean;
}

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

export function RoutineGrid({ courses, showExams = true }: RoutineGridProps) {

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
        if (cellCounts[slotIdx][dayIdx] > 1)
          grid[slotIdx][dayIdx] = grid[slotIdx][dayIdx].map(item => ({ ...item, isConflict: true }));
      });
    });
    return grid;
  }, [courses]);

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
    <div className="flex flex-col gap-4">

      {/* Weekly Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden min-w-[900px] shadow-sm">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-[130px] px-4 py-3.5 text-left font-semibold text-muted-foreground border-r border-border text-[11px] uppercase tracking-wider">TIME / DAY</th>
              {DAYS.map((day) => (
                <th key={day} className="px-3 py-3.5 text-center font-semibold text-muted-foreground border-r border-border last:border-r-0 text-[11px] uppercase tracking-wider">{day}</th>
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
                      {entries.length === 0
                        ? <div className="min-h-[80px]" />
                        : (
                          <div className="flex flex-col gap-1.5">
                            {entries.map((item, i) => (
                              <div key={i} className={`relative rounded-r-lg rounded-l-[3px] p-2.5 min-h-[80px] flex flex-col justify-center
                                ${item.isConflict
                                  ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-900 dark:text-red-100'
                                  : item.isLab
                                    ? 'bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 text-purple-900 dark:text-purple-100'
                                    : 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100'
                                }`}>
                                <div className="font-bold text-[12px] tracking-tight leading-tight flex items-center gap-1.5 pr-4">
                                  {item.course.courseCode}
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-black/10 dark:bg-white/20">{item.course.sectionName}</span>
                                  {item.isLab && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">LAB</span>}
                                </div>
                                <div className="text-[11px] mt-1.5 flex items-start gap-1 opacity-80 font-medium">
                                  <svg className="w-3 h-3 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {item.course.roomName || "TBA"}
                                </div>
                                <div className="text-[11px] mt-0.5 flex items-center gap-1 opacity-70 font-medium">
                                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  {item.course.faculties || "TBA"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-5 px-5 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider"><div className="h-3 w-3 rounded-sm bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" />Class</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider"><div className="h-3 w-3 rounded-sm bg-purple-50 dark:bg-purple-900/30 border-l-2 border-purple-500" />Lab</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider"><div className="h-3 w-3 rounded-sm bg-red-50 dark:bg-red-900/30 border-l-2 border-red-500" />Conflict</div>
        </div>
      </div>

      {/* Exam Table */}
      {showExams && (
        <div className="bg-card rounded-xl border border-border overflow-hidden min-w-[600px] shadow-sm">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📋 Exam Schedule</p>
          </div>
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left border-r border-border">Course</th>
                <th className="px-4 py-2.5 text-left border-r border-border">Type</th>
                <th className="px-4 py-2.5 text-left border-r border-border">Date</th>
                <th className="px-4 py-2.5 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {examRows.length === 0
                ? <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-xs">No exam data available.</td></tr>
                : examRows.map((row, i) => {
                    const isClash = examRows.some((other, j) => j !== i && other.rawDate === row.rawDate && other.time === row.time);
                    return (
                      <tr key={i} className={`transition-colors ${isClash ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-muted/30"}`}>
                        <td className="px-4 py-2.5 font-semibold text-foreground border-r border-border">
                          {row.courseCode} <span className="text-muted-foreground font-normal">[{row.sectionName}]</span>
                          {isClash && <span className="ml-2 text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">⚠ CLASH</span>}
                        </td>
                        <td className="px-4 py-2.5 border-r border-border">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.type === "MID" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground border-r border-border">{row.date}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.time}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}