"use client";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import OHLCBox from "./OHLCBox";
import Candlestick from "./Candlestick";
import { motion, AnimatePresence } from "framer-motion";

export default function BenchmarkBox({ benchmarks }: { benchmarks: any[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [clickedData, setClickedData] = useState<any>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('.share-menu-exclude')) return;
      setClickedData(null);
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

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

  const maxDeviation = sorted.reduce((max, b) => {
    const entry = b.entry || 1;
    const currentRet = ((b.current - entry) / entry) * 100;
    const highRet = ((b.high - entry) / entry) * 100;
    const lowRet = ((b.low - entry) / entry) * 100;
    
    return Math.max(max, Math.abs(currentRet), Math.abs(highRet), Math.abs(lowRet));
  }, 2);

  const getSmartBoundary = (maxVal: number) => {
    const padded = maxVal * 1.02; 
    if (padded <= 5) return Math.ceil(padded);                  
    if (padded <= 25) return Math.ceil(padded / 5) * 5;         
    if (padded <= 100) return Math.ceil(padded / 10) * 10;      
    return Math.ceil(padded / 25) * 25;                         
  };

  const boundary = getSmartBoundary(maxDeviation);

  const getBottom = (val: number) => {
    if (val >= 0) return 60 + (val / boundary) * 40;
    return 40 - (Math.abs(val) / boundary) * 40;
  };

  const winners = benchmarks.filter(b => b.current > b.entry).length;
  const defaultTitle = winners === 0 ? "ALAS! THERE WERE NONE..." :
                       winners === 1 ? "AND THEN THERE WAS ONE..." :
                       `...AND THEN THERE WERE ${winners}`;

  const activeData = clickedData || hoveredData;
  const activeConfig = activeData ? getDisplayConfig(activeData.name) : null;

  return (
    <div
      ref={boxRef}
      className="arena-card h-full min-h-[310px] flex flex-col justify-between group relative overflow-hidden bg-[#FDFBF7] pb-4 border border-gray-300 shadow-sm rounded-xl data-[capture=true]:border-transparent data-[capture=true]:shadow-none data-[capture=true]:rounded-none"
    >
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase font-normal tracking-widest text-[#5865F2] opacity-0 group-data-[capture=true]:opacity-80 z-[100] pointer-events-none transition-none">
        ISBSTOCKMOCK.VERCEL.APP
      </div>

      {/* Bumped to z-[90] so it flawlessly sits above the chart background */}
      <div className="relative z-[90] w-full flex justify-center items-center px-4 pt-4 pb-0 mb-1 min-h-[75px]">
        <div className="absolute right-4 top-4 z-[100]">
          <ShareMenu targetRef={boxRef} />
        </div>

        <AnimatePresence mode="wait">
          {activeData ? (
            <OHLCBox
              title={activeConfig?.label.replace('\n', ' ') || ""}
              open={activeData.displayOpen ?? activeData.entry}
              high={activeData.displayHigh ?? activeData.high}
              low={activeData.displayLow ?? activeData.low}
              close={activeData.displayClose ?? activeData.current}
              isPositive={activeData.current >= activeData.entry}
              onClose={() => setClickedData(null)}
              isCapturing={false} 
            />
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

      <div className="flex-1 flex mt-2 mb-3 mr-4 relative z-10">
         <div className="w-14 flex flex-col text-[10px] font-mono font-bold text-black relative">
            <span className="absolute top-0 right-2">+{boundary}%</span>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 text-[10px] font-mono font-bold text-black leading-tight text-right uppercase">
                Since<br/>Jan-2026
            </div>
            <span className="absolute bottom-0 right-2">-{boundary}%</span>
         </div>

         <div className="flex-1 relative border-l border-gray-300">
            {/* The 20% Center Gap Band with a subtle solid background instead of noise */}
            <div className="absolute top-[40%] bottom-[40%] left-0 right-0 bg-gray-50 border-y border-gray-200 z-[15] pointer-events-none" />

            <div className="absolute inset-0 flex justify-between px-2">
              {sorted.map((b) => {
                  const entry = b.entry || 1;
                  const ret = ((b.current - entry) / entry) * 100;
                  const topWick = getBottom(((b.high - entry) / entry) * 100);
                  const bottomWick = getBottom(((b.low - entry) / entry) * 100);
                  const config = getDisplayConfig(b.name);
                  const isActive = clickedData?.name === b.name || hoveredData?.name === b.name;

                  return (
                    <Candlestick
                      key={b.name}
                      topWickPos={topWick}
                      bottomWickPos={bottomWick}
                      bodyBottomPos={ret >= 0 ? 60 : getBottom(ret)}
                      bodyHeight={ret >= 0 ? getBottom(ret) - 60 : 40 - getBottom(ret)}
                      isPositive={ret >= 0}
                      isActive={isActive}
                      onMouseEnter={() => setHoveredData(b)}
                      onMouseLeave={() => setHoveredData(null)}
                      onClick={(e) => {
                        e.nativeEvent.stopImmediatePropagation();
                        if (clickedData?.name === b.name) setClickedData(null);
                        else setClickedData(b);
                      }}
                    >
                      <div className="absolute top-[40%] bottom-[40%] left-[-20%] right-[-20%] z-[20] flex items-center justify-center gap-1.5 pointer-events-none">
                          <div className="flex flex-col items-end justify-center text-[8px] md:text-[9px] font-black uppercase text-gray-600 leading-[1]">
                              {config.label.split('\n').map((line, i) => <span key={i}>{line}</span>)}
                          </div>
                          <div className={cn("text-[9px] md:text-[10px] font-black tracking-tighter", ret >= 0 ? "text-success" : "text-danger")}>
                              ({ret > 0 ? '+' : ''}{ret.toFixed(1)}%)
                          </div>
                      </div>
                    </Candlestick>
                  );
              })}
            </div>
         </div>
      </div>
    </div>
  );
}