"use client";

import { useState, useEffect, useTransition } from "react";
import { LifeBuoy, Send, Clock, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { submitTicketAction, getMyTicketsAction } from "./actions";

export default function SupportPage() {
  const { showToast, ToastComponent } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("BUG");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // History State
  const [tickets, setTickets] = useState<any[]>([]);

  const CATEGORIES = [
    { id: "BUG", label: "Report a Bug" },
    { id: "FEATURE", label: "Feature Request" },
    { id: "ACCOUNT", label: "Account Issue" },
    { id: "ROUTINE", label: "Routine Finder Issue" },
    { id: "OTHER", label: "Other Inquiry" },
  ];

  const loadTickets = async () => {
    setIsLoadingHistory(true);
    const res = await getMyTicketsAction();
    if (res.success && res.data) {
      setTickets(res.data);
    }
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      showToast("Subject and Description are required.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("image_url", imageUrl);

    startTransition(async () => {
      const res = await submitTicketAction(formData);
      if (res.success) {
        showToast("Ticket submitted successfully! Admin will review it soon.", "success");
        // Reset form
        setSubject("");
        setDescription("");
        setImageUrl("");
        setCategory("BUG");
        // Refresh history
        loadTickets();
      } else {
        showToast(res.error || "Failed to submit ticket.", "error");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <LifeBuoy className="h-8 w-8 text-[#0070F3]" />
          Support Center
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Report issues, request features, or get help with your account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT: TICKET SUBMISSION FORM ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-lg font-bold text-foreground">Open a New Ticket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                  <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the issue..." className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        type="button" 
                        onClick={() => setCategory(cat.id)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${category === cat.id ? 'bg-[#0070F3]/10 border-[#0070F3]/30 text-[#0070F3]' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Detailed Description</label>
                <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please describe the issue in detail. Steps to reproduce the bug are highly appreciated." className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Screenshot URL (Optional)</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://imgur.com/... or any image link" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0070F3] text-white text-sm font-bold shadow-md hover:bg-[#0070F3]/90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Ticket</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: TICKET HISTORY ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-border bg-muted/20 shrink-0">
              <h2 className="text-lg font-bold text-foreground">My Tickets</h2>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">You haven't submitted any tickets yet.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070F3] bg-[#0070F3]/10 px-2 py-0.5 rounded">
                        {ticket.category}
                      </span>
                      {ticket.status === 'RESOLVED' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><CheckCircle className="h-3 w-3" /> Resolved</span>
                      ) : ticket.status === 'IN_PROGRESS' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><Clock className="h-3 w-3" /> In Progress</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><Clock className="h-3 w-3" /> Open</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                      Submitted on {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      {ToastComponent}
    </div>
  );
}