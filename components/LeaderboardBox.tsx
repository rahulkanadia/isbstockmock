"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import OHLCBox from "./OHLCBox";
import Candlestick from "./Candlestick";
import { motion, AnimatePresence } from "framer-motion";

// FIXED: Added marketData to props to clear TS error
export default function LeaderboardBox({ standings, marketData = [] }: { standings: any[], marketData?: any[] }) {
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

  const displayUsers = useMemo(() => {
    const validUsers = standings.filter(u => u.pick?.symbol && u.pick.symbol !== 'PENDING' && u.seasonReturn !== undefined);
    const sorted = [...validUsers].sort((a, b) => b.seasonReturn - a.seasonReturn);
    
    if (sorted.length <= 6) return sorted;
    
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3);
    return [...top3, ...bottom3];
  }, [standings]);

  const mappedUsers = useMemo(() => {
    return displayUsers.map((u, i) => {
      const entry = u.pick.entryPrice || 1;
      const current = u.pick.latestPrice || entry;
      const high = u.pick.highPrice || current;
      const low = u.pick.lowPrice || current;
      
      return {
        ...u,
        isTop3: i < 3,
        calcEntry: entry,
        calcCurrent: current,
        calcHigh: high,
        calcLow: low,
        calcRet: u.seasonReturn || (((current - entry) / entry) * 100),
        calcHighRet: (((high - entry) / entry) * 100),
        calcLowRet: (((low - entry) / entry) * 100),
      };
    });
  }, [displayUsers]);

  const maxDeviation = mappedUsers.reduce((max, u) => {
    return Math.max(max, Math.abs(u.calcRet), Math.abs(u.calcHighRet), Math.abs(u.calcLowRet));
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

  const activeData = clickedData || hoveredData;

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
              title={`@${activeData.username}`}
              subtitle={activeData.pick?.symbol}
              open={activeData.calcEntry}
              high={activeData.calcHigh}
              low={activeData.calcLow}
              close={activeData.calcCurrent}
              isPositive={activeData.calcRet >= 0}
              onClose={() => setClickedData(null)}
              isCapturing={false} 
            />
          ) : (
            <motion.h2
              key="default-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl md:text-2xl font-mono font-black text-gray-600 text-center tracking-tight leading-none uppercase"
            >
              Winners and... <span className="italic normal-case text-gray-400">nevermind</span>
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
              {mappedUsers.map((u, i) => {
                  const topWick = getBottom(u.calcHighRet);
                  const bottomWick = getBottom(u.calcLowRet);
                  const isActive = clickedData?.username === u.username || hoveredData?.username === u.username;
                  const isPositive = u.calcRet >= 0;

                  return (
                    <Candlestick
                      key={`${u.username}-${i}`}
                      topWickPos={topWick}
                      bottomWickPos={bottomWick}
                      bodyBottomPos={isPositive ? 60 : getBottom(u.calcRet)}
                      bodyHeight={isPositive ? getBottom(u.calcRet) - 60 : 40 - getBottom(u.calcRet)}
                      isPositive={isPositive}
                      isActive={isActive}
                      onMouseEnter={() => setHoveredData(u)}
                      onMouseLeave={() => setHoveredData(null)}
                      onClick={(e) => {
                        e.nativeEvent.stopImmediatePropagation();
                        if (clickedData?.username === u.username) setClickedData(null);
                        else setClickedData(u);
                      }}
                    >
                        <div className="absolute top-[40%] bottom-[40%] left-[-20%] right-[-20%] z-[20] flex flex-col items-center justify-center pointer-events-none text-[8px] md:text-[9px] font-black uppercase text-gray-600 leading-tight">
                            {u.isTop3 ? (
                                <>
                                  <span className={cn("tracking-tighter", isPositive ? "text-success" : "text-danger")}>
                                      {u.calcRet > 0 ? '+' : ''}{u.calcRet.toFixed(1)}%
                                  </span>
                                  <span className="truncate max-w-full">@{u.username}</span>
                                </>
                            ) : (
                                <>
                                  <span className="truncate max-w-full">@{u.username}</span>
                                  <span className={cn("tracking-tighter", isPositive ? "text-success" : "text-danger")}>
                                      {u.calcRet > 0 ? '+' : ''}{u.calcRet.toFixed(1)}%
                                  </span>
                                </>
                            )}
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