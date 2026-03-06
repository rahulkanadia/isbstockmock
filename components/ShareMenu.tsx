"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Loader2 } from "lucide-react";
import { toJpeg } from "html-to-image";
import { cn } from "@/lib/utils";

export default function ShareMenu({ targetRef }: any) {
  const [open, setOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCapturing) setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isCapturing]);

  const executeCapture = async (action: 'download' | 'share') => {
    if (!targetRef?.current || isCapturing) return;

    setIsCapturing(true);
    targetRef.current.setAttribute('data-capture', 'true');

    await new Promise(res => setTimeout(res, 50));

    try {
      const dataUrl = await toJpeg(targetRef.current, {
        quality: 0.90,
        pixelRatio: 1.5,
        backgroundColor: "#FDFBF7",
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('share-menu-exclude')) {
            return false;
          }
          return true;
        }
      });

      const safeFileName = "justisbthings.jpg";

      if (action === 'download') {
        // Safe Blob download to prevent OS/Browser freezing
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = safeFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], safeFileName, { type: "image/jpeg" });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "ISB Stock Mock Snapshot",
          });
        } else {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = safeFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      }
    } catch (err) {
      console.error("Failed to capture:", err);
    } finally {
      targetRef.current.removeAttribute('data-capture');
      setIsCapturing(false);
      setOpen(false);
    }
  };

  const handleToggle = (e: any) => {
    e.stopPropagation(); 
    e.nativeEvent.stopImmediatePropagation();
    if (!isCapturing) setOpen(!open);
  };

  return (
    <div className="relative z-[110] share-menu-exclude">
      <button 
        onClick={handleToggle}
        disabled={isCapturing}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50",
          open 
            ? "bg-red-600 text-white shadow-lg" 
            : "bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20"
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
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!isCapturing) setOpen(false); 
              }}
              className="fixed inset-0 z-[9998]"
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-10 right-0 bg-white shadow-xl rounded-xl border border-gray-100 p-2 w-48 flex flex-col gap-1 z-[9999]"
            >
              {isCapturing ? (
                <div className="w-full h-[76px] flex flex-col items-center justify-center text-[10px] font-black uppercase text-[#5865F2] gap-2 rounded-lg bg-transparent">
                  <Loader2 size={16} className="animate-spin text-[#5865F2]" />
                  <span className="truncate w-full text-center px-2">Exporting justisbthings.jpg...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); executeCapture('share'); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-black uppercase text-[#5865F2] hover:bg-[#5865F2]/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); executeCapture('download'); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-black uppercase text-ink hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={14} /> Save Image
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}