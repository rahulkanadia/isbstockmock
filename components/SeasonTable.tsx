"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface SeasonTableProps {
  currentMonthIndex: number; // 0 = Jan
  currentLeader: any;
}

export default function SeasonTable({ currentMonthIndex = 1, currentLeader }: SeasonTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
     if(scrollRef.current) {
        scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
     }
  };

  return (
    <div className="relative h-full w-full rounded-3xl bg-white p-4 shadow-soft-md">
       {/* Scroll Buttons */}
       <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-xl bg-white/80 p-2 shadow-soft-sm hover:bg-gray-50"><ChevronLeft size={20}/></button>
       <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-xl bg-white/80 p-2 shadow-soft-sm hover:bg-gray-50"><ChevronRight size={20}/></button>

       {/* Container */}
       <div ref={scrollRef} className="flex h-full items-center gap-4 overflow-x-auto px-4 no-scrollbar snap-x">
          {MONTHS.map((m, i) => {
             const isCurrent = i === currentMonthIndex;
             const isPast = i < currentMonthIndex;
             
             return (
                <div key={m} className="flex h-full min-w-[300px] flex-shrink-0 snap-center flex-col justify-between rounded-2xl border border-gray-100 bg-eggshell p-6 transition-all hover:border-gray-200">
                   {/* Line 1: Month */}
                   <div className="text-2xl font-black text-gray-300">{m}</div>
                   
                   {isPast ? (
                      /* PAST CARD */
                      <div className="flex h-full flex-col justify-between pt-4">
                        <div>
                            <div className="text-xs font-bold uppercase text-gray-400">ISB Stock Mock</div>
                            <div className="mt-1 font-mono text-lg text-gray-300">Data Archived</div> 
                        </div>
                        
                        <div className="rounded-xl bg-gray-50 p-3">
                             <div className="mb-1 text-xs text-gray-400">Winner</div>
                             <div className="text-sm font-bold text-gray-400">--</div>
                        </div>
                      </div>
                   ) : isCurrent ? (
                       /* CURRENT CARD */
                       <div className="flex h-full flex-col justify-between pt-4">
                        <div>
                            <div className="text-xs font-bold uppercase text-discord">ISB Stock Mock</div>
                            <div className="animate-pulse font-mono text-xl text-ink">LIVE</div>
                        </div>
                        
                        <div className="rounded-xl bg-discord/5 p-3">
                            <div className="mb-1 text-xs text-discord">Current Leader</div>
                            <div className="text-sm font-bold text-ink">@{currentLeader?.username || "TBD"}</div>
                        </div>
                       </div>
                   ) : (
                       /* FUTURE CARD */
                       <div className="flex h-full items-center justify-center">
                          <p className="text-center text-xs italic text-gray-400">"Price is what you pay. Value is what you get."</p>
                       </div>
                   )}
                </div>
             )
          })}
       </div>
    </div>
  );
}