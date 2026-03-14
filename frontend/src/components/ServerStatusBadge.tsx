"use client";

import { useState } from "react";

export function ServerStatusBadge() {
  const [serverStatus, setServerStatus] = useState<string>("Checking...");

  return (
    <div className="flex items-center gap-2 rounded-full border border-border dark:border-slate-700 bg-card dark:bg-slate-800 px-3 py-1 text-sm font-medium shadow-sm">
      <span className="text-muted-foreground dark:text-slate-400">System:</span>
      <span className={serverStatus.includes("Online") ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
        {serverStatus}
      </span>
    </div>
  );
}