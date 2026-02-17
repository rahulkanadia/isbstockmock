"use client";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BenchmarkBox({ benchmarks }: { benchmarks: any[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [clickedData, setClickedData] = useState<any>(null);

  // 1. CLICK ANYWHERE TO CLOSE
  useEffect(() => {
    const handleGlobalClick = () => setClickedData(null);
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  // 2. CONFIGURATION
  const getDisplayConfig = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes("ISB")) return { label: 'ISB', order: 1 };
    if (n.includes("NSEI") || n === "NIFTY 50" || n === "NIFTY50") return { label: 'NIFTY\n50', order: 2 };
    if (n.includes("BSESN") || n.includes("SENSEX")) return { label: 'SENSEX', order: 3 };
    if (n.includes("SELECT") || n.includes("NEXT")) return { label: 'NIFTY\nNEXT 50', order: 4 };
    if (n.includes("MID")) return { label: 'NIFTY\nMIDCAP', order: 5 };
    if (n.includes("SMALL") || n.includes("CNXSC")) return { label: 'NIFTY\nSMALLCAP', order: 6 };
    if (n.includes("BTC")) return { label: 'BITCOIN', order: 7 };
    return { label: name.replace(' ', '\n'), order: 99 };
  };

  const sorted = [...benchmarks].sort((a, b) => getDisplayConfig(a.name).order - getDisplayConfig(b.name).order);

  // 3. SCALE LOGIC
  const maxDeviation = sorted.reduce((max, b) => {
    const entry = b.entry || 1;
    return Math.max(max, Math.abs(((b.current - entry) / entry) * 100));
  }, 2);

  const boundary = Math.ceil(maxDeviation * 1.5);
  const getPos = (val: number) => ((val + boundary) / (boundary * 2)) * 100;

  const winners = benchmarks.filter(b => b.current > b.entry).length;
  const defaultTitle = winners === 0 ? "ALAS! THERE WERE NONE..." : 
                       winners === 1 ? "AND THEN THERE WAS ONE..." : 
                       `...AND THEN THERE WERE ${winners}`;

  const activeData = clickedData || hoveredData;
  const activeConfig = activeData ? getDisplayConfig(activeData.name) : null;

  return (
    <div ref={boxRef} className="arena-card h-full flex flex-col justify-between group relative overflow-visible border border-gray-300 shadow-sm bg-[#fdfbf7]">
      {/* NOISE TEXTURE */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 w-full flex justify-center items-center px-4 pt-4 pb-0 mb-1 min-h-[75px]">
        {/* SHARE BUTTON: simplified call relying on internal ShareMenu logic */}
        <div className="absolute right-4 top-4 z-[60]">
          <ShareMenu targetRef={boxRef} fileName="market_status.png" />
        </div>

        <AnimatePresence mode="wait">
          {activeData ? (
            <motion.div 
              key="ohlc-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center bg-ink shadow-2xl px-6 h-[65px] rounded-xl border border-black z-50 w-[500px]"
            >
                {/* CLOSE X (Red circle, top right) */}
                <button 
                  onClick={() => setClickedData(null)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white border-2 border-[#fdfbf7] z-[60]"
                >
                  <X size={12} strokeWidth={3} />
                </button>

                {/* NAME SECTION: Fixed width for alignment */}
                <div className="w-[100px] flex items-center justify-center text-center">
                  <span className="text-[12px] font-black uppercase text-white leading-tight">
                      {activeConfig?.label.replace('\n', ' ')}
                  </span>
                </div>

                {/* STANDALONE DIVIDER */}
                <div className="h-8 w-[1px] bg-gray-700 mx-5" />

                {/* OHLC VALUES: Left aligned columns */}
                <div className="flex flex-1 justify-between text-xs font-mono text-white">
                  <div className="flex flex-col items-start w-[65px]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Opn</span>
                      <span className="font-bold">{activeData.entry.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-start w-[65px]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">High</span>
                      <span className="font-bold text-success">{activeData.high.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-start w-[65px]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Low</span>
                      <span className="font-bold text-danger">{activeData.low.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-start w-[75px]">
                      <span className="text-[9px] font-bold text-white/70 uppercase">Ltp</span>
                      <span className={cn("font-bold", activeData.current >= activeData.entry ? "text-success" : "text-danger")}>
                        {activeData.current.toFixed(2)}
                      </span>
                  </div>
                </div>
            </motion.div>
          ) : (
            <motion.h2 
              key="default-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl md:text-2xl font-mono font-black text-gray-600 text-center tracking-tight leading-none"
            >
              {defaultTitle}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {/* GRAPH CONTAINER */}
      <div className="relative flex-1 flex ml-10 mt-4 mb-10 mr-4 border-l border-gray-300 z-10">
         <div className="absolute left-[-40px] top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono font-bold text-black py-0 text-right w-8 h-full">
            <span>+{boundary}%</span>
            <span className="text-black bg-[#fdfbf7] px-1 relative z-10">0%</span>
            <span>-{boundary}%</span>
         </div>
         <div className="absolute left-0 right-0 top-[50%] h-[1px] bg-gray-300 z-0" />

         <div className="flex justify-between w-full h-full items-end px-2 relative">
            {sorted.map((b) => {
               const entry = b.entry || 1; 
               const ret = ((b.current - entry) / entry) * 100;
               const highRet = ((b.high - entry) / entry) * 100;
               const lowRet = ((b.low - entry) / entry) * 100;
               const topWick = getPos(highRet);
               const bottomWick = getPos(lowRet);
               const config = getDisplayConfig(b.name);
               const isActive = clickedData?.name === b.name || hoveredData?.name === b.name;

               return (
                 <div key={b.name} className="relative flex-1 h-full mx-1 group/candle cursor-pointer"
                    onMouseEnter={() => setHoveredData(b)}
                    onMouseLeave={() => setHoveredData(null)}
                    onClick={(e) => { 
                      if (clickedData?.name !== b.name) {
                         e.nativeEvent.stopImmediatePropagation();
                         setClickedData(b); 
                      }
                    }}
                 >
                    <div className={cn("absolute left-1/2 -translate-x-1/2 w-[1px]", isActive ? "bg-black" : "bg-gray-400")}
                        style={{ bottom: `${Math.max(bottomWick, 0)}%`, height: `${topWick - Math.max(bottomWick, 0)}%` }} />

                    <div className={cn("absolute left-1/2 -translate-x-1/2 w-3 md:w-5 shadow-sm transition-colors duration-200 z-10", 
                        ret >= 0 ? "bg-[#27ae60]" : "bg-[#c0392b]", isActive && "border border-black")} 
                        style={{ bottom: ret >= 0 ? '50%' : `${getPos(ret)}%`, height: `${Math.abs(getPos(ret) - 50)}%`, minHeight: '2px' }} />

                    <div className="absolute top-[92.5%] pt-2 left-1/2 -translate-x-1/2 w-max flex flex-col items-center z-20">
                       <div className={cn("text-[10px] font-mono font-bold mb-0.5", ret >= 0 ? "text-success" : "text-danger")}>
                           {ret > 0 ? "+" : ""}{ret.toFixed(1)}%
                       </div>
                       <div className={cn("text-[10px] font-black uppercase text-center leading-[1.1] whitespace-pre-wrap tracking-tight", isActive ? "text-black" : "text-gray-500")}>
                           {config.label}
                       </div>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
}