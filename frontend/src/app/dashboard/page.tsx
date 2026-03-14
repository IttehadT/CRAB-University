import { getDictionary } from "@/lib/i18n/dictionaries";
import { ServerStatusBadge } from "@/components/ServerStatusBadge";

export default async function DashboardPage() {
  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-slate-100">{dict.dashboard.overview}</h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400">{dict.dashboard.semester}</p>
        </div>
        
        <ServerStatusBadge />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">{dict.dashboard.cgpa}</p>
          <p className="mt-2 text-3xl font-bold text-foreground dark:text-slate-100">3.85</p>
        </div>
        
        <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">{dict.dashboard.credits}</p>
          <p className="mt-2 text-3xl font-bold text-foreground dark:text-slate-100">85</p>
        </div>

        <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">{dict.dashboard.nextClass}</p>
          <p className="mt-2 text-xl font-bold text-foreground dark:text-slate-100">CSE420 @ UB2040</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Starts in 45 mins</p>
        </div>
      </div>

      <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-foreground dark:text-slate-100">Recent Notices</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 dark:border-blue-600 bg-primary-muted dark:bg-blue-900/20 p-4">
            <p className="font-semibold text-blue-900 dark:text-blue-300">Midterm Schedule Released</p>
            <p className="text-sm text-primary dark:text-blue-400">Check your advising panel for seat plan.</p>
          </div>
          <div className="border-l-4 border-slate-300 dark:border-slate-600 bg-background dark:bg-slate-800 p-4">
            <p className="font-semibold text-foreground dark:text-slate-100">Library Closed on Friday</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">Due to maintenance work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}