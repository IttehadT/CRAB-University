"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [serverStatus, setServerStatus] = useState<string>("Checking...");

  // Check server connection on load
  useEffect(() => {
    api.getHealth().then((data) => {
      if (data && data.status === "active") {
        setServerStatus("Online 🟢");
      } else {
        setServerStatus("Offline 🔴");
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Overview</h1>
          <p className="text-sm text-slate-500">Spring 2026</p>
        </div>
        
        {/* Server Status Badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium shadow-sm">
          <span className="text-slate-500">System:</span>
          <span className={serverStatus.includes("Online") ? "text-green-600" : "text-red-500"}>
            {serverStatus}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Current CGPA</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">3.85</p>
        </div>
        
        {/* Card 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Credits Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">85</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Next Class</p>
          <p className="mt-2 text-xl font-bold text-slate-900">CSE420 @ UB2040</p>
          <p className="text-xs text-blue-600">Starts in 45 mins</p>
        </div>
      </div>

      {/* Recent Notices Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Notices</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="font-semibold text-blue-900">Midterm Schedule Released</p>
            <p className="text-sm text-blue-700">Check your advising panel for seat plan.</p>
          </div>
          <div className="border-l-4 border-slate-300 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Library Closed on Friday</p>
            <p className="text-sm text-slate-600">Due to maintenance work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}