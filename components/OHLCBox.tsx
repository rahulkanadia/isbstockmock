
"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OHLCBox({
  title,
  subtitle,
  open,
  high,
  low,
  close,
  isPositive,
  onClose,
  isCapturing
}: {
  title: string;
  subtitle?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isPositive: boolean;
  onClose: () => void;
  isCapturing: boolean;
}) {
  return (
    <motion.div
      key="ohlc-box"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="relative flex items-center bg-ink shadow-2xl px-6 h-[65px] rounded-xl border border-black z-50 w-[500px]"
    >
      {/* CSS-Toggled Close Button (Hidden during capture) */}
      {!isCapturing && (
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            onClose(); 
          }}
          className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white border-2 border-[#fdfbf7] z-[60] group-data-[capture=true]:hidden"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}

      {/* NAME & SUBTITLE SECTION */}
      <div className="w-[100px] flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-black uppercase text-white leading-tight truncate w-full">
            {title}
        </span>
        {subtitle && (
          <span className="text-[10px] font-bold text-gray-200 uppercase tracking-widest truncate w-full mt-0.5">
              {subtitle}
          </span>
        )}
      </div>

      {/* DIVIDER */}
      <div className="h-8 w-[1px] bg-gray-700 mx-5" />

      {/* OHLC VALUES */}
      <div className="flex flex-1 justify-between text-xs font-mono text-white">
        <div className="flex flex-col items-start w-[65px]">
            <span className="text-[9px] font-bold text-white/70 uppercase">Open</span>
            <span className="font-bold">{open.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-start w-[65px]">
            <span className="text-[9px] font-bold text-white/70 uppercase">High</span>
            <span className="font-bold text-success">{high.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-start w-[65px]">
            <span className="text-[9px] font-bold text-white/70 uppercase">Low</span>
            <span className="font-bold text-danger">{low.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-start w-[75px]">
            <span className="text-[9px] font-bold text-white/70 uppercase">Close</span>
            <span className={cn("font-bold", isPositive ? "text-success" : "text-danger")}>
              {close.toFixed(2)}
            </span>
        </div>
      </div>
    </motion.div>
  );
}

