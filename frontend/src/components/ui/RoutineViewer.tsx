"use client";

import React from "react";
import { CourseMold } from "@/lib/db/mold";
import { DesktopRoutineGrid } from "./DesktopRoutineGrid";
import { MobileRoutineCards } from "./MobileRoutineCards";
import { useRoutineMath } from "@/hooks/useRoutineMath";

interface RoutineViewerProps {
  courses: Partial<CourseMold>[];
  showExams?: boolean;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  onRemoveCourse?: (courseId: number) => void;
  
  // New unified header props
  title?: string;
  subtitle?: string;
  semester?: string;
}

export function RoutineViewer({ 
  courses, 
  showExams = true, 
  forwardedRef,
  title = "My Routine",
  subtitle,
  semester,
  onRemoveCourse
}: RoutineViewerProps) {
  
  // The Viewer now mathematically calculates its own stats!
  const { stats } = useRoutineMath(courses);
  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.courseCredit) || 0), 0);

  if (!courses || courses.length === 0) return null;

  return (
    // The forwardedRef captures the Header AND the Grid simultaneously for PNG exports
    <div ref={forwardedRef} className="flex flex-col gap-3 w-full">
      
      {/* ── UNIFIED HEADER BANNER ── */}
      <div className="export-header-banner flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 rounded-xl border border-border bg-card p-4 shadow-sm w-full">
        
        {/* Left Side: Title & Info */}
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary hidden sm:block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0 w-full">
            
            {/* Title & Info Column (Now Vertically Centered) */}
          <div className="flex flex-col justify-center min-w-0 w-full min-h-[44px]">
            
            {/* Title Row with Tags */}
            <div className="flex flex-wrap items-center gap-2 overflow-hidden">
              <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate">
                {title}
              </h1>
              {semester && (
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0 whitespace-nowrap">
                  {semester}
                </span>
              )}
              {stats.hasClash && (
                <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive border border-destructive/20 shrink-0 whitespace-nowrap">
                  ⚠ Clash
                </span>
              )}
            </div>

            {/* Subtitle Row */}
            {subtitle && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground truncate bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>{subtitle}</span>
                </div>
              </div>
            )}
            
          </div>
            
          </div>
        </div>

        {/* Mobile Horizontal Divider */}
        <div className="w-full h-px bg-border md:hidden my-0.5"></div>

        {/* Right Side: Structured Stats Grid */}
        <div className="export-header-stats flex flex-col items-start md:items-end gap-1.5 shrink-0 w-full md:w-auto">
          <p className="text-[13px] text-foreground font-bold whitespace-nowrap">
            {courses.length} Courses • {totalCredits} Credits
          </p>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {/* Swapped Colors: Days gets Blue, Time gets Purple */}
            <span className="bg-primary/10 px-2.5 py-1 rounded-md text-[11px] font-bold text-primary border border-primary/20 shrink-0">
              {stats.totalDays} Days
            </span>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0">
              {stats.timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* ── ROUTINE GRIDS ── */}
      <div className="crabu-desktop-grid hidden md:block w-full">
        <DesktopRoutineGrid courses={courses} showExams={showExams} onRemoveCourse={onRemoveCourse} />
      </div>
      
      <div className="crabu-mobile-cards block md:hidden w-full">
        <MobileRoutineCards courses={courses} showExams={showExams} onRemoveCourse={onRemoveCourse} />
      </div>

    </div>
  );
}