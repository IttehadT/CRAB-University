import { useMemo } from "react";
import { CourseMold } from "@/lib/db/mold";

// ── 1. CONSTANTS ──
export const TIME_SLOTS = [
  "08:00 AM-09:20 AM",
  "09:30 AM-10:50 AM",
  "11:00 AM-12:20 PM",
  "12:30 PM-01:50 PM",
  "02:00 PM-03:20 PM",
  "03:30 PM-04:50 PM",
  "05:00 PM-06:20 PM"
];

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── 2. UTILITIES (Adapted from Boracle) ──
export const formatTime12h = (time?: string | null) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};

export const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes;
};

// ── 3. CLASH DETECTION ENGINE ──
export function checkCourseClash(newCourse: Partial<CourseMold>, selectedCourses: Partial<CourseMold>[]): boolean {
  let isClash = false;
  
  // 1. Check Class & Lab Overlaps
  const newSchedules = [...(newCourse.sectionSchedule?.classSchedules || []), ...(newCourse.labSchedules || [])];
  
  selectedCourses.forEach(existing => {
    const existingSchedules = [...(existing.sectionSchedule?.classSchedules || []), ...(existing.labSchedules || [])];
    
    newSchedules.forEach(ns => {
      if (!ns.day || !ns.startTime || !ns.endTime) return;
      const nStart = timeToMinutes(formatTime12h(ns.startTime));
      const nEnd = timeToMinutes(formatTime12h(ns.endTime));
      
      existingSchedules.forEach(es => {
        if (es.day === ns.day && es.startTime && es.endTime) {
          const eStart = timeToMinutes(formatTime12h(es.startTime));
          const eEnd = timeToMinutes(formatTime12h(es.endTime));
          // Strict Overlap formula
          if (nStart < eEnd && nEnd > eStart) isClash = true;
        }
      });
    });
  });

  if (isClash) return true;

  // 2. Check Exam Overlaps
  const getExams = (c: Partial<CourseMold>) => {
    const s = c.sectionSchedule as any;
    const exams = [];
    if (s?.midExamDate && s?.midExamStartTime && s?.midExamEndTime) {
      exams.push({ 
        date: s.midExamDate.split('T')[0], 
        start: timeToMinutes(formatTime12h(s.midExamStartTime)), 
        end: timeToMinutes(formatTime12h(s.midExamEndTime)) 
      });
    }
    if (s?.finalExamDate && s?.finalExamStartTime && s?.finalExamEndTime) {
      exams.push({ 
        date: s.finalExamDate.split('T')[0], 
        start: timeToMinutes(formatTime12h(s.finalExamStartTime)), 
        end: timeToMinutes(formatTime12h(s.finalExamEndTime)) 
      });
    }
    return exams;
  };

  const newExams = getExams(newCourse);
  selectedCourses.forEach(existing => {
    const existingExams = getExams(existing);
    newExams.forEach(ne => {
      existingExams.forEach(ee => {
        if (ne.date === ee.date && ne.start < ee.end && ne.end > ee.start) {
          isClash = true;
        }
      });
    });
  });

  return isClash;
}

// ── 4. MASTER STATS HOOK ──
export function useRoutineMath(courses: Partial<CourseMold>[]) {
  const stats = useMemo(() => {
    const daySet = new Set<string>();
    const daySpans: Record<string, { min: number; max: number }> = {};
    let hasClash = false;

    courses.forEach((c, idx) => {
      const allSchedules = [...(c.sectionSchedule?.classSchedules || []), ...(c.labSchedules || [])];
      allSchedules.forEach((s: any) => {
        if (!s.day || !s.startTime || !s.endTime) return;
        
        // Normalize day string to full name (e.g. "SUN" -> "Sunday")
        const fullDay = DAYS.find(d => d.toUpperCase().startsWith(s.day.toUpperCase())) || s.day;
        daySet.add(fullDay);
        
        const start = timeToMinutes(formatTime12h(s.startTime)); 
        const end = timeToMinutes(formatTime12h(s.endTime));
        
        if (!daySpans[fullDay]) daySpans[fullDay] = { min: start, max: end };
        else { 
          daySpans[fullDay].min = Math.min(daySpans[fullDay].min, start); 
          daySpans[fullDay].max = Math.max(daySpans[fullDay].max, end); 
        }
      });
      if (!hasClash && checkCourseClash(c, courses.filter((_, i) => i !== idx))) hasClash = true;
    });

    const totalMinutes = Object.values(daySpans).reduce((sum, d) => sum + (d.max - d.min), 0);
    const hrs = Math.floor(totalMinutes / 60); 
    const mins = totalMinutes % 60;
    
    return { 
      totalDays: daySet.size, 
      totalMinutes,
      timeStr: mins === 0 ? `${hrs} hrs` : `${hrs}h ${mins}m`, 
      hasClash 
    };
  }, [courses]);

  return { stats };
}

export interface ExamRow {
  courseCode: string;
  sectionName: string;
  type: "MID" | "FINAL";
  date: string;
  time: string;
  rawDate: string;
  startTimeMin: number;
  endTimeMin: number;
  isClash: boolean;
}

export function generateExamRows(courses: Partial<CourseMold>[]): ExamRow[] {
  const rows: ExamRow[] = [];
  
  courses.forEach(c => {
    const s = c.sectionSchedule as any;
    const formatDateBD = (dateStr: string) => {
      const bd = new Date(new Date(dateStr).getTime() + 6 * 60 * 60 * 1000);
      return bd.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
    };

    if (s?.midExamDate && s?.midExamStartTime && s?.midExamEndTime) {
      rows.push({
        courseCode: c.courseCode || "", sectionName: c.sectionName || "", type: "MID",
        date: formatDateBD(s.midExamDate), time: `${formatTime12h(s.midExamStartTime)} – ${formatTime12h(s.midExamEndTime)}`,
        rawDate: s.midExamDate,
        startTimeMin: timeToMinutes(formatTime12h(s.midExamStartTime)), endTimeMin: timeToMinutes(formatTime12h(s.midExamEndTime)),
        isClash: false
      });
    }
    if (s?.finalExamDate && s?.finalExamStartTime && s?.finalExamEndTime) {
      rows.push({
        courseCode: c.courseCode || "", sectionName: c.sectionName || "", type: "FINAL",
        date: formatDateBD(s.finalExamDate), time: `${formatTime12h(s.finalExamStartTime)} – ${formatTime12h(s.finalExamEndTime)}`,
        rawDate: s.finalExamDate,
        startTimeMin: timeToMinutes(formatTime12h(s.finalExamStartTime)), endTimeMin: timeToMinutes(formatTime12h(s.finalExamEndTime)),
        isClash: false
      });
    }
  });

  // Sort chronologically
  rows.sort((a, b) => {
    const da = new Date(a.rawDate).getTime();
    const db = new Date(b.rawDate).getTime();
    return da !== db ? da - db : a.startTimeMin - b.startTimeMin;
  });

  // Map strict overlap clashes
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows.length; j++) {
      if (i !== j && rows[i].rawDate === rows[j].rawDate) {
        if (rows[i].startTimeMin < rows[j].endTimeMin && rows[i].endTimeMin > rows[j].startTimeMin) {
          rows[i].isClash = true;
          break;
        }
      }
    }
  }

  return rows;
}