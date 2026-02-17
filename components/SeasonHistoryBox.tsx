"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";
import MonthlyCard from "./MonthlyCard";
import ZenPlot from "./ZenPlot";
import { ZEN_TOOLS } from "./ZenAsset";

export default function SeasonHistoryBox({ monthlyHistory, session }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [gardenData, setGardenData] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState('tree');

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentMonthIndex = new Date().getMonth(); // 1 for Feb

  // Load Garden State
  useEffect(() => {
    const saved = localStorage.getItem('isb_zen_garden');
    if (saved) setGardenData(JSON.parse(saved));
  }, []);

  // Save Garden State
  useEffect(() => {
    if (gardenData.length > 0) {
      localStorage.setItem('isb_zen_garden', JSON.stringify(gardenData));
    }
  }, [gardenData]);

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

         {/* ZEN TOOLBOX */}
         <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
            {ZEN_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded transition-all text-lg",
                  selectedTool === tool.id ? "bg-white shadow-sm scale-110 border border-gray-200" : "opacity-40 hover:opacity-100"
                )}
              >
                {tool.icon}
              </button>
            ))}
         </div>
      </div>

      {/* NAVIGATION */}
      <button onClick={() => scroll('left')} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 border border-gray-100 hover:scale-110 transition-all">
         <ChevronLeft size={20} />
      </button>
      <button onClick={() => scroll('right')} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-400 border border-gray-100 hover:scale-110 transition-all">
         <ChevronRight size={20} />
      </button>

      {/* SCROLL CONTAINER */}
      <div ref={scrollRef} className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar px-12 py-6 scroll-smooth">
         {months.map((m, i) => {
            const isFuture = i > currentMonthIndex;
            
            // Look up live data from DB props
            const dbMonthData = monthlyHistory.find((h: any) => h.monthIndex === i);

            if (isFuture) {
              return (
                <ZenPlot 
                  key={m}
                  month={m}
                  plotIndex={i}
                  gardenData={gardenData}
                  setGardenData={setGardenData}
                  selectedTool={selectedTool}
                />
              );
            }

            return (
               <MonthlyCard 
                  key={m}
                  month={m}
                  year="2026"
                  cohortReturn={dbMonthData?.cohortReturn || 0}
                  winner={dbMonthData?.winner}
                  isCurrent={i === currentMonthIndex}
               />
            );
         })}
      </div>

      <div className="absolute left-0 top-[60px] bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-[60px] bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
