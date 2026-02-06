"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Share2, X, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface BenchmarkBoxProps {
  benchmarks: any[]; // Needs { name, entry, current, high, low }
}

export default function BenchmarkBox({ benchmarks }: BenchmarkBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // 1. Calculate Title Logic
  const positiveCount = benchmarks.filter(b => b.current > b.entry).length;
  let title = "Alas! There were none...";
  if (positiveCount > 0) title = `...and then there were ${positiveCount}`;
  if (positiveCount === 1) title = "...and then there was 1";

  // 2. Share Function
  const handleDownload = async () => {
    if (!boxRef.current) return;
    setShareOpen(false); // Close menu before snap
    setTimeout(async () => {
        const canvas = await html2canvas(boxRef.current as HTMLElement, { backgroundColor: "#FDFDF8" });
        const data = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = data;
        link.download = "isb-stock-mock-benchmarks.png";
        link.click();
    }, 100);
  };

  return (
    <div 
      ref={boxRef}
      className="relative flex h-full w-full flex-col justify-between rounded-3xl bg-white p-8 shadow-float transition-all hover:shadow-soft-xl"
    >
      {/* Title */}
      <h2 className="text-2xl font-black tracking-tight text-ink opacity-90">{title}</h2>

      {/* The Graph */}
      <div className="flex h-40 w-full items-end justify-between gap-4 px-2">
        {benchmarks.map((b) => {
            const isGreen = b.current >= b.entry;
            const colorClass = isGreen ? "bg-success" : "bg-danger";
            const textClass = isGreen ? "text-success" : "text-danger";
            
            // Calculate Wick/Body Heights relative to the specific asset's range
            // NOTE: For visual clarity in this specific design, we normalize the range 
            // so each candle takes up reasonable space, or we map returns.
            // Simplified Approach: Since we don't have a Y-axis, we visualize % Return magnitude.
            const ret = ((b.current - b.entry) / b.entry) * 100;
            const absRet = Math.abs(ret);
            const heightPx = Math.min(Math.max(absRet * 5, 10), 100); // Scale factor
            
            return (
                <div key={b.name} className="flex flex-1 flex-col items-center gap-3">
                    {/* The Candle */}
                    <div className="relative flex w-4 flex-col items-center justify-end h-24">
                        {/* Wick (Mocked for now as a line through) */}
                        <div className="absolute h-full w-[1px] bg-gray-300 top-0" />
                        {/* Body */}
                        <div 
                            className={cn("z-10 w-full rounded-sm", colorClass)} 
                            style={{ height: `${heightPx}px` }} 
                        />
                    </div>
                    {/* X-Axis Label */}
                    <div className="text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate max-w-[60px]">{b.name}</div>
                        <div className={cn("text-xs font-bold", textClass)}>{ret > 0 ? "+" : ""}{ret.toFixed(2)}%</div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Bottom Edge Share Button */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
         <div className="relative">
            <button
                onClick={() => setShareOpen(!shareOpen)}
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border shadow-soft-md transition-all",
                    shareOpen ? "bg-danger border-danger text-white rotate-180" : "bg-white border-gray-100 text-gray-400 hover:text-discord"
                )}
            >
                {shareOpen ? <X size={18} /> : <Share2 size={18} />}
            </button>
            
            {/* Dropdown Stack */}
            {shareOpen && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col gap-2 min-w-[140px]">
                    <button onClick={handleDownload} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-ink shadow-soft-xl hover:bg-gray-50">
                        <Download size={14} /> Save Image
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-[#5865F2] p-3 text-xs font-bold text-white shadow-soft-xl hover:bg-[#4752C4]">
                        <Share2 size={14} /> Discord
                    </button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}