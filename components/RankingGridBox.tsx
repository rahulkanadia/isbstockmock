"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";

export default function RankingGridBox({ title, users }: any) {
  const boxRef = useRef<HTMLDivElement>(null);
  const winner = users[0];
  const loser = users[users.length - 1];

  return (
    <div ref={boxRef} className="relative flex h-full w-full flex-col rounded-2xl bg-white p-6 shadow-soft-md border border-gray-100 min-h-[280px]">
      <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-discord">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4 flex-1 pb-4">
        {/* Winner */}
        <div className="rounded-xl bg-success/5 border border-success/10 p-4 flex flex-col justify-between overflow-hidden">
          <span className="text-[9px] font-black text-success uppercase">Leader</span>
          <div>
            <div className="text-sm font-black text-ink truncate">@{winner?.username}</div>
            <div className="text-2xl font-black text-success tracking-tighter">+{winner?.returnPercent.toFixed(1)}%</div>
          </div>
        </div>

        {/* Dynamic Mini Row for runners */}
        <div className="flex flex-col justify-center gap-3">
          {users.slice(1, 4).map((u: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-gray-400 truncate w-20">@{u.username}</span>
              <span className="text-ink">{u.returnPercent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2">
        <ShareMenu targetRef={boxRef} fileName="ranking.png" />
      </div>
    </div>
  );
}
