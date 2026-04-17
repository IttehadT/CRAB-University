import { createClient } from "@/lib/supabase/server";
import { User, Mail, GraduationCap, ShieldAlert, Calendar } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Format account creation date
  const createdDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your identity, academic profile, and data.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* ── 1. ACCOUNT IDENTITY ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Identity
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input 
                type="text" 
                defaultValue={user.user_metadata?.full_name || ""} 
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address (Uneditable)
              </label>
              <input 
                type="text" 
                disabled 
                value={user.email} 
                className="mt-1.5 w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed" 
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" /> Role
                </label>
                <p className="mt-1 font-semibold text-foreground capitalize">{user.user_metadata?.role || "Student"}</p>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Member Since
                </label>
                <p className="mt-1 font-semibold text-foreground">{createdDate}</p>
              </div>
            </div>

            <button className="w-full mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-sm">
              Save Identity Changes
            </button>
          </div>
        </div>

        {/* ── 2. ACADEMIC PROFILE ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary-purple" /> Academic Profile
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student ID</label>
                <input type="text" placeholder="e.g. 23201642" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-purple focus:outline-none focus:ring-1 focus:ring-primary-purple" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</label>
                <input type="text" placeholder="e.g. CSE" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-purple focus:outline-none focus:ring-1 focus:ring-primary-purple" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current CGPA</label>
                <input type="number" step="0.01" placeholder="e.g. 3.85" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-purple focus:outline-none focus:ring-1 focus:ring-primary-purple" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Credits Earned</label>
                <input type="number" step="0.5" placeholder="e.g. 85.0" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-purple focus:outline-none focus:ring-1 focus:ring-primary-purple" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted">
                Re-Upload PDF
              </button>
              <button className="flex-1 rounded-lg bg-primary-purple px-4 py-2.5 text-sm font-bold text-primary-purple-foreground transition hover:opacity-90 shadow-sm">
                Update Academic Info
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. DANGER ZONE ── */}
      <div className="mt-10 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-destructive flex items-center gap-2 mb-4">
          Danger Zone
        </h2>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">Delete Account</p>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account, academic profile, and all saved routines. This action cannot be undone.
            </p>
          </div>
          <button className="shrink-0 rounded-lg bg-destructive px-6 py-2.5 text-sm font-bold text-destructive-foreground transition hover:opacity-90 shadow-sm">
            Delete My Account
          </button>
        </div>
      </div>

    </div>
  );
}