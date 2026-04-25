"use client";

import React, { useState, useMemo } from "react";
import { CourseMold } from "@/lib/db/mold";
import { DAYS, DAY_ABBR, formatTime12h, timeToMinutes, generateExamRows } from "@/hooks/useRoutineMath";

interface MobileRoutineCardsProps {
  courses: Partial<CourseMold>[];
  showExams?: boolean;
  onRemoveCourse?: (courseId: number) => void;
}

export function MobileRoutineCards({ courses, showExams = true, onRemoveCourse  }: MobileRoutineCardsProps) {
  
  // ── 1. DAY TABS LOGIC ──
  // Calculate how many classes/labs occur on each day for the notification badges
  const coursesPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS.forEach(day => {
      let count = 0;
      courses.forEach(course => {
        const classMatch = course.sectionSchedule?.classSchedules?.some((s: any) => 
          day.toUpperCase().startsWith(s.day?.toUpperCase().substring(0, 3) || "")
        );
        const labMatch = course.labSchedules?.some((s: any) => 
          day.toUpperCase().startsWith(s.day?.toUpperCase().substring(0, 3) || "")
        );
        if (classMatch || labMatch) count++;
      });
      counts[day] = count;
    });
    return counts;
  }, [courses]);

  // Default the selected tab to the first day that actually has classes (or Sunday)
  const firstDayWithCourses = useMemo(() => {
    for (const day of DAYS) {
      if (coursesPerDay[day] > 0) return day;
    }
    return "Sunday";
  }, [coursesPerDay]);

  const [selectedDay, setSelectedDay] = useState(firstDayWithCourses);

  // ── 2. DAILY COURSE EXTRACTOR & SORTER ──
  const coursesForSelectedDay = useMemo(() => {
    const result: any[] = [];
    const seen = new Set();

    courses.forEach(course => {
      // Extract Classes
      course.sectionSchedule?.classSchedules?.forEach((schedule: any) => {
        if (schedule.day && selectedDay.toUpperCase().startsWith(schedule.day.toUpperCase().substring(0, 3))) {
          const key = `${course.sectionId}-class-${schedule.startTime}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({
              course,
              type: 'class',
              startTime: formatTime12h(schedule.startTime),
              endTime: formatTime12h(schedule.endTime),
              room: course.roomName || "TBA",
              sortKey: timeToMinutes(formatTime12h(schedule.startTime)),
            });
          }
        }
      });

      // Extract Labs (Clean CDN-First Extraction)
      course.labSchedules?.forEach((schedule: any) => {
        if (schedule.day && selectedDay.toUpperCase().startsWith(schedule.day.toUpperCase().substring(0, 3))) {
          const key = `${course.sectionId}-lab-${schedule.startTime}`;
          if (!seen.has(key)) {
            seen.add(key);
            const startStr = formatTime12h(schedule.startTime);
            const endStr = schedule.endTime ? formatTime12h(schedule.endTime) : formatTime12h(schedule.startTime); 
            
            result.push({
              course,
              type: 'lab',
              startTime: startStr,
              endTime: endStr,
              room: course.labRoomName || course.roomName || "TBA", // Perfectly mapped to CDN
              sortKey: timeToMinutes(startStr),
            });
          }
        }
      });
    });

    // Sort chronologically by start time
    result.sort((a, b) => a.sortKey - b.sortKey);

    // Detect localized conflicts for this specific day
    for (let i = 0; i < result.length; i++) {
      const aStart = result[i].sortKey;
      const aEnd = timeToMinutes(result[i].endTime) || (aStart + 170); // fallback for lab length
      result[i].hasConflict = false;

      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;
        const bStart = result[j].sortKey;
        const bEnd = timeToMinutes(result[j].endTime) || (bStart + 170);
        
        // Overlap formula
        if (aStart < bEnd && aEnd > bStart) {
          result[i].hasConflict = true;
          break;
        }
      }
    }

    return result;
  }, [courses, selectedDay]);

  // ── 3. EXAM MATH ENGINE ──
  // ── 3. EXAM MATH ENGINE (Strict Overlap) ──
  const examRows = useMemo(() => generateExamRows(courses), [courses]);

  if (courses.length === 0) return null;

  return (
    // md:hidden guarantees this only shows on mobile
    <div className="flex md:hidden flex-col w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      
      {/* ── DAY TABS (Sticky header) ── */}
      <div className="flex overflow-x-auto gap-2 p-3 border-b border-border bg-muted/10 scrollbar-hide sticky top-0 z-10">
        {DAYS.map((day, idx) => {
          const isSelected = selectedDay === day;
          const count = coursesPerDay[day];
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative
                ${isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : count > 0
                    ? 'bg-muted/50 text-foreground hover:bg-muted border border-border'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/30 border border-transparent'
                }`}
            >
              {DAY_ABBR[idx]}
              {count > 0 && !isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-sm">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── COURSE CARDS ── */}
      <div className="p-4 flex flex-col gap-3 min-h-[300px]">
        {coursesForSelectedDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10 opacity-60">
            <span className="text-4xl mb-3">☕</span>
            <p className="text-sm font-bold text-muted-foreground">No classes on {selectedDay}</p>
          </div>
        ) : (
          coursesForSelectedDay.map((entry, idx) => {
            const { course, type, startTime, endTime, room, hasConflict } = entry;
            const isLab = type === 'lab';

            return (
              <div
                key={`${course.sectionId}-${type}-${idx}`}
                className={`group relative p-4 rounded-2xl border transition-all shadow-sm
                    ${
                    hasConflict
                        ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                        : isLab
                        ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                        : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    }`}
                >
                {/* 🔥 REMOVE BUTTON */}
                {onRemoveCourse && (
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCourse(course.sectionId as number);
                    }}
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded bg-destructive/15 text-destructive opacity-60 hover:bg-destructive hover:text-white hover:opacity-100 transition-all"
                    title="Remove Course"
                    >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                )}

                {/* Time Row */}
                <div className={`text-xs font-black mb-2 flex justify-between items-center pr-6
                    ${hasConflict ? 'text-red-600 dark:text-red-400' : isLab ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}
                >
                    <span>{startTime} – {endTime}</span>
                    {hasConflict && <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">⚠ Clash</span>}
                </div>

                {/* Course Title Row */}
                <div className="flex items-start justify-between gap-2 pr-6">
                    <div className="font-black text-lg text-foreground leading-tight">
                    {course.courseCode}
                    <span className="text-xs font-bold text-muted-foreground ml-1.5 bg-background/50 px-1.5 py-0.5 rounded-md border border-border/50 shadow-sm">
                        [{course.sectionName}]
                    </span>
                    </div>
                    {isLab && (
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 shadow-sm">
                        LAB
                    </span>
                    )}
                </div>

                {/* Meta */}
                <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{room}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.faculties || "TBA"}</span>
                    </div>
                </div>
                </div>
            );
          })
        )}
      </div>

      {/* ── EXAM LIST ── */}
      {showExams && examRows.length > 0 && (
        <div className="border-t-[4px] border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <p className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              📋 Exams
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {examRows.map((row, i) => (
                <div key={i} className={`p-4 flex flex-col gap-2 ${row.isClash ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-black text-foreground text-sm">
                      {row.courseCode} <span className="text-muted-foreground font-semibold text-xs bg-muted px-1.5 py-0.5 rounded ml-1">[{row.sectionName}]</span>
                    </span>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md border uppercase tracking-wider shadow-sm
                      ${row.type === "MID" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}
                    >
                      {row.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>{row.date}</span>
                    <span>{row.time}</span>
                  </div>
                  {row.isClash && <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded w-max mt-1">⚠ EXAM CLASH</span>}
                </div>
            ))}
          </div>
        </div>
      )}
      {/* ── CRABU WATERMARK ── */}
      <div className="w-full px-4 py-3.5 border-t border-border bg-muted/10 flex items-center justify-between mt-auto">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
            Routine
          </p>
          <p className="text-[10px] font-black text-muted-foreground tracking-wide opacity-90">
            <span className="text-primary">CRAB University</span> • www.crabu.app
          </p>
      </div>
    </div>
  );
}