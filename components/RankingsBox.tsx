"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Skull, AlertTriangle, Crown, List, LayoutGrid, Swords, Target } from "lucide-react";
import ShareMenu from "./ShareMenu";

export default function RankingsBox({ 
  seasonStandings, 
  monthlyStandings, 
  activeUser, 
  onSetNemesis, 
  currentNemesis 
}: any) {
  const [tab, setTab] = useState<'season' | 'month'>('season');
  const [view, setView] = useState<'highlights' | 'roster'>('highlights');
  const boxRef = useRef<HTMLDivElement>(null);

  // 1. DATA PREP
  const data = tab === 'season' ? seasonStandings : monthlyStandings;
  const N = data.length;
  
  // Safe accessors for Highlights
  const rank1 = data[0];
  const rank2 = data[1];
  const rank3 = data[2];
  const last = N > 3 ? data[N - 1] : null;
  const secondLast = N > 4 ? data[N - 2] : null;
  const thirdLast = N > 5 ? data[N - 3] : null;

  const date = new Date();
  const currentMonthLabel = `${date.toLocaleString('default', { month: 'short' })} '${date.getFullYear().toString().slice(-2)}`;

  // HELPER: Small User Card (Used in Quad View)
  const UserCard = ({ user, rank, type, icon: Icon }: any) => {
    if (!user) return <div className="flex-1 bg-gray-50/50 rounded-lg animate-pulse" />;
    const isMe = activeUser?.username === user.username;
    const isNemesis = currentNemesis?.username === user.username;
    const returnVal = tab === 'season' ? user.seasonReturn : user.monthlyReturn;

    return (
      <div 
        onClick={() => !isMe && onSetNemesis(user)}
        className={cn(
          "relative flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer border w-full h-full",
          type === 'gold' ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" :
          type === 'silver' ? "bg-gray-50 border-gray-200 hover:bg-gray-100" :
          type === 'bronze' ? "bg-orange-50 border-orange-200 hover:bg-orange-100" :
          type === 'danger' ? "bg-red-50 border-red-100 hover:bg-red-100" :
          "bg-white border-gray-100",
          isMe ? "!bg-ink !text-white !border-ink shadow-md scale-[1.02] z-10" : 
          isNemesis ? "!bg-red-100 !border-red-500 !ring-1 !ring-red-500" : ""
        )}
      >
         <div className="flex items-center gap-2 overflow-hidden">
            <div className={cn("w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-[10px] font-black", type === 'gold' ? "bg-yellow-200 text-yellow-800" : "bg-white/50 text-gray-500")}>
               {rank || <Icon size={10} />}
            </div>
            <div className="flex flex-col truncate">
               <span className={cn("text-[10px] font-bold truncate", isMe ? "text-white" : "text-ink")}>@{user.username}</span>
               <span className={cn("text-[8px] font-mono opacity-60 truncate", isMe ? "text-gray-300" : "text-gray-400")}>{user.pick.symbol.split('.')[0]}</span>
            </div>
         </div>
         <div className={cn("text-[10px] font-mono font-bold", returnVal >= 0 ? "text-success" : "text-danger")}>
            {returnVal > 0 ? "+" : ""}{returnVal.toFixed(1)}%
         </div>
      </div>
    );
  };

  return (
    <div ref={boxRef} className="arena-card h-full bg-white flex flex-col p-0 overflow-hidden border border-gray-100">
      
      {/* HEADER BAR */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
        
        {/* Left: Time Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
           <button onClick={() => setTab('season')} className={cn("px-2 py-1 text-[9px] font-black uppercase rounded transition-all", tab === 'season' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>Season</button>
           <button onClick={() => setTab('month')} className={cn("px-2 py-1 text-[9px] font-black uppercase rounded transition-all", tab === 'month' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>{currentMonthLabel}</button>
        </div>

        {/* Right: View Toggle + Share */}
        <div className="flex items-center gap-2">
           <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
             <button onClick={() => setView('highlights')} className={cn("p-1.5 rounded transition-all", view === 'highlights' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>
               <LayoutGrid size={14} />
             </button>
             <button onClick={() => setView('roster')} className={cn("p-1.5 rounded transition-all", view === 'roster' ? "bg-white shadow-sm text-ink" : "text-gray-400 hover:text-gray-600")}>
               <List size={14} />
             </button>
           </div>
           <ShareMenu targetRef={boxRef} fileName={`leaderboard_${view}.png`} />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-4 overflow-hidden relative">
        
        {/* VIEW 1: HIGHLIGHTS (QUAD) */}
        {view === 'highlights' && (
          <div className="h-full grid grid-cols-2 grid-rows-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
             {/* Q1: LEADER */}
             <div className="col-span-1 row-span-1 flex flex-col gap-1">
                <div className="text-[9px] font-black uppercase tracking-widest text-yellow-600 flex items-center gap-1"><Crown size={10} /> Leader</div>
                <div className="flex-1"><UserCard user={rank1} rank={1} type="gold" icon={Crown} /></div>
             </div>
             {/* Q2: CHASE */}
             <div className="col-span-1 row-span-1 flex flex-col gap-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">The Chase</div>
                <div className="flex-1 flex flex-col gap-1"><UserCard user={rank2} rank={2} type="silver" icon={Medal} /><UserCard user={rank3} rank={3} type="bronze" icon={Medal} /></div>
             </div>
             {/* Q3: DANGER */}
             <div className="col-span-1 row-span-1 flex flex-col gap-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1"><AlertTriangle size={10} /> Danger Zone</div>
                <div className="flex-1 flex flex-col gap-1"><UserCard user={thirdLast} rank={N-2} type="danger" icon={AlertTriangle} /><UserCard user={secondLast} rank={N-1} type="danger" icon={AlertTriangle} /></div>
             </div>
             {/* Q4: ANCHOR */}
             <div className="col-span-1 row-span-1 flex flex-col gap-1">
                <div className="text-[9px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1"><Skull size={10} /> The Anchor</div>
                <div className="flex-1 bg-ink rounded-lg p-2 flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={() => last && activeUser?.username !== last.username && onSetNemesis(last)}>
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />
                   {last && (
                     <>
                       <div className="relative z-10 flex justify-between items-start"><span className="text-[10px] font-bold text-white">@{last.username}</span><span className="text-[9px] font-mono text-danger font-bold">{tab === 'season' ? last.seasonReturn.toFixed(1) : last.monthlyReturn.toFixed(1)}%</span></div>
                       <div className="relative z-10 text-center"><div className="text-3xl font-black text-white/10 group-hover:text-white/20 transition-colors">#{N}</div></div>
                       <div className="relative z-10 text-[8px] font-mono text-gray-500 text-center">{last.pick.symbol.split('.')[0]}</div>
                     </>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* VIEW 2: ROSTER (LIST) */}
        {view === 'roster' && (
          <div className="h-full overflow-y-auto no-scrollbar space-y-1 animate-in slide-in-from-right-4 duration-300 pr-1">
            {data.map((u: any, i: number) => {
              const rank = i + 1;
              const isMe = activeUser?.username === u.username;
              const isNemesis = currentNemesis?.username === u.username;
              const returnVal = tab === 'season' ? u.seasonReturn : u.monthlyReturn;

              return (
                <div 
                  key={u.username}
                  onClick={() => !isMe && onSetNemesis(u)}
                  className={cn(
                    "group relative flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer border",
                    isMe ? "bg-ink text-white border-ink z-10 sticky -top-1 -bottom-1 shadow-lg scale-[1.02]" : 
                    isNemesis ? "bg-red-50 border-danger/30" :
                    "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 flex items-center justify-center rounded text-[10px] font-black", rank <= 3 ? "bg-yellow-100 text-yellow-700" : isMe ? "bg-white/20 text-white" : "text-gray-400 bg-gray-50")}>
                        {rank <= 3 ? <Medal size={12} /> : rank}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold leading-none", isMe ? "text-white" : "text-ink")}>@{u.username}</span>
                        <span className={cn("text-[9px] font-mono mt-0.5", isMe ? "text-gray-400" : "text-gray-400")}>{u.pick.symbol.split('.')[0]}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className={cn("font-mono font-bold text-xs", returnVal >= 0 ? "text-success" : "text-danger")}>{returnVal > 0 ? "+" : ""}{returnVal.toFixed(2)}%</span>
                      {!isMe && (
                         <div className={cn("w-5 h-5 flex items-center justify-center rounded-full transition-all", isNemesis ? "bg-danger text-white opacity-100" : "opacity-0 group-hover:opacity-100 bg-gray-200 text-gray-500 hover:bg-danger hover:text-white")}>
                            {isNemesis ? <Swords size={10} /> : <Target size={10} />}
                         </div>
                      )}
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
