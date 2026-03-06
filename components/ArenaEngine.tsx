"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
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
  const [tab, setTab] = useState<'season' | 'month'>('season');
  const [query, setQuery] = useState("");
  const [localSelected, setLocalSelected] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Esc key clears search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && query) {
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  // Synchronize the active dataset based on the selected tab
  const data = useMemo(() => {
    return tab === 'season' ? users : (monthlyStandings?.length ? monthlyStandings : users);
  }, [tab, users, monthlyStandings]);

  const filteredData = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((u: any) =>
      u.username.toLowerCase().includes(q) ||
      u.pick?.symbol?.toLowerCase().includes(q)
    );
  }, [query, data]);

  // Row selection & deselection logic (works for logged in and logged out)
  const handleRowClick = (u: any) => {
    if (activeUser?.username === u.username) return; 
    
    if (activeUser) {
      if (currentNemesis?.username === u.username) {
        onSetNemesis(null); // Deselect
      } else {
        onSetNemesis(u); // Select
      }
    } else {
      if (localSelected === u.username) {
        setLocalSelected(null); // Deselect
      } else {
        setLocalSelected(u.username); // Select
      }
    }
  };

  if (!mounted) return <div className="arena-card h-full bg-white opacity-0" />;

  return (
    <div className="arena-card h-full relative overflow-hidden flex flex-col bg-white border border-gray-100">

{/* HEADER BAR */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center gap-4 bg-white sticky top-0 z-20 min-h-[72px]">
        
        {/* Left: Title & Tabs Grouped */}
        <div className="flex items-center gap-4 shrink-0 z-10">
           <h3 className="font-black text-sm uppercase tracking-widest text-ink hidden sm:block">Competition Roster</h3>
           <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
             <button onClick={() => setTab('season')} className={cn("px-4 py-2 text-[10px] font-black uppercase rounded transition-all", tab === 'season' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>Season</button>
             <button onClick={() => setTab('month')} className={cn("px-4 py-2 text-[10px] font-black uppercase rounded transition-all", tab === 'month' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>Month</button>
           </div>
        </div>

        {/* Right: Search Box (Now fully responsive) */}
        <div className={cn("relative z-10 flex-1 flex justify-end min-w-0 transition-all duration-300", activeUser ? "max-w-[220px]" : "max-w-[280px]")}>
           {featureOn && (
             <div className="relative flex items-center w-full">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search by username or stock pick..."
                 className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-8 text-xs font-bold text-ink outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-gray-400 truncate"
               />
               {query && (
                 <button 
                   onClick={() => setQuery("")} 
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                 >
                   <X size={12} strokeWidth={3} />
                 </button>
               )}
             </div>
           )}
        </div>
      </div>

      {/* COLUMN NAMES HEADER */}
      {/* Pl-6 and Pr-8 perfectly match the data row padding to prevent horizontal scrolling */}
      <div className="pl-6 pr-8 py-2 border-b border-gray-50 bg-gray-50/50 flex items-center text-[9px] font-black uppercase tracking-widest text-gray-400 overflow-hidden">
        <div className="w-8 text-center shrink-0">Rank</div>
        <div className="w-8 ml-4 shrink-0"></div> {/* Avatar Placeholder */}
        
        {/* Slightly reduced player width when logged in to guarantee no overflow */}
        <div className={cn("ml-4 text-left shrink-0 transition-all", activeUser ? "w-24 sm:w-32" : "w-32 sm:w-40 md:w-48")}>Player</div>
        
        <div className="flex-1 min-w-0 ml-4 text-left">Stock Pick</div>
        
        {/* Conditionally hide prices when logged in to save horizontal space */}
        {!activeUser && (
          <>
            <div className="w-16 sm:w-20 ml-4 text-center shrink-0">Entry Price</div>
            <div className="w-16 sm:w-20 ml-4 text-center shrink-0">Last Price</div>
          </>
        )}
        
        <div className="w-16 sm:w-20 ml-4 text-center shrink-0">% P&L</div>
      </div>

      {/* ROSTER CONTENT */}
      {/* overflow-x-hidden strictly enforces the boundary so the scrollbar never appears */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {filteredData.map((u: any) => {
          const rank = data.findIndex((orig: any) => orig.username === u.username) + 1;
          const isMe = activeUser?.username === u.username;
          const isNemesis = currentNemesis?.username === u.username;
          const isSelected = localSelected === u.username;
          
          const isHighlighted = isMe || isNemesis || isSelected;
          
          const returnVal = tab === 'season' 
            ? (u.seasonReturn ?? u.currentSeasonReturn ?? 0) 
            : (u.monthlyReturn ?? u.currentMonthlyReturn ?? 0);
            
          const isPending = u.pick?.symbol === "PENDING";
          const avatar = u.avatarUrl || u.image;
          const entryPrice = isPending ? "-" : (u.pick?.entryPrice?.toFixed(2) || "0.00");
          const lastPrice = isPending ? "-" : ((u.pick?.latestPrice ?? u.latestPrice)?.toFixed(2) || "0.00");

          return (
            <div
              key={u.username}
              onClick={() => handleRowClick(u)}
              className={cn(
                "flex items-center pl-6 pr-8 cursor-pointer border-b transition-all duration-200",
                isHighlighted 
                  ? "bg-ink border-ink z-10 shadow-lg py-3" 
                  : "bg-white border-gray-50/50 hover:bg-gray-50 py-2",
                isMe && "sticky top-0 bottom-0"
              )}
            >
               {/* Rank (Center) */}
               <div className="w-8 flex justify-center shrink-0">
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-xs font-black",
                    isHighlighted ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                  )}>
                    {rank}
                  </div>
               </div>

               {/* Avatar (Left) */}
               <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 ml-4 overflow-hidden border border-gray-200">
                  {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px]">?</div>}
               </div>

               {/* Player (Left, Responsive Width) */}
               <div className={cn("ml-4 truncate font-bold text-left text-xs shrink-0 transition-all", 
                 isHighlighted ? "text-white" : "text-[#4752C4]",
                 activeUser ? "w-24 sm:w-32" : "w-32 sm:w-40 md:w-48"
               )}>
                  @{u.username}
               </div>

               {/* Stock (Left, Fills remaining space) */}
               <div className={cn("flex-1 min-w-0 ml-4 text-left truncate font-bold uppercase text-xs transition-colors", 
                 isHighlighted ? "text-gray-300" : "text-gray-600"
               )}>
                  {isPending ? "---" : u.pick?.symbol}
               </div>

               {/* Conditionally hide prices when logged in */}
               {!activeUser && (
                 <>
                   {/* Entry Price (Right) */}
                   <div className={cn("w-16 sm:w-20 ml-4 text-right font-mono text-xs shrink-0 transition-colors", 
                     isHighlighted ? "text-gray-300" : "text-gray-600"
                   )}>
                      {entryPrice}
                   </div>

                   {/* Last Price (Right) */}
                   <div className={cn("w-16 sm:w-20 ml-4 text-right font-mono text-xs shrink-0 transition-colors", 
                     isHighlighted ? "text-gray-300" : "text-gray-600"
                   )}>
                      {lastPrice}
                   </div>
                 </>
               )}

               {/* P&L (Right) */}
               <div className={cn("w-16 sm:w-20 ml-4 text-right font-mono font-black text-xs shrink-0",
                 returnVal >= 0 ? "text-success" : "text-danger",
                 isPending && (isHighlighted ? "text-gray-400" : "text-gray-400")
               )}>
                  {isPending ? "0.0%" : `${returnVal > 0 ? "+" : ""}${returnVal.toFixed(1)}%`}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}