"use client";

import { useState } from "react";
import { ArrowRightLeft, Plus, Search, Clock, User, CheckCircle, X, AlertCircle } from "lucide-react";

export default function SwapUI({ initialSwaps }: { initialSwaps: any[] }) {
  const [swaps, setSwaps] = useState<any[]>(initialSwaps);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "COMPLETED">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [newSwap, setNewSwap] = useState({ courseCode: "", haveSec: "", wantSec: "", notes: "" });

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`This will hit a Server Action to create a swap for ${newSwap.courseCode}!`);
    setIsAddModalOpen(false);
    setNewSwap({ courseCode: "", haveSec: "", wantSec: "", notes: "" });
  };

  const filteredSwaps = swaps.filter(swap => {
    const matchesSearch = swap.course_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          swap.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "ALL" ? true : swap.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            Course Swap
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Trade sections with other students to perfect your routine.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Swap Request
        </button>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border">
          {["ALL", "AVAILABLE", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "All Requests" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search course code (e.g. CSE420)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* ── SWAP CARDS GRID ── */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredSwaps.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-muted/10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="font-bold text-foreground">No swap requests found.</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredSwaps.map((swap) => (
            <div key={swap.id} className={`flex flex-col rounded-2xl border transition-all hover:shadow-md ${
              swap.status === "COMPLETED" ? "border-border bg-muted/30 opacity-70" : "border-border bg-card hover:border-primary/30"
            }`}>
              
              {/* Card Header */}
              <div className="p-5 border-b border-border flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">{swap.course_code}</h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Posted by {swap.student_name}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                  swap.status === "AVAILABLE" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                }`}>
                  {swap.status}
                </span>
              </div>

              {/* Card Body: The Swap Details */}
              <div className="p-5 grid grid-cols-[1fr_auto_1fr] gap-4 items-center flex-1">
                
                {/* Offering (HAVE) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">Offering</span>
                  <div>
                    <p className="text-2xl font-bold text-primary-purple mb-2">Sec {swap.have_section}</p>
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground"/> {swap.have_faculty || "TBA"}
                      </p>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5"/> 
                        <div className="flex flex-col leading-tight gap-0.5">
                           {swap.have_time ? swap.have_time.split('\n').map((timeLine: string, i: number) => (
                             <span key={i}>{timeLine}</span>
                           )) : "TBA"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ArrowRightLeft className="h-6 w-6 opacity-30" />
                </div>

                {/* Seeking (WANT) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">Seeking</span>
                  <div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {swap.want_section.toUpperCase() === "ANY" ? "ANY" : `Sec ${swap.want_section}`}
                    </p>
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground"/> {swap.want_faculty || "TBA"}
                      </p>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5"/> 
                        <div className="flex flex-col leading-tight gap-0.5">
                           {swap.want_time ? swap.want_time.split('\n').map((timeLine: string, i: number) => (
                             <span key={i}>{timeLine}</span>
                           )) : "TBA"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                {swap.status === "AVAILABLE" ? (
                  <button className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-sm font-bold rounded-lg transition-colors">
                    Contact Student
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 text-sm font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Swap Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── ADD SWAP MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Post Swap Request
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateSwap} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Course Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CSE420" 
                  value={newSwap.courseCode}
                  onChange={(e) => setNewSwap({ ...newSwap, courseCode: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary uppercase" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <label className="block text-xs font-bold text-primary-purple uppercase mb-1.5">Section I Have</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 01" 
                    value={newSwap.haveSec}
                    onChange={(e) => setNewSwap({ ...newSwap, haveSec: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary-purple" 
                  />
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <label className="block text-xs font-bold text-primary uppercase mb-1.5">Section I Want</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 03 or ANY" 
                    value={newSwap.wantSec}
                    onChange={(e) => setNewSwap({ ...newSwap, wantSec: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Additional Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Willing to swap lab sections only..." 
                  value={newSwap.notes}
                  onChange={(e) => setNewSwap({ ...newSwap, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}