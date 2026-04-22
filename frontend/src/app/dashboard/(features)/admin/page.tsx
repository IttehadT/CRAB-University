"use client";

import { useState, useEffect } from "react";
import { Users, Ticket, RefreshCw, Mail, Trash2, KeyRound, Inbox, X, Send, AlertTriangle, Copy, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ── TYPES ──
type Toast = { message: string; type: "success" | "error" | "info" } | null;
type EmailDraft = { isOpen: boolean; to: string; subject: string; message: string };
type DeleteTarget = { isOpen: boolean; id: string; name: string };

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<"users" | "tickets">("users");
  const [isSyncing, setIsSyncing] = useState(false);
  
  // ── REAL DATA STATES ──
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── UI STATES (Replacing Alerts/Confirms) ──
  const [toast, setToast] = useState<Toast>(null);
  const [emailModal, setEmailModal] = useState<EmailDraft>({ isOpen: false, to: "", subject: "", message: "" });
  const [deleteModal, setDeleteModal] = useState<DeleteTarget>({ isOpen: false, id: "", name: "" });
  
  const supabase = createClient();

  // ── TOAST CONTROLLER ──
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto-dismiss after 4 seconds
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } catch (error) {
        showToast("Failed to fetch users", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleMasterSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/sync?key=super-secret-crab");
      const data = await res.json();
      showToast(data.message || "Sync Complete!", "success");
      
      const userRes = await fetch("/api/admin/users");
      const userData = await userRes.json();
      if (userData.users) setUsers(userData.users);
    } catch (error) {
      showToast("Sync failed. Check console.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ── ACTION HANDLERS ──
  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Are you sure you want to send a password reset link to ${email}?`)) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      showToast(`Password reset link sent to ${email}`, "success");
    } catch (error: any) {
      showToast("Failed to send reset email: " + error.message, "error");
    }
  };

  const executeDeleteUser = async () => {
    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", userId: deleteModal.id })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      showToast("User permanently deleted.", "success");
      setUsers(users.filter(u => u.id !== deleteModal.id)); 
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error: any) {
      showToast("Failed to delete user: " + error.message, "error");
    }
  };

  const handleSendNotification = async () => {
    if (!emailModal.subject || !emailModal.message) {
      showToast("Please fill out the subject and message.", "error");
      return;
    }
    
    // Note: This is currently a UI stub. We will build the Resend API to actually send this later!
    showToast(`Notification sent to ${emailModal.to}`, "success");
    setEmailModal({ isOpen: false, to: "", subject: "", message: "" });
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto relative">
      
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
          <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">{users.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "tickets" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Ticket className="h-4 w-4" /> Support Tickets
          {tickets.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{tickets.length}</span>
          )}
        </button>
      </div>

      {/* ── TAB CONTENT: USERS ── */}
      {activeTab === "users" && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="font-bold text-foreground">Registered Users</h2>
            <input 
              type="text" 
              placeholder="Search ID, email, or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-blue-500 w-full sm:w-72"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-foreground">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground animate-pulse">
                      Loading user database...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span title={user.id}>
                            {user.id.substring(0, 4)}...{user.id.substring(user.id.length - 4)}
                          </span>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(user.id); showToast("ID copied!", "success"); }}
                            className="text-slate-400 hover:text-foreground transition-colors"
                            title="Copy ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-9 w-9 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{user.full_name || "Unknown Name"}</p>
                          <p className="text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.provider === 'google' && <span className="text-red-500 font-bold">G</span>}
                          {user.provider === 'email' && <Mail className="h-3 w-3 text-blue-500" />}
                          <span className="capitalize">{user.provider}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-medium text-foreground">
                          {new Date(user.last_sign_in_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(user.last_sign_in_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleResetPassword(user.email)} title="Send Reset Password Link" className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"><KeyRound className="h-4 w-4" /></button>
                          
                          {/* Opens the Custom Notification Modal */}
                          <button onClick={() => setEmailModal({ isOpen: true, to: user.email, subject: "", message: "" })} title="Send Notification" className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Mail className="h-4 w-4" /></button>
                          
                          {/* Opens the Custom Delete Modal */}
                          <button onClick={() => setDeleteModal({ isOpen: true, id: user.id, name: user.full_name || user.email })} title="Delete User" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: TICKETS ── */}
      {activeTab === "tickets" && (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border rounded-xl bg-card text-center">
           <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
           <p className="font-bold text-lg text-foreground">No tickets for now.</p>
           <p className="text-sm text-muted-foreground mt-1 max-w-sm">When students submit bug reports or support requests, they will appear here.</p>
        </div>
      )}

      {/* ── CUSTOM MODALS & TOASTS ── */}

      {/* 1. Global Animated Toast (Bottom Right) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "success" ? "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/40 dark:text-green-100 dark:border-green-800" :
          toast.type === "error" ? "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800" :
          "bg-card text-foreground border-border"
        }`}>
          {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-current opacity-50 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* 2. Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-600/10 rounded-full"><Trash2 className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold text-foreground">Delete User?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you absolutely sure you want to permanently delete <strong className="text-foreground">{deleteModal.name}</strong>? This will wipe their identity from Supabase and their data from MySQL. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })} className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={executeDeleteUser} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md">Yes, Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Notification Modal */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Send Notification</h3>
              <button onClick={() => setEmailModal({ ...emailModal, isOpen: false })} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">To</label>
                <input type="text" disabled value={emailModal.to} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Action Required: Account Update" 
                  value={emailModal.subject}
                  onChange={(e) => setEmailModal({ ...emailModal, subject: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Message</label>
                <textarea 
                  rows={5}
                  placeholder="Write your notification content here..." 
                  value={emailModal.message}
                  onChange={(e) => setEmailModal({ ...emailModal, message: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button onClick={() => setEmailModal({ ...emailModal, isOpen: false })} className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSendNotification} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
                <Send className="h-4 w-4" /> Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}