"use client";

import { useState } from "react";
import { Share2, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

interface ShareMenuProps {
  targetRef: React.RefObject<HTMLDivElement | null>; // Updated type for stricter TS
  fileName: string;
}

export default function ShareMenu({ targetRef, fileName }: ShareMenuProps) {
  const [open, setOpen] = useState(false);

  const handleDownload = async () => {
    if (!targetRef.current) return;
    setOpen(false);
    setTimeout(async () => {
        const canvas = await html2canvas(targetRef.current as HTMLElement, { 
            backgroundColor: "#FDFDF8",
            scale: 2 
        });
        const data = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = data;
        link.download = fileName;
        link.click();
    }, 100);
  };

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
        <div className="relative">
        <button
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border shadow-soft-md transition-all",
                open ? "bg-danger border-danger text-white rotate-180" : "bg-white border-gray-100 text-gray-400 hover:text-discord"
            )}
        >
            {open ? <X size={18} /> : <Share2 size={18} />}
        </button>
        
        {open && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col gap-2 min-w-[140px]">
                <button onClick={handleDownload} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-ink shadow-soft-xl hover:bg-gray-50">
                    <Download size={14} /> Save Image
                </button>
                {/* Note: The Discord button is currently visual-only */}
                <button className="flex items-center gap-2 rounded-xl bg-[#5865F2] p-3 text-xs font-bold text-white shadow-soft-xl hover:bg-[#4752C4]">
                    <Share2 size={14} /> Discord
                </button>
            </div>
        )}
        </div>
    </div>
  );
}