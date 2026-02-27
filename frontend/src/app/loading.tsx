export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        {/* The Spinning Circle */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <span className="text-xl">🦀</span>
        </div>
        
        {/* The Pulsing Text */}
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-bold text-slate-900 animate-pulse">
            CRAB University
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Loading your portal...
          </p>
        </div>
      </div>
    </div>
  );
}