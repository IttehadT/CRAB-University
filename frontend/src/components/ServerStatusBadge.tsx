"use client";

import { useState } from "react";

export function ServerStatusBadge() {
  const [serverStatus, setServerStatus] = useState<string>("Checking...");

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm font-medium shadow-sm">
      <span className="text-slate-500 dark:text-slate-400">System:</span>
      <span className={serverStatus.includes("Online") ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
        {serverStatus}
      </span>
    </div>
  );
}