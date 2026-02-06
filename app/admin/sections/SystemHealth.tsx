"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type HealthStats = {
  multiPickViolations: number;
  violatorIds: string[];
  activeTraders: number;
  syncFailures: number;
};

export function SystemHealth() {
  const router = useRouter();
  const [stats, setStats] = useState<HealthStats>({
    multiPickViolations: 0,
    violatorIds: [],
    activeTraders: 0,
    syncFailures: 0
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(e => console.error(e));
  }, []);

  const isCritical = stats.multiPickViolations > 0 || stats.syncFailures > 0;
  const statusText = isCritical ? "NEEDS ATTENTION" : "ALL GOOD";
  const statusColor = isCritical ? "bg-red-500" : "bg-green-500";
  const borderColor = isCritical ? "border-l-red-500" : "border-l-green-500";

  // Note: We can't filter UserTable by ID easily without updating UserTable logic
  // For now, this is informational.
  const handleFilterViolators = () => {
    // Placeholder: You would implement ID-based filtering in UserTable
    alert(`Violator IDs: ${stats.violatorIds.join(", ")}`);
  };

  return (
    <div className={`bg-white rounded-xl p-6 border-l-[6px] border-y border-r border-zinc-200 shadow-sm h-full flex flex-col justify-between ${borderColor}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          System Health
        </h3>
        <div className={`w-32 h-6 flex items-center justify-center text-[10px] font-bold text-white rounded tracking-wide ${statusColor}`}>
          {statusText}
        </div>
      </div>

      {/* METRICS */}
      <div className="space-y-4 mb-6">

        {/* Metric 1 */}
        <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-600">Active Traders</span>
           <span className="font-mono font-bold text-zinc-900">
             {stats.activeTraders}
           </span>
        </div>

        {/* Metric 2: Multi-pick (Clickable Filter) */}
        <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-600">Multi-pick violations</span>
           <button 
             onClick={handleFilterViolators}
             disabled={stats.multiPickViolations === 0}
             className={`font-mono font-bold px-2 py-0.5 rounded transition-all ${
               stats.multiPickViolations > 0 
                 ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer decoration-red-600 underline underline-offset-2" 
                 : "text-zinc-400 cursor-default"
             }`}
           >
             {stats.multiPickViolations}
           </button>
        </div>

        {/* Metric 3: Price Sync */}
        <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-600">Price Sync Failures</span>
           <span className={`font-mono font-bold ${stats.syncFailures > 0 ? "text-red-600" : "text-zinc-400"}`}>
             {stats.syncFailures}
           </span>
        </div>
      </div>

      {/* FOOTER: TRIGGER UPDATE */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="text-[10px] text-zinc-400 font-mono mb-2 text-right">
            Auto-sync runs daily at 16:00 IST
        </div>
        <button 
            disabled={stats.syncFailures === 0}
            className={`w-full py-2 rounded-lg text-xs font-bold transition-colors border ${
                stats.syncFailures > 0
                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-md"
                    : "bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed"
            }`}
        >
            Trigger Price Update
        </button>
      </div>

    </div>
  );
}
