"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";

interface UserPickBoxProps {
  user: any; 
  rank: number;
}

export default function UserPickBox({ user, rank }: UserPickBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  
  if (!user || !user.pick) return null;

  const current = user.pick.latestPrice || user.pick.entryPrice;
  const ret = ((current - user.pick.entryPrice) / user.pick.entryPrice) * 100;
  
  return (
    <div 
      ref={boxRef}
      className="relative flex h-full w-full flex-col justify-center rounded-3xl bg-white p-8 shadow-float"
    >
      {/* Identity */}
      <div className="text-sm font-medium text-gray-400 mb-2">@{user.username}</div>
      
      {/* Hero Symbol */}
      <div className="text-6xl font-black tracking-tighter text-ink mb-1">{user.pick.symbol}</div>
      
      {/* Context */}
      <div className="text-xs font-bold uppercase tracking-wider text-discord mb-6">Stock Selection</div>
      
      {/* Metrics */}
      <div className="flex items-baseline gap-6 mb-8">
         <div>
            <span className="text-xs text-gray-400 block mb-1">Entry Price</span>
            <span className="text-2xl font-mono text-ink">₹{user.pick.entryPrice.toFixed(2)}</span>
         </div>
         <div>
            <span className="text-xs text-gray-400 block mb-1">Return</span>
            <span className={cn("text-2xl font-mono font-bold", ret >= 0 ? "text-success" : "text-danger")}>
                {ret > 0 ? "+" : ""}{ret.toFixed(2)}%
            </span>
         </div>
      </div>

      {/* Rank Strip */}
      <div className="w-full rounded-lg bg-discord/10 py-3 text-center">
         <span className="text-sm font-bold text-discord">Current Rank #{rank}</span>
      </div>

      {/* Share Button */}
      <ShareMenu targetRef={boxRef} fileName={`my-pick-${user.username}.png`} />
    </div>
  );
}