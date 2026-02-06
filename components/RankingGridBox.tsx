"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";

interface GridUser {
  username: string;
  symbol: string;
  returnPercent: number;
}

interface RankingGridBoxProps {
  title: string;
  users: GridUser[]; 
}

export default function RankingGridBox({ title, users }: RankingGridBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Extract key players
  const winner = users[0];
  const loser = users[users.length - 1];
  const rank2 = users[1];
  const rank3 = users[2];
  const low2 = users[users.length - 2];
  const low3 = users[users.length - 3];

  const BarItem = ({ u, align, color }: { u: GridUser, align: 'left' | 'right', color: 'green' | 'red' }) => {
     if (!u) return null;
     return (
        <div className={cn("flex flex-col gap-1 w-full", align === 'right' ? "items-end" : "items-start")}>
             <div className="flex gap-2 text-[10px] text-gray-500 font-bold uppercase">
                <span>{u.username}</span>
                <span className={color === 'green' ? "text-success" : "text-danger"}>{u.returnPercent.toFixed(2)}%</span>
             </div>
             {/* The Bar */}
             <div className={cn(
                 "h-2 rounded-full opacity-50", 
                 color === 'green' ? "bg-success" : "bg-danger"
             )} style={{ width: `${Math.min(Math.abs(u.returnPercent) * 2, 100)}%` }} />
        </div>
     );
  };

  return (
    <div 
      ref={boxRef}
      className="relative flex h-full w-full flex-col rounded-3xl bg-white p-6 shadow-soft-md"
    >
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
        
        {/* Top Left: Winner */}
        <div className="flex flex-col justify-between rounded-2xl bg-success/5 p-4">
            <span className="text-xs font-bold text-success uppercase">Winner</span>
            <div>
                <div className="text-lg font-black text-ink truncate">{winner?.username}</div>
                <div className="text-sm text-gray-500">{winner?.symbol}</div>
                <div className="text-2xl font-bold text-success">+{winner?.returnPercent.toFixed(2)}%</div>
            </div>
        </div>

        {/* Top Right: Runners Up */}
        <div className="flex flex-col justify-center gap-4 p-2">
            <BarItem u={rank2} align="left" color="green" />
            <BarItem u={rank3} align="left" color="green" />
        </div>

        {/* Bottom Left: Bottom Runners */}
        <div className="flex flex-col justify-center gap-4 p-2">
            <BarItem u={low2} align="right" color="red" />
            <BarItem u={low3} align="right" color="red" />
        </div>

        {/* Bottom Right: Loser */}
        <div className="flex flex-col justify-between rounded-2xl bg-danger/5 p-4 text-right">
            <span className="text-xs font-bold text-danger uppercase">Last Place</span>
            <div>
                <div className="text-lg font-black text-ink truncate">{loser?.username}</div>
                <div className="text-sm text-gray-500">{loser?.symbol}</div>
                <div className="text-2xl font-bold text-danger">{loser?.returnPercent.toFixed(2)}%</div>
            </div>
        </div>
      </div>
      
      {/* Share Button */}
      <ShareMenu targetRef={boxRef} fileName={`${title.toLowerCase().replace(/\s/g, '-')}.png`} />
    </div>
  );
}