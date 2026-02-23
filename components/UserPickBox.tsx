"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import { Trophy } from "lucide-react";

export default function UserPickBox({ user, rank, total }: any) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Safely determine if the user has formally entered the competition
  const noPick = !user?.pick || user.pick.symbol === "PENDING";
  
  const isPositive = !noPick && user.seasonReturn > 0;
  const isNegative = !noPick && user.seasonReturn < 0;
  
  const percentile = Math.max(1, Math.round((rank / total) * 100));
  const avatar = user?.avatarUrl || user?.image;

  return (
    <div 
      ref={boxRef} 
      className={cn(
        "arena-card h-full flex flex-col justify-between relative p-6 group overflow-hidden transition-colors duration-500",
        noPick ? "bg-gradient-to-br from-[#064e3b] via-black to-[#450a0a]" : 
        isPositive ? "bg-gradient-to-br from-black via-black to-[#064e3b]" : 
        isNegative ? "bg-gradient-to-br from-black via-black to-[#450a0a]" : 
        "bg-gradient-to-br from-[#fefce8] to-[#faf5ff]"
      )}
    >
      <div className={cn(
        "absolute inset-0 opacity-[0.03] pointer-events-none",
        !isPositive && !isNegative && !noPick ? "bg-[radial-gradient(#5865f2_1px,transparent_1px)]" : "bg-[radial-gradient(#ffffff_1px,transparent_1px)]",
        "[background-size:20px_20px]"
      )} />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white/10",
            !isPositive && !isNegative && !noPick ? "border-discord/20" : "border-white/20"
          )}>
            {avatar ? (
              <img src={avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-white">?</span>
            )}
          </div>

          <div className={cn(
            "text-xl font-black uppercase tracking-widest",
            !isPositive && !isNegative && !noPick ? "text-ink" : "text-white"
          )}>
            @{user?.username || "Guest"}
          </div>
        </div>

        <ShareMenu targetRef={boxRef} fileName={`my_pick_${user?.username || 'guest'}.png`} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-6 text-center">
         <h1 className={cn(
           "text-6xl lg:text-7xl font-black italic tracking-tighter leading-none mb-2",
           !isPositive && !isNegative && !noPick ? "text-ink" : "text-white"
         )}>
           {noPick ? ":ticket:" : user.pick.symbol.split('.')[0]}
         </h1>

         <div className={cn(
           "text-6xl font-mono font-black tracking-tighter",
           noPick ? "text-white" : isPositive ? "text-success" : isNegative ? "text-danger" : "text-ink"
         )}>
           {noPick ? ":ticket:" : (user.seasonReturn > 0 ? "+" : "") + user.seasonReturn.toFixed(2) + "%"}
         </div>
      </div>

      <div className={cn(
        "relative z-10 rounded-xl p-4 flex justify-between items-center border backdrop-blur-sm",
        !isPositive && !isNegative && !noPick
          ? "bg-white/50 border-discord/10" 
          : "bg-white/5 border-white/10"
      )}>
         {noPick ? (
           <div className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
             talk to someone on the server about adding your pick
           </div>
         ) : (
           <>
             <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className={!isPositive && !isNegative ? "text-discord" : "text-yellow-500"} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", !isPositive && !isNegative ? "text-discord" : "text-yellow-500")}>
                    Arena Rank
                  </span>
                </div>
                <div className={cn("text-2xl font-black leading-none", !isPositive && !isNegative ? "text-ink" : "text-white")}>
                  #{rank}
                </div>
             </div>

             <div className="text-right flex flex-col justify-center">
                <div className={cn(
                   "text-3xl font-black leading-none mb-1",
                   !isPositive && !isNegative ? "text-discord" : "text-white"
                )}>
                   TOP {percentile}%
                </div>
                <div className={cn("text-[12px] font-mono font-bold uppercase tracking-tighter", !isPositive && !isNegative ? "text-ink/10" : "text-gray-500")}>
                   of {total} participants
                </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
}