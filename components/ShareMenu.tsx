
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

export default function ShareMenu({ targetRef, mode, fileName }: any) {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const generateImage = async () => {
    if (!targetRef?.current) return null;

    // useCORS is critical here so Discord avatars don't break the canvas
    const canvas = await html2canvas(targetRef.current, {
      backgroundColor: "#FDFDF8",
      scale: 2,
      useCORS: true, 
    });

    const pad = 20;
    const cropped = document.createElement("canvas");
    cropped.width = canvas.width - pad * 2;
    cropped.height = canvas.height - pad * 2;

    const ctx = cropped.getContext("2d")!;
    ctx.drawImage(canvas, -pad, -pad);

    return cropped.toDataURL("image/png");
  };

  const handleToggle = async (e: any) => {
    e.stopPropagation(); 
    if (open) {
      setOpen(false);
      setTimeout(() => setPreviewUrl(null), 300); // Clear after exit animation
    } else {
      setOpen(true);
      setIsCapturing(true);
      const url = await generateImage();
      setPreviewUrl(url);
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = fileName || "isb_stock_mock.png";
    a.click();
    setOpen(false);
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    
    try {
      // Convert Data URL to an actual File object for the Share API
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName || "isb_stock_mock.png", { type: "image/png" });
      
      // Native Web Share API (Works perfectly on mobile/tablets for Discord)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ISB Stock Mock Snapshot",
        });
      } else {
        // Fallback if browser doesn't support direct file sharing
        alert("Direct sharing not supported on this browser. Downloading snapshot instead.");
        handleDownload();
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
    setOpen(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={handleToggle}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-[110] relative",
          open 
            ? "bg-red-600 text-white shadow-lg" 
            : "bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20"
        )}
      >
        {open ? <X size={14} strokeWidth={3} /> : <Share2 size={14} />}
      </button>

      {/* MODAL / BACKDROP */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />

            <motion.div
              initial={mode === "compact" ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
              animate={mode === "compact" ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={mode === "compact" ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
              className={cn(
                "fixed z-[9999] bg-white p-5 shadow-2xl",
                mode === "compact"
                  ? "bottom-0 left-0 right-0 rounded-t-xl"
                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl w-[320px] border border-gray-100"
              )}
            >
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Share Snapshot</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-danger transition-colors p-1">
                  <X size={14} />
                </button>
              </div>

              {/* IMAGE PREVIEW BOX */}
              <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden min-h-[160px] flex items-center justify-center relative shadow-inner">
                 {isCapturing ? (
                   <div className="flex flex-col items-center gap-2 text-gray-400">
                     <Loader2 className="animate-spin" size={20} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Generating...</span>
                   </div>
                 ) : previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-[220px]" />
                 ) : null}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  disabled={isCapturing}
                  className="w-full bg-[#5865F2] text-white p-3 rounded-lg text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#4752C4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 size={14} />
                  Share Snapshot
                </button>
                
                <button
                  onClick={handleDownload}
                  disabled={isCapturing}
                  className="w-full bg-ink text-white p-3 rounded-lg text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  Save to Device
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

