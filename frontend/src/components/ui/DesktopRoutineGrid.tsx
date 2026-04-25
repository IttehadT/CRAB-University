"use client";

import React, { useMemo } from "react";
import { CourseMold } from "@/lib/db/mold";
import { TIME_SLOTS, DAYS, formatTime12h, timeToMinutes, generateExamRows } from "@/hooks/useRoutineMath";

interface DesktopRoutineGridProps {
  courses: Partial<CourseMold>[];
  showExams?: boolean;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  onRemoveCourse?: (courseId: number) => void;
}

export function DesktopRoutineGrid({ courses, showExams = true, forwardedRef, onRemoveCourse }: DesktopRoutineGridProps) {
  
  const getCoursesForSlot = (day: string, timeSlot: string) => {
    const [slotStart, slotEnd] = timeSlot.split('-');
    const slotStartMin = timeToMinutes(slotStart.trim());
    const slotEndMin = timeToMinutes(slotEnd.trim());

    const results: { course: Partial<CourseMold>; isLab: boolean; room: string }[] = [];

    courses.forEach(course => {
      // 1. Check Theory
      let isTheoryMatch = false;
      let theoryRoom = course.roomName || course.roomNumber || "TBA";

      course.sectionSchedule?.classSchedules?.forEach((s: any) => {
        if (!s.day || !s.startTime || !s.endTime) return;
        if (day.toUpperCase().startsWith(s.day.toUpperCase().substring(0, 3))) {
          const schedStart = timeToMinutes(formatTime12h(s.startTime));
          const schedEnd = timeToMinutes(formatTime12h(s.endTime));
          if (schedStart < slotEndMin && schedEnd > slotStartMin) {
            isTheoryMatch = true;
            if (s.roomName || s.roomNumber || s.room) theoryRoom = s.roomName || s.roomNumber || s.room;
          }
        }
      });

      if (isTheoryMatch) results.push({ course, isLab: false, room: theoryRoom });

    // 2. Check Lab (Clean CDN-First Extraction)
      let isLabMatch = false;
      // We rely directly on the normalized property!
      let labRoom = course.labRoomName || course.roomName || "TBA"; 

      course.labSchedules?.forEach((s: any) => {
        if (!s.day || !s.startTime) return;
        if (day.toUpperCase().startsWith(s.day.toUpperCase().substring(0, 3))) {
          const schedStart = timeToMinutes(formatTime12h(s.startTime));
          const schedEnd = s.endTime ? timeToMinutes(formatTime12h(s.endTime)) : schedStart + 170;
          
          if (schedStart < slotEndMin && schedEnd > slotStartMin) {
            isLabMatch = true;
          }
        }
      });

      if (isLabMatch) results.push({ course, isLab: true, room: labRoom });
    });

    return results;
  };

  const examRows = useMemo(() => generateExamRows(courses), [courses]);

  if (courses.length === 0) return null;

  return (
    <div ref={forwardedRef} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-w-[900px] flex flex-col w-full">
      <table className="w-full text-left text-[11px] border-collapse bg-card">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-[120px] px-3 py-2.5 font-bold text-muted-foreground border-r border-border text-[10px] uppercase tracking-wider">Time / Day</th>
            {DAYS.map((day) => (
              <th key={day} className="px-2 py-2.5 text-center font-bold text-foreground border-r border-border last:border-r-0 text-[10px] uppercase tracking-wider">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((timeSlot) => (
            <tr key={timeSlot} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2 align-top border-r border-border text-muted-foreground font-bold bg-muted/10 text-[10px] whitespace-nowrap">
                {timeSlot.split("-").map((t, i) => <div key={i}>{t.trim()}</div>)}
              </td>
              {DAYS.map((day) => {
                const slotCourses = getCoursesForSlot(day, timeSlot);
                const isConflict = slotCourses.length > 1;

                return (
                  <td key={`${day}-${timeSlot}`} className="p-1.5 align-top border-r border-border last:border-r-0 min-w-[110px]">
                    {slotCourses.length === 0 ? (
                      <div className="min-h-[65px]" />
                    ) : (
                      <div className={`flex flex-col gap-1.5 ${isConflict ? 'space-y-1' : ''}`}>
                        {slotCourses.map((slot, i) => {
                          const { course, isLab, room } = slot;
                          return (
                            <div
                                key={`${course.sectionId}-${i}`}
                                className={`group relative rounded-r-lg rounded-l-[3px] p-2 min-h-[65px] flex flex-col justify-center transition-all
                                ${
                                    isConflict
                                    ? "bg-red-50 border-l-[3px] border-red-500 text-red-900 shadow-sm"
                                    : isLab
                                    ? "bg-purple-50 border-l-[3px] border-purple-500 text-purple-900 shadow-sm"
                                    : "bg-blue-50 border-l-[3px] border-blue-500 text-blue-900 shadow-sm"
                                }`}
                                >
                                {/* 🔥 CLOSE BUTTON */}
                                {onRemoveCourse && (
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveCourse(course.sectionId as number);
                                    }}
                                    className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded bg-destructive/15 text-destructive opacity-50 hover:bg-destructive hover:text-white hover:opacity-100 transition-all"
                                    title="Remove Course"
                                    >
                                    <svg
                                        className="h-2.5 w-2.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    </button>
                                )}

                                {/* CONTENT */}
                                <div className="font-black text-[12px] tracking-tight leading-none flex flex-wrap items-center gap-1 pr-4">
                                    <span>{course.courseCode}</span>
                                    <span className="text-[9px] font-black px-1 py-0.5 rounded bg-black/10 shadow-sm">
                                    {course.sectionName}
                                    </span>
                                    {isLab && (
                                    <span className="text-[8px] font-black px-1 py-0.5 rounded bg-purple-200 text-purple-800">
                                        LAB
                                    </span>
                                    )}
                                </div>

                                <div className="text-[10px] mt-1.5 flex items-start gap-1 font-semibold truncate">
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {room}
                                </div>

                                <div className="text-[10px] mt-0.5 flex items-center gap-1 font-semibold truncate opacity-80">
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {course.faculties || "TBA"}
                                </div>
                                </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {showExams && examRows.length > 0 && (
        <div className="border-t-[3px] border-border bg-card">
          <div className="px-4 py-2 border-b border-border bg-muted/10">
            <p className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">📋 Exam Schedule</p>
          </div>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 text-left border-r border-border">Course</th>
                <th className="px-4 py-2 text-left border-r border-border">Type</th>
                <th className="px-4 py-2 text-left border-r border-border">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {examRows.map((row, i) => (
                <tr key={i} className={row.isClash ? "bg-red-50" : ""}>
                  <td className="px-4 py-2.5 font-black text-foreground border-r border-border">
                    {row.courseCode} <span className="text-muted-foreground">[{row.sectionName}]</span>
                    {row.isClash && <span className="ml-2 text-[8px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded-sm">⚠ CLASH</span>}
                  </td>
                  <td className="px-4 py-2.5 border-r border-border">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${row.type === "MID" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}>{row.type}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground font-semibold border-r border-border">{row.date}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-semibold">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CRABU WATERMARK ── */}
      <div className="w-full px-5 py-3.5 border-t border-border bg-muted/10 flex items-center justify-between mt-auto">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
            Academic Schedule
          </p>
          <p className="text-[10px] font-black text-muted-foreground tracking-wide opacity-90">
            GENERATED BY <span className="text-primary">CRAB University</span> • www.crabu.app
          </p>
      </div>
    </div>
  );
}