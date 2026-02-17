"use client";
import { cn } from "@/lib/utils";

export default function MonthlyCard({ month, year, cohortReturn, winner, isCurrent }: any) {
  // Champion/Leading text color logic
  const labelColor = isCurrent ? "text-discord" : "text-yellow-500";
  const labelText = isCurrent ? "Leading" : "Champion";

  return (
    <div className={cn(
      "min-w-[280px] h-[240px] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group border transition-all duration-300",
      isCurrent ? "bg-white border-discord/40 shadow-xl scale-105 ring-4 ring-discord/5" : "bg-white border-gray-100"
    )}>

      {/* HEADER: Year and Month in one line */}
      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
         <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase text-ink">{month}</span>
            <span className="text-[10px] font-bold text-gray-400">{year}</span>
         </div>
         {isCurrent && (
            <span className="bg-discord/10 text-discord text-[8px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
              Active
            </span>
         )}
      </div>

      {/* HERO SECTION: ISB Center Focus */}
      <div className="flex flex-col items-center justify-center py-2">
         {/* Row 1: Avatar and ISB on the same line */}
         <div className="flex items-center gap-2">
            <span className="text-3xl">😶‍🌫️</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-ink leading-none">
               ISB
            </h2>
         </div>

         {/* Row 2: P&L */}
         <div className={cn(
            "text-3xl font-mono font-black mt-1", 
            cohortReturn >= 0 ? "text-success" : "text-danger"
         )}>
            {cohortReturn > 0 ? "+" : ""}{cohortReturn.toFixed(2)}%
         </div>
      </div>

      {/* WINNER BOX (Redesigned) */}
      <div className={cn(
         "rounded-xl p-3 flex flex-col gap-1 transition-colors",
         isCurrent ? "bg-gray-50 border border-gray-100" : "bg-ink"
      )}>
         {winner ? (
            <>
               {/* Row 1: Label */}
               <div className={cn("text-[8px] font-black uppercase tracking-widest text-center", labelColor)}>
                  {labelText}
               </div>
               
               {/* Row 2: Username */}
               <div className={cn("text-[10px]] font-bold text-center", labelColor)}>
                  @{winner.username}
               </div>

               {/* Row 3: Stock | P&L */}
               <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                  <span className={cn("text-[12px] font-black", labelColor)}>
                     {winner.pick?.symbol?.split('.')[0]}
                  </span>
                  <span className={cn("text-[14px] font-mono font-bold", winner.monthlyReturn >= 0 ? "text-success" : "text-danger")}>
                     {winner.monthlyReturn > 0 ? "+" : ""}{winner.monthlyReturn.toFixed(1)}%
                  </span>
               </div>
            </>
         ) : (
             <span className="text-[10px] text-gray-400 font-bold italic text-center py-2">No data recorded</span>
         )}
      </div>
    </div>
  );
}