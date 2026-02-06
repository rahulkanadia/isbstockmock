"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Archive, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function SeasonTable({ currentMonthIndex = 1 }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
     scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <div className="relative h-full w-full rounded-xl bg-ink p-6 shadow-soft border border-ink">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Historical Tape</h3>
          <div className="flex gap-2">
             <button onClick={() => scroll('left')} className="p-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition-colors"><ChevronLeft size={16}/></button>
             <button onClick={() => scroll('right')} className="p-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition-colors"><ChevronRight size={16}/></button>
          </div>
       </div>

       <div ref={scrollRef} className="flex h-40 items-center gap-4 overflow-x-auto no-scrollbar snap-x">
          {MONTHS.map((m, i) => {
             const isCurrent = i === currentMonthIndex;
             const isPast = i < currentMonthIndex;

             return (
                <div key={m} className={cn(
                  "flex h-full min-w-[280px] flex-shrink-0 snap-center flex-col justify-between rounded-lg border p-5 transition-all",
                  isCurrent ? "border-discord bg-discord/5" : "border-white/5 bg-white/[0.02]"
                )}>
                   <div className="flex justify-between items-start">
                      <span className={cn("text-2xl font-black", isCurrent ? "text-white" : "text-white/20")}>{m}</span>
                      {isCurrent ? <Activity size={16} className="text-discord animate-pulse" /> : <Archive size={16} className="text-white/10" />}
                   </div>

                   <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</div>
                      <div className="font-mono text-xs text-white/40">
                         {isCurrent ? "Active Session" : isPast ? "Data Locked" : "Pending Close"}
                      </div>
                   </div>
                </div>
             )
          })}
       </div>
    </div>
  );
}