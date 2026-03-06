"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";
import MonthlyCard from "./MonthlyCard";

export default function SeasonHistoryBox({ monthlyHistory, session }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentMonthIndex = new Date().getMonth(); // 1 for Feb

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="arena-card h-full bg-white relative group flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-30">
         <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded text-gray-600"><History size={14} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest text-ink">Season Timeline 2026</h3>
         </div>
      </div>

      {/* NAVIGATION */}
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-500 border border-gray-200 hover:scale-110 hover:bg-white transition-all"
      >
         <ChevronLeft size={20} />
      </button>
      <button 
        onClick={() => scroll('right')} 
        className="absolute right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-500 border border-gray-200 hover:scale-110 hover:bg-white transition-all"
      >
         <ChevronRight size={20} />
      </button>

      {/* SCROLL CONTAINER - Scrollbar forcefully hidden via Tailwind CSS */}
      <div 
        ref={scrollRef} 
        className="flex-1 flex items-stretch gap-6 overflow-x-auto px-12 py-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
         {months.map((m, i) => {
            const isFuture = i > currentMonthIndex;

            // Look up live data from DB props
            const dbMonthData = monthlyHistory.find((h: any) => h.monthIndex === i);

            if (isFuture) {
              return (
                <div 
                  key={m} 
                  className="min-w-[280px] w-[280px] rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 text-gray-300 font-black tracking-widest text-lg"
                >
                  {m}
                </div>
              );
            }

            return (
               <div key={m} className="min-w-[280px] w-[280px]">
                 <MonthlyCard
                    month={m}
                    year="2026"
                    cohortReturn={dbMonthData?.cohortReturn || 0}
                    winner={dbMonthData?.winner}
                    isCurrent={i === currentMonthIndex}
                 />
               </div>
            );
         })}
      </div>

      {/* FADE EDGES */}
      <div className="absolute left-0 top-[60px] bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-[60px] bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}