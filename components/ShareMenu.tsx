"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

export default function ShareMenu({ targetRef, mode, fileName }: any) {
  const [open, setOpen] = useState(false);

  const capture = async () => {
    if (!targetRef?.current) return;

    const canvas = await html2canvas(targetRef.current, {
      backgroundColor: "#FDFDF8",
      scale: 2,
    });

    const pad = 20;
    const cropped = document.createElement("canvas");
    cropped.width = canvas.width - pad * 2;
    cropped.height = canvas.height - pad * 2;

    const ctx = cropped.getContext("2d")!;
    ctx.drawImage(canvas, -pad, -pad);

    const a = document.createElement("a");
    a.href = cropped.toDataURL("image/png");
    a.download = fileName || "arena.png";
    a.click();
    setOpen(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON: Changes to Red Circle with White X when open */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent click handlers
          setOpen(!open);
        }}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-[110] relative",
          open 
            ? "bg-red-600 text-white shadow-lg" 
            : "bg-gray-100 text-gray-400 hover:text-ink hover:bg-gray-200"
        )}
      >
        {open ? <X size={14} strokeWidth={3} /> : <Share2 size={14} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={mode === "compact" ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
              animate={mode === "compact" ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={mode === "compact" ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
              className={cn(
                "fixed z-50 bg-white p-6 shadow-2xl",
                mode === "compact"
                  ? "bottom-0 left-0 right-0 rounded-t-xl"
                  : "bottom-24 right-12 rounded-xl w-64 border border-gray-100"
              )}
            >
              <div className="flex justify-between mb-4 border-b border-gray-100 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Export Menu</span>
                {/* Secondary close within menu for accessibility */}
                <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
                  <X size={14} />
                </button>
              </div>

              <button
                onClick={capture}
                className="w-full bg-ink text-white p-3 rounded-lg text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors"
              >
                <Download size={14} />
                Save Snapshot
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}