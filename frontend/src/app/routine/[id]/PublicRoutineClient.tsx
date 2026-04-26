"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { RoutineViewer } from "@/components/ui/RoutineViewer";
import { exportRoutineToPNG } from "@/lib/exportRoutine";
import { CourseMold } from "@/lib/db/mold";

interface Props {
  courses: Partial<CourseMold>[];
  routine: any;
  ownerName: string;
}

export default function PublicRoutineClient({ courses, routine, ownerName }: Props) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExams, setShowExams] = useState(true);

  const handleDownloadPNG = async () => {
    if (!calendarRef.current) return;
    setIsExporting(true);
    try {
      await exportRoutineToPNG({
        routineRef: calendarRef,
        filename: `CRABU_Shared_${routine.routineName?.replace(/\s+/g, '_') || "Routine"}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile-Responsive Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
  
        {/* LEFT SIDE → controls */}
        <div className="flex items-center gap-2">
            
            {/* Hide / Show Exams */}
            <button
            onClick={() => setShowExams(p => !p)}
            className="flex h-10 w-10 sm:w-36 shrink-0 items-center justify-center gap-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition shadow-sm"
            >
            {showExams ? (
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            ) : (
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
            <span className="hidden sm:inline-block text-xs font-bold truncate">
                {showExams ? "Hide Exams" : "Show Exams"}
            </span>
            </button>

            {/* Download PNG */}
            <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="flex h-10 w-10 sm:w-36 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0070F3] text-white hover:bg-[#0070F3]/90 transition shadow-sm disabled:opacity-50"
            >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11v6m0 0l-3-3m3 3l3-3" />
            </svg>
            <span className="hidden sm:inline-block text-xs font-bold truncate">
                {isExporting ? "Exporting..." : "Download PNG"}
            </span>
            </button>
        </div>

        {/* RIGHT SIDE → primary action */}
        <Link
            href="/dashboard/finder"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
            Build New Routine
        </Link>
        </div>

      {/* Routine Viewer Injection */}
      <RoutineViewer 
        courses={courses} 
        showExams={showExams} 
        title={routine.routineName || "Shared Routine"}
        subtitle={ownerName}
        semester={routine.semester}
        forwardedRef={calendarRef} 
      />
    </div>
  );
}