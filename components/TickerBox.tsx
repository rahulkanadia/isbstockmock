"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TickerBoxProps {
  users: any[];
  onNemesisSelect: (user: any) => void;
  showSearch: boolean;
}

export default function TickerBox({ users, onNemesisSelect, showSearch }: TickerBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Auto-Scroll Logic (Stops when user is searching)
  useEffect(() => {
    if (isSearching || users.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % users.length);
    }, 3000); // 3 seconds per card

    return () => clearInterval(interval);
  }, [users.length, isSearching]);

  // Filter for Search
  const filteredUsers = searchTerm 
    ? users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const currentUser = users[currentIndex];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-soft-md">
      
      {/* Header Button */}
      {/* Note: In a real app, this would link to a full modal or page. For now it's visual. */}
      <button className="mb-4 text-left text-xs font-bold uppercase text-gray-400 transition-colors hover:text-discord">
        See Full Roster ↗
      </button>

      {/* THE TICKER (Vertical Carousel) */}
      <div className="relative flex flex-1 items-center justify-center">
         <AnimatePresence mode="wait">
            {!isSearching && currentUser && (
                <motion.div
                    key={currentUser.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex w-full flex-col items-center text-center"
                >
                    <div className="mb-2 text-3xl font-black text-ink">{currentUser.pick.symbol}</div>
                    <div className="mb-4 text-sm font-bold text-gray-500">@{currentUser.username}</div>
                    <div className={cn(
                        "text-4xl font-mono font-bold tracking-tighter",
                        currentUser.seasonReturn >= 0 ? "text-success" : "text-danger"
                    )}>
                        {currentUser.seasonReturn > 0 ? "+" : ""}{currentUser.seasonReturn.toFixed(2)}%
                    </div>
                </motion.div>
            )}
         </AnimatePresence>

         {/* SEARCH RESULTS OVERLAY */}
         {isSearching && (
             <div className="custom-scrollbar absolute inset-0 z-10 overflow-y-auto bg-white">
                 {filteredUsers.length > 0 ? filteredUsers.map(u => (
                     <button 
                        key={u.id}
                        onClick={() => {
                            onNemesisSelect(u);
                            setIsSearching(false);
                            setSearchTerm("");
                        }}
                        className="group flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-gray-50"
                     >
                         <span className="text-sm font-bold text-gray-600 group-hover:text-discord">@{u.username}</span>
                         <span className={cn("font-mono text-xs", u.seasonReturn >=0 ? "text-success" : "text-danger")}>
                             {u.seasonReturn.toFixed(1)}%
                         </span>
                     </button>
                 )) : (
                     <div className="mt-4 text-center text-xs text-gray-400">No rival found...</div>
                 )}
             </div>
         )}
      </div>

      {/* NEMESIS SEARCH BAR */}
      {showSearch && (
         <div className="mt-4 border-t border-gray-100 pt-4">
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input 
                    type="text" 
                    placeholder="Pick a Nemesis..." 
                    className="w-full rounded-xl bg-gray-50 py-3 pl-9 pr-4 text-xs font-bold text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-discord/20"
                    value={searchTerm}
                    onFocus={() => setIsSearching(true)}
                    // Small delay on blur to allow clicking the result button
                    onBlur={() => setTimeout(() => !searchTerm && setIsSearching(false), 200)} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             <button 
                onClick={() => onNemesisSelect(null)} // Reset to Index
                className="mt-2 w-full text-center text-[10px] font-bold text-gray-400 hover:text-discord"
             >
                Reset to Competition Average
             </button>
         </div>
      )}
    </div>
  );
}