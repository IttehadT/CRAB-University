export default function GlobalCopyright() {
  return (
    <div className="w-full border-t border-slate-200 bg-slate-50 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 sm:flex-row">
        <p>© 2026 CRAB University. All rights reserved.</p>
        <p>
          Designed & built by <span className="font-semibold text-blue-600 dark:text-blue-400">Ittehad Ahmed Tausif</span> · Dept. of CSE · BRAC University
        </p>
      </div>
    </div>
  );
}