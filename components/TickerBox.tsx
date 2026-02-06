"use client";
import { useState, useEffect } from "react";
import { Search, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function TickerBox({ users, onNemesisSelect, showSearch }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (users.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % users.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [users.length]);

  const currentUser = users[currentIndex];

  return (
    <div className="relative h-full w-full rounded-xl bg-ink p-6 shadow-soft border border-ink overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Flame size={14} className="text-danger" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Roster</h3>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
         <AnimatePresence mode="wait">
            {currentUser && (
                <motion.div
                    key={currentUser.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex flex-col items-center text-center"
                >
                    <div className="text-xs font-black text-discord mb-1 uppercase tracking-widest">@{currentUser.username}</div>
                    <div className="text-3xl font-black text-white tracking-tighter mb-2">{currentUser.pick.symbol}</div>
                    <div className={cn(
                        "text-xl font-mono font-bold",
                        currentUser.seasonReturn >= 0 ? "text-success" : "text-danger"
                    )}>
                        {currentUser.seasonReturn >= 0 ? "+" : ""}{currentUser.seasonReturn.toFixed(2)}%
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      {showSearch && (
         <div className="mt-4 pt-4 border-t border-white/5">
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                 <input 
                    type="text" 
                    placeholder="Search Nemesis..." 
                    className="w-full rounded-lg bg-white/5 py-2.5 pl-9 pr-4 text-[10px] font-bold text-white outline-none border border-white/5 focus:border-discord/50 transition-all placeholder:text-gray-600"
                    onChange={(e) => {
                      const found = users.find((u: any) => u.username.toLowerCase().includes(e.target.value.toLowerCase()));
                      if (found) onNemesisSelect(found);
                    }}
                 />
             </div>
         </div>
      )}
    </div>
  );
}