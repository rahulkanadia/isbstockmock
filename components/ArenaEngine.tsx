"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Hammer, List, LayoutGrid, Swords, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArenaEngine({ 
  users, 
  monthlyStandings,
  onSetNemesis, 
  activeUser, 
  currentNemesis, 
  featureOn 
}: any) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'highlights' | 'roster'>('highlights');
  const [tab, setTab] = useState<'season' | 'month'>('season');
  const [query, setQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // Keyboard listener for Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setQuery("");
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Data toggle logic
  const data = useMemo(() => {
    return tab === 'season' ? users : (monthlyStandings || users);
  }, [tab, users, monthlyStandings]);

  // Search logic
  const filteredData = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((u: any) => 
      u.username.toLowerCase().includes(q) || 
      u.pick?.symbol?.toLowerCase().includes(q)
    );
  }, [query, data]);

  const handleToggleSearch = () => {
    setQuery("");
    setOpen(!open);
  };

  if (!mounted) return <div className="arena-card h-full bg-white opacity-0" />;

  return (
    <div className="arena-card h-full relative overflow-hidden flex flex-col bg-white border border-gray-100">
      
      {/* HEADER BAR */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
           <button onClick={() => setTab('season')} className={cn("px-2 py-1 text-[9px] font-black uppercase rounded transition-all", tab === 'season' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>Season</button>
           <button onClick={() => setTab('month')} className={cn("px-2 py-1 text-[9px] font-black uppercase rounded transition-all", tab === 'month' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>Month</button>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
             <button onClick={() => setView('highlights')} className={cn("p-1.5 rounded transition-all", view === 'highlights' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>
               <LayoutGrid size={14} />
             </button>
             <button onClick={() => setView('roster')} className={cn("p-1.5 rounded transition-all", view === 'roster' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>
               <List size={14} />
             </button>
           </div>
           {featureOn && view === 'roster' && (
             <button onClick={handleToggleSearch} className={cn("p-1.5 transition-colors", open ? "text-danger" : "text-discord")}>
               {open ? <X size={14} /> : <Search size={14} />}
             </button>
           )}
        </div>
      </div>

      {/* COLUMN NAMES HEADER */}
      {view === 'roster' && (
        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
          <div className="w-10">Rank</div>
          <div className="w-8 ml-2"></div>
          <div className="w-24 ml-4">Player</div>
          <div className="flex-1 ml-4 text-center">Stock</div>
          <div className="w-16 text-right">P&L</div>
        </div>
      )}

      {/* SEARCH BOX: Tinted & Smooth Transition */}
      <div className="relative z-20">
        <AnimatePresence>
          {open && view === 'roster' && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: 44 }} 
              exit={{ height: 0 }}
              className="overflow-hidden bg-gray-100/80 border-b border-gray-200"
            >
              <div className="px-4 py-3">
                <input 
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name or ticker..."
                  className="w-full text-xs font-bold outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'highlights' ? (
          <div className="h-full flex items-center justify-center p-6 text-center">
             <div className="p-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-2">
              <Hammer size={24} className="text-gray-300 animate-bounce" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">3D Arena Engine</div>
              <div className="text-[10px] font-bold text-gray-300 uppercase italic">Under Design</div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto no-scrollbar">
            {filteredData.map((u: any) => {
              // Calculate rank based on original unsorted data to maintain consistency
              const rank = users.findIndex((orig: any) => orig.username === u.username) + 1;
              const isMe = activeUser?.username === u.username;
              const isNemesis = currentNemesis?.username === u.username;
              const returnVal = tab === 'season' ? u.seasonReturn : (u.monthlyReturn || u.seasonReturn);

              return (
                <div 
                  key={u.username}
                  onClick={() => !isMe && onSetNemesis(u)}
                  className={cn(
                    "flex items-center px-4 py-2 cursor-pointer border-b border-gray-50/50 transition-colors",
                    isMe ? "bg-ink text-white sticky top-0 bottom-0 z-10 shadow-lg py-3" : 
                    isNemesis ? "bg-red-50" : "bg-white hover:bg-gray-50"
                  )}
                >
                   {/* Column 1: Rank (Rounded Square) */}
                   <div className="w-10">
                      <div className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                        isMe ? "bg-white/20" : "bg-gray-100 text-gray-400"
                      )}>
                        {rank}
                      </div>
                   </div>

                   {/* Column 2: Avatar */}
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 ml-2 overflow-hidden border border-gray-200">
                      {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                   </div>

                   {/* Column 3: Player (Narrower) */}
                   <div className={cn("w-24 ml-4 truncate font-bold", isMe ? "text-sm" : "text-xs")}>
                      @{u.username}
                   </div>

                   {/* Column 4: Stock (Same treatment as player) */}
                   <div className={cn("flex-1 ml-4 text-center truncate font-bold uppercase tracking-tighter", isMe ? "text-xs text-gray-300" : "text-[10px] text-gray-400")}>
                      {u.pick?.symbol?.split('.')[0]}
                   </div>

                   {/* Column 5: P&L */}
                   <div className={cn("w-16 text-right font-mono font-black", 
                     isMe ? "text-sm" : "text-xs",
                     returnVal >= 0 ? "text-success" : "text-danger"
                   )}>
                      {returnVal.toFixed(1)}%
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}