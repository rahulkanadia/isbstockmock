"use client";
import { cn } from "@/lib/utils";

export default function BenchmarkBox({ benchmarks }: { benchmarks: any[] }) {
  return (
    <div className="relative flex h-full w-full flex-col rounded-xl bg-white p-6 shadow-soft border border-gray-100 overflow-hidden">
      <h2 className="text-[11px] font-black tracking-[0.2em] text-gray-400 uppercase mb-8">Asset Variance</h2>
      
      <div className="relative flex-1 flex items-center justify-between gap-1 h-64 border-b border-gray-50">
        {/* The Zero Axis */}
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-gray-100 z-0" />

        {benchmarks.map((b) => {
          const ret = ((b.current - b.entry) / b.entry) * 100;
          const isGreen = ret >= 0;
          
          // Normalized mapping: 50% is 0. 10% movement = 30% height.
          const bodyHeight = Math.min(Math.abs(ret) * 4, 48); 
          const wickHeight = 80; // Fixed wick range for visual balance

          return (
            <div key={b.name} className="relative flex flex-1 flex-col items-center h-full">
              {/* Floating Wick */}
              <div className="absolute top-[10%] bottom-[10%] w-[1px] bg-gray-200 z-0" />
              
              {/* The Body - Centered on 50% line */}
              <div 
                className={cn("absolute w-5 rounded-sm z-10 shadow-sm transition-all", isGreen ? "bg-success" : "bg-danger")}
                style={{ 
                  height: `${bodyHeight}%`, 
                  bottom: isGreen ? "50%" : `calc(50% - ${bodyHeight}%)` 
                }}
              />

              {/* Ticker Labels */}
              <div className="absolute bottom-[-10px] text-center w-full">
                <p className="text-[8px] font-black text-gray-300 uppercase truncate">{b.name}</p>
                <p className={cn("text-[10px] font-mono font-bold", isGreen ? "text-success" : "text-danger")}>
                  {ret > 0 ? "+" : ""}{ret.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}