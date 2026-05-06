import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Calendar, BookOpen, GraduationCap, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchUserAcademicProfile } from "@/lib/service";
import { siteConfig } from "@/config/site";

export default async function DashboardPage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  
  // Fetch user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    redirect("/login");
  }

  // Fetch real profile data from MySQL
  const profile = await fetchUserAcademicProfile(user.id);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── 1. WELCOME SECTION ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Here is your academic overview for {siteConfig.currentSemester}.
        </p>
      </div>

      {/* ── 2. ACADEMIC STATS CARDS ── */}
      {profile ? (
        <div className="grid gap-4 md:grid-cols-3">
          {/* CGPA Card */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{dict.dashboard.cgpa}</p>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tight">{Number(profile.cgpa).toFixed(2)}</p>
          </div>
          
          {/* Credits Card */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{dict.dashboard.credits}</p>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tight">
              {Number(profile.completed_credits).toFixed(1)} <span className="text-lg font-medium text-muted-foreground tracking-normal">Earned</span>
            </p>
          </div>

          {/* Next Class Card (Placeholder for Routine Integration) */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
             <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{dict.dashboard.nextClass}</p>
            </div>
            <p className="text-xl font-bold text-foreground">No classes today</p>
            <Link href="/dashboard/routine" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block">
              View full routine &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* ── EMPTY STATE (If they skipped onboarding) ── */
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center shadow-sm relative overflow-hidden">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your Profile is Incomplete</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            {/* Unlock CGPA predictions, intelligent degree evaluation, and personalized course recommendations by setting up your academic profile. */}
            Unlock CGPA predictions, intelligent degree evaluation, and personalized course recommendations by setting up your academic profile.
          </p>
          <Link 
            href="/dashboard/get-started" 
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Complete Setup Now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── 3. RECENT NOTICES ── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h2 className="mb-5 text-lg font-bold text-foreground flex items-center gap-2">
            📌 Recent Notices
          </h2>
          <div className="space-y-3 flex-1">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition hover:bg-primary/10 cursor-pointer">
              <p className="font-semibold text-primary">Midterm Schedule Released</p>
              <p className="text-sm text-muted-foreground mt-1">Check your advising panel for seat plan.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 transition hover:bg-muted/50 cursor-pointer">
              <p className="font-semibold text-foreground">Library Closed on Friday</p>
              <p className="text-sm text-muted-foreground mt-1">Due to maintenance work across the campus.</p>
            </div>
          </div>
        </div>

        {/* ── 4. BROWSE NEW FEATURES ── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h2 className="mb-5 text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" /> Discover CRABU
          </h2>
          <div className="space-y-3 flex-1">
            
            <Link href="/dashboard/finder" className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition hover:border-purple-500/30 hover:bg-purple-500/5">
              <div>
                <p className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Routine Finder</p>
                <p className="text-sm text-muted-foreground mt-1">Generate clash-free schedules instantly.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </Link>

            <Link href="/dashboard/evaluation" className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/5">
              <div>
                <p className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Degree Evaluation</p>
                <p className="text-sm text-muted-foreground mt-1">Track remaining courses for graduation.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </Link>

          </div>
        </div>
      </div>

    </div>
  );
}