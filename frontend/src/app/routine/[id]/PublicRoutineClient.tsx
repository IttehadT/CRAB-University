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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
        
        <Link href="/dashboard/finder" className="w-full sm:w-auto flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm">
          Build New Routine
        </Link>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setShowExams(p => !p)} className="flex-1 sm:flex-none h-10 flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground hover:bg-muted transition shadow-sm">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="hidden sm:inline-block">{showExams ? "Hide Exams" : "Show Exams"}</span>
            <span className="sm:hidden">Exams</span>
          </button>
          
          <button onClick={handleDownloadPNG} disabled={isExporting} className="flex-1 sm:flex-none h-10 flex items-center justify-center gap-2 rounded-xl bg-[#0070F3] px-5 text-sm font-bold text-white hover:bg-[#0070F3]/90 transition shadow-sm disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span className="hidden sm:inline-block">{isExporting ? "Exporting..." : "Download PNG"}</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
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