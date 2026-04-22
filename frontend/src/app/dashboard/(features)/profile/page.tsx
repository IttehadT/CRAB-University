"use client";

import { useState } from "react";
import { Users, Ticket, RefreshCw, Mail, Trash2, KeyRound, CheckCircle } from "lucide-react";

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<"users" | "tickets">("users");
  const [isSyncing, setIsSyncing] = useState(false);

  // We will wire this up to your actual API in the next step!
  const handleMasterSync = async () => {
    setIsSyncing(true);
    // Simulation for now
    setTimeout(() => {
      alert("Master Sync Complete. Aiven MySQL is now perfectly matched with Supabase.");
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* ── HEADER & SYNC BUTTON ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            🛡️ Admin Command Center
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Manage student accounts, synchronize databases, and resolve support tickets.
          </p>
        </div>
        
        <button
          onClick={handleMasterSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600/10 border border-red-600/20 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Synchronizing..." : "Force Master Sync"}
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "users" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "tickets" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Ticket className="h-4 w-4" /> Support Tickets
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">3</span>
        </button>
      </div>

      {/* ── TAB CONTENT: USERS ── */}
      {activeTab === "users" && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h2 className="font-bold text-foreground">Registered Students</h2>
            <input 
              type="text" 
              placeholder="Search email or ID..." 
              className="text-sm px-3 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-foreground">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Student</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Dummy Row - Will be replaced with real map() */}
                <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">I</div>
                    <div>
                      <p className="font-bold text-foreground">Ittehad Ahmed Tausif</p>
                      <p className="text-xs">ittehad@crabu.app</p>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-purple-500/10 text-purple-600 text-xs font-bold uppercase">Admin</span></td>
                  <td className="px-6 py-4">Google OAuth</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button title="Reset Password" className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"><KeyRound className="h-4 w-4" /></button>
                    <button title="Send Email" className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Mail className="h-4 w-4" /></button>
                    <button title="Delete User" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: TICKETS ── */}
      {activeTab === "tickets" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dummy Ticket Card */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 relative group">
            <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded-full">Urgent</span>
            <div className="flex gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">S</div>
              <div>
                <p className="font-bold text-foreground">Student Name</p>
                <p className="text-xs text-muted-foreground">Reported 2 hours ago</p>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Bug in Circuit Simulator</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              When I try to connect the 74LS08 AND gate to the oscilloscope, the page freezes and throws a 500 error.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted px-3 py-2 rounded-lg text-sm font-bold text-foreground transition-colors">
                <Mail className="h-4 w-4" /> Reply
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white px-3 py-2 rounded-lg text-sm font-bold text-green-600 transition-colors">
                <CheckCircle className="h-4 w-4" /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}