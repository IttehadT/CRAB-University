"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [serverStatus, setServerStatus] = useState<string>("Checking...");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Spring 2026</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm font-medium shadow-sm">
          <span className="text-slate-500 dark:text-slate-400">System:</span>
          <span className={serverStatus.includes("Online") ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
            {serverStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current CGPA</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">3.85</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Credits Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">85</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Next Class</p>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">CSE420 @ UB2040</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Starts in 45 mins</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Recent Notices</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="font-semibold text-blue-900 dark:text-blue-300">Midterm Schedule Released</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">Check your advising panel for seat plan.</p>
          </div>
          <div className="border-l-4 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-4">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Library Closed on Friday</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Due to maintenance work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}