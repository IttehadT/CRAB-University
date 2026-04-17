import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Calendar, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  // Fetch user
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. If not logged in, kick to login
  if (!user?.email) {
    redirect("/login");
  }

  // ── THE ONBOARDING GUARD ──
  // 2. Check if they clicked "Skip" recently
  const hasSkipped = cookieStore.get("crabu_skipped_onboarding")?.value === "true";
  
  // 3. TODO: Fetch from your MySQL `user_academic_profiles` table
  // const profile = await getUserAcademicProfile(user.id);
  const profile = null; // Simulating no profile for now

  // 4. If they have no profile AND haven't skipped, force them to Get Started flag
  // if (!profile && !hasSkipped) {
  //   redirect("/dashboard/get-started");
  // }

  // ── RENDER THE UI (If they pass the guard) ──
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  const dummyAcademicData = {
    cgpa: "3.85",
    credits: 85,
    semester: "Spring 2026",
    nextClass: { course: "CSE420", room: "UB2040", time: "Starts in 45 mins" }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── 1. WELCOME SECTION ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Here is your academic overview for {dummyAcademicData.semester}.
        </p>
      </div>

      {/* ── 2. ACADEMIC STATS CARDS ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* CGPA Card (Blue Primary) */}
        <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{dict.dashboard.cgpa}</p>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tight">{dummyAcademicData.cgpa}</p>
        </div>
        
        {/* Credits Card (Purple) */}
        <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-purple/10 text-primary-purple">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{dict.dashboard.credits}</p>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tight">{dummyAcademicData.credits} <span className="text-lg font-medium text-muted-foreground tracking-normal">Earned</span></p>
        </div>

        {/* Next Class Card (Green) */}
        <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
           <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-green/10 text-primary-green">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{dict.dashboard.nextClass}</p>
          </div>
          <p className="text-xl font-bold text-foreground">{dummyAcademicData.nextClass.course} <span className="text-muted-foreground font-medium">@ {dummyAcademicData.nextClass.room}</span></p>
          <p className="text-sm font-bold text-primary-green mt-1">{dummyAcademicData.nextClass.time}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── 3. RECENT NOTICES ── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h2 className="mb-5 text-lg font-bold text-foreground flex items-center gap-2">
            📌 Recent Notices
          </h2>
          <div className="space-y-3 flex-1">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition hover:bg-primary/10 cursor-pointer">
              <p className="font-bold text-primary">Midterm Schedule Released</p>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">Check your advising panel for seat plan.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 transition hover:bg-muted/50 cursor-pointer">
              <p className="font-bold text-foreground">Library Closed on Friday</p>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">Due to maintenance work across the campus.</p>
            </div>
          </div>
        </div>

        {/* ── 4. BROWSE NEW FEATURES ── */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <h2 className="mb-5 text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-purple" /> Discover CRABU
          </h2>
          <div className="space-y-3 flex-1">
            
            <Link href="/dashboard/finder" className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition hover:border-primary-purple/30 hover:bg-primary-purple/5">
              <div>
                <p className="font-bold text-foreground group-hover:text-primary-purple transition-colors">Routine Finder</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">Generate clash-free schedules instantly.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-purple transition-colors" />
            </Link>

            <Link href="/dashboard/evaluation" className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition hover:border-primary-green/30 hover:bg-primary-green/5">
              <div>
                <p className="font-bold text-foreground group-hover:text-primary-green transition-colors">Degree Evaluation</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">Track remaining courses for graduation.</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-green transition-colors" />
            </Link>

          </div>
        </div>
      </div>

    </div>
  );
}