
"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CandlestickProps {
  topWickPos: number;     // % from bottom
  bottomWickPos: number;  // % from bottom
  bodyBottomPos: number;  // % from bottom
  bodyHeight: number;     // % height
  isPositive: boolean;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  children?: ReactNode;   // To pass the custom labels
}

export default function Candlestick({
  topWickPos,
  bottomWickPos,
  bodyBottomPos,
  bodyHeight,
  isPositive,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
  children
}: CandlestickProps) {
  return (
    <div 
      className="relative flex-1 h-full mx-1 group/candle cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* WICK */}
      <div 
        className={cn("absolute left-1/2 -translate-x-1/2 w-[1px] z-[5]", isActive ? "bg-black" : "bg-gray-400")}
        style={{ 
          bottom: `${bottomWickPos}%`, 
          height: `${Math.max(topWickPos - bottomWickPos, 0)}%` 
        }} 
      />

      {/* BODY */}
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-3 md:w-5 shadow-sm transition-colors duration-200 z-10",
          isPositive ? "bg-[#27AE60]" : "bg-[#C0392B]", 
          isActive && "border border-black"
        )}
        style={{
          bottom: `${bodyBottomPos}%`,
          height: `${bodyHeight}%`,
          minHeight: '2px'
        }} 
      />

      {/* LABEL INJECTED FROM PARENT */}
      {children}
    </div>
  );
}

