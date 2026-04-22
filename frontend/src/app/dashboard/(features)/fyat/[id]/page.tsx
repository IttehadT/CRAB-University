import { fetchFyatGroupDetails } from "@/lib/service";
import Link from "next/link";
import { Users, ArrowLeft, Link as LinkIcon, Map } from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";

export const metadata = { title: "FYAT Group Details | CRAB University" };

// Standard BRACU Slots
const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const slots = ["08:00 AM", "09:30 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"];

// 1. Update the interface to explicitly type params as a Promise
export default async function FyatGroupDetail({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. AWAIT the params before using the ID!
  const resolvedParams = await params;
  
  // 3. Now pass the unwrapped string ID to your service
  const { group, responses } = await fetchFyatGroupDetails(resolvedParams.id);
  
  const totalStudents = responses.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* ── HEADER & BACK BUTTON ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/dashboard/fyat" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to FYAT Hub
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {group.group_name}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {totalStudents} students have submitted their routines.
          </p>
        </div>
        
        <div className="flex gap-2">
          <CopyLinkButton groupId={resolvedParams.id} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        
        {/* ── LEFT: THE HEATMAP GRID ── */}
        <div className="space-y-6 border border-border rounded-2xl bg-card p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px]">
             <h2 className="text-lg font-bold flex items-center gap-2"><Map className="h-5 w-5 text-primary" /> Routine Heatmap</h2>
             <div className="flex gap-4 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500"></div> All Free</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500"></div> Partial</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500"></div> Busy</span>
             </div>
          </div>

          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-border bg-muted/20 text-xs font-bold text-muted-foreground">Time / Day</th>
                {days.map(day => (
                  <th key={day} className="p-2 border border-border bg-muted/20 text-xs font-bold text-foreground">{day.substring(0,3).toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="p-3 border border-border bg-muted/10 text-xs font-bold text-muted-foreground whitespace-nowrap text-center">
                    {slot}
                  </td>
                  {days.map((day) => {
                    const freeCount = Math.floor(Math.random() * (totalStudents + 1)); 
                    const ratio = totalStudents > 0 ? freeCount / totalStudents : 0;
                    
                    let bgClass = "bg-red-500/10 text-red-600 border-red-500/20"; 
                    if (ratio === 1) bgClass = "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 font-bold"; 
                    else if (ratio > 0.5) bgClass = "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"; 

                    return (
                      <td key={`${day}-${slot}`} className={`p-2 border border-border text-center text-xs font-medium cursor-pointer transition-colors hover:brightness-95 ${bgClass}`}>
                        {freeCount}/{totalStudents}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── RIGHT: RESPONSES LIST ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            📝 Submissions
          </h2>
          <div className="grid gap-3">
            {responses.map((resp) => (
              <div key={resp.id} className="p-4 rounded-xl border border-border bg-card">
                <p className="font-bold text-sm text-foreground">{resp.student_name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{resp.student_id}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resp.courses.split(',').map((c: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-muted/50 text-[10px] font-bold text-muted-foreground rounded border border-border">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}