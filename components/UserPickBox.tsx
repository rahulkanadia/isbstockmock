"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function UserPickBox({ user, rank }: any) {
  const boxRef = useRef<HTMLDivElement>(null);
  if (!user || !user.pick) return null;

  const ret = user.seasonReturn || 0;
  const isGreen = ret >= 0;

  return (
    <div ref={boxRef} className="relative flex h-full w-full flex-col justify-center rounded-xl bg-white p-10 shadow-float border border-discord/10">
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-discord animate-pulse" />
        <span className="text-[10px] font-black text-discord uppercase tracking-widest">Active Stake</span>
      </div>

      <div className="mb-2 text-[11px] font-bold text-gray-400">@{user.username}</div>
      <div className="text-7xl font-black tracking-tighter text-ink mb-8">{user.pick.symbol}</div>

      <div className="grid grid-cols-2 gap-8 mb-10 border-t border-gray-50 pt-8">
         <div>
            <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Entry Value</span>
            <span className="text-xl font-mono font-bold text-ink">₹{user.pick.entryPrice.toFixed(2)}</span>
         </div>
         <div>
            <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Total Yield</span>
            <div className={cn("flex items-center gap-1 text-xl font-mono font-bold", isGreen ? "text-success" : "text-danger")}>
                {isGreen ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                {ret > 0 ? "+" : ""}{ret.toFixed(2)}%
            </div>
         </div>
      </div>

      <div className="w-full rounded-lg bg-ink py-4 text-center">
         <span className="text-xs font-black text-white uppercase tracking-widest">Global Rank #{rank}</span>
      </div>

      <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2">
        <ShareMenu targetRef={boxRef} fileName={`my-pick.png`} />
      </div>
    </div>
  );
}
