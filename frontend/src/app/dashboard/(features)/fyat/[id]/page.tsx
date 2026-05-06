import { fetchFyatGroupDetails, fetchCourses } from "@/lib/service";
import Link from "next/link";
import { Users, ArrowLeft, Link as LinkIcon, Map, Lock } from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";

export const metadata = { title: "FYAT Group Details | CRAB University" };

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const slots = ["08:00 AM", "09:30 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"];

function getSlotFromTime(timeStr: string) {
  if (!timeStr) return null;
  const t = timeStr.toUpperCase();
  if (t.includes("08:00") || t.includes("8:00")) return "08:00 AM";
  if (t.includes("09:30") || t.includes("9:30") || t.includes("09:20")) return "09:30 AM";
  if (t.includes("11:00")) return "11:00 AM";
  if (t.includes("12:30")) return "12:30 PM";
  if (t.includes("14:00") || t.includes("02:00") || t.includes("2:00")) return "02:00 PM";
  if (t.includes("15:30") || t.includes("03:30") || t.includes("3:30")) return "03:30 PM";
  if (t.includes("17:00") || t.includes("05:00") || t.includes("5:00")) return "05:00 PM";
  return null;
}

const extractSchedules = (raw: any, arrayName: string) => {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (parsed[arrayName] || []);
    } catch(e) { return []; }
  }
  return Array.isArray(raw) ? raw : (raw[arrayName] || []);
};

export default async function FyatGroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { group, responses } = await fetchFyatGroupDetails(resolvedParams.id);
  const totalStudents = responses.length;

  const coursesRes = await fetchCourses(["courseCode", "sectionName", "sectionSchedule", "labSchedules"]);
  const allCourses = coursesRes.data || [];

  const scheduleLookup: Record<string, {day: string, time: string}[]> = {};
  
  allCourses.forEach((c: any) => {
    const code = String(c.courseCode || c.course_code || "").replace(/\s+/g, "").toUpperCase();
    const sec = String(c.sectionName || c.section_name || "").padStart(2, '0');
    const key = `${code}-${sec}`;
    const times: {day: string, time: string}[] = [];

    const cScheds = extractSchedules(c.sectionSchedule || c.section_schedule, 'classSchedules');
    const lScheds = extractSchedules(c.labSchedules || c.lab_schedules, 'labSchedules');

    [...cScheds, ...lScheds].forEach((s: any) => {
        const slot = getSlotFromTime(s.startTime || s.start_time);
        if (s.day && slot) {
            // 🔥 THE FIX: Normalize "SUNDAY" to "Sunday" so it matches the grid exactly
            const normalizedDay = s.day.charAt(0).toUpperCase() + s.day.slice(1).toLowerCase();
            times.push({ day: normalizedDay, time: slot });
        }
    });

    scheduleLookup[key] = times;
  });

  const heatmap: Record<string, number> = {};
  days.forEach(d => slots.forEach(s => heatmap[`${d}-${s}`] = totalStudents));

  const mentorBusyCells = new Set<string>();
  if (group.mentor_courses) {
    const mCourses = group.mentor_courses.split(',').map((c:string) => c.trim().replace(/\s+/g, "").toUpperCase());
    mCourses.forEach((c:string) => {
      let lookupKey = c;
      if (c.includes('-')) {
        const parts = c.split('-');
        lookupKey = `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
      const times = scheduleLookup[lookupKey] || [];
      times.forEach(t => mentorBusyCells.add(`${t.day}-${t.time}`));
    });
  }

  responses.forEach(resp => {
    const studentCourses = resp.courses.split(',').map((c: string) => c.trim().replace(/\s+/g, "").toUpperCase());
    const busyCells = new Set<string>();

    studentCourses.forEach((c: string) => {
      let lookupKey = c;
      if (c.includes('-')) {
        const parts = c.split('-');
        lookupKey = `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
      const times = scheduleLookup[lookupKey] || [];
      times.forEach(t => busyCells.add(`${t.day}-${t.time}`));
    });

    busyCells.forEach(cell => {
      if (heatmap[cell] !== undefined) heatmap[cell] -= 1;
    });
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/dashboard/fyat" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to FYAT Hub
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{group.group_name}</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">{totalStudents} students have submitted their routines.</p>
        </div>
        <div className="flex gap-2"><CopyLinkButton groupId={resolvedParams.id} /></div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6 border border-border rounded-2xl bg-card p-6 shadow-sm overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 min-w-[600px]">
             <h2 className="text-lg font-bold flex items-center gap-2"><Map className="h-5 w-5 text-primary" /> Routine Heatmap</h2>
             <div className="flex flex-wrap gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500"></div> All Free</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500"></div> Partial</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500"></div> Busy</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500 flex items-center justify-center"><Lock className="h-2 w-2 text-blue-600 dark:text-blue-400" /></div> Mentor Busy</span>
             </div>
          </div>

          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-3 border border-border bg-muted/20 text-xs font-bold text-muted-foreground text-left">Time / Day</th>
                {days.map(day => <th key={day} className="p-3 border border-border bg-muted/20 text-xs font-bold text-foreground text-center">{day.substring(0,3).toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="p-3 border border-border bg-muted/10 text-xs font-bold text-muted-foreground whitespace-nowrap">{slot}</td>
                  {days.map((day) => {
                    const cellKey = `${day}-${slot}`;
                    const isMentorBusy = mentorBusyCells.has(cellKey);
                    const freeCount = heatmap[cellKey];
                    const ratio = totalStudents > 0 ? freeCount / totalStudents : 0;
                    
                    let bgClass = "bg-background text-muted-foreground border-border"; 
                    
                    if (isMentorBusy) {
                      bgClass = "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]";
                    } else if (totalStudents > 0) {
                      if (ratio === 1) {
                        bgClass = "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 font-black shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"; 
                      } else if (ratio > 0) {
                        bgClass = "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 font-bold"; 
                      } else {
                        bgClass = "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40 font-bold";
                      }
                    }

                    return (
                      <td key={cellKey} className={`p-3 border border-border text-center text-sm transition-colors hover:brightness-95 ${bgClass}`}>
                        {isMentorBusy ? (
                          <div className="flex flex-col items-center justify-center" title="You have class during this time">
                            <Lock className="h-4 w-4 mb-0.5 opacity-90" />
                            {totalStudents > 0 && <span className="text-[9px] opacity-70 tracking-wider">{freeCount}/{totalStudents} Free</span>}
                          </div>
                        ) : totalStudents === 0 ? "-" : `${freeCount}/${totalStudents}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">📝 Submissions</h2>
          {responses.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground bg-muted/20">
              <p className="text-sm">No submissions yet.</p>
              <p className="text-xs mt-1">Share the link to gather routines!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {responses.map((resp) => (
                <div key={resp.id} className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                  <p className="font-bold text-sm text-foreground">{resp.student_name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{resp.student_id}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resp.courses.split(',').map((c: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 bg-muted/30 text-[10px] font-bold text-foreground rounded border border-border">{c.trim()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}