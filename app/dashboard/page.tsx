"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/app/components/Header";
import { PickModal } from "@/app/components/PickModal";

// --- INLINE DATA FOR HISTORY UI ---
const STATIC_HISTORY = [
  { month: "Jan", status: "active", userPnl: 0.0, winner: "Waiting...", winnerPnl: 0 },
  { month: "Feb", status: "future", quote: "The stock market is designed to transfer money from the Active to the Patient. — Buffett" },
  { month: "Mar", status: "future", quote: "We suffer more often in imagination than in reality. — Seneca" },
  { month: "Apr", status: "future", quote: "No man is free who is not master of himself. — Epictetus" },
  { month: "May", status: "future", quote: "The best revenge is not to be like your enemy. — Aurelius" },
  { month: "Jun", status: "future", quote: "Waste no more time arguing what a good man should be. Be one." },
];

export default function UserDashboard() {
  const { data: session } = useSession();
  const [sharingPick, setSharingPick] = useState(false);
  const [sharingBoard, setSharingBoard] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);

  // STATE: Real Data
  const [myPick, setMyPick] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH REAL DATA
  useEffect(() => {
    async function init() {
        try {
            // A. Fetch "My" Pick
            const meRes = await fetch("/api/user/me");
            const meData = await meRes.json();
            if(meData.hasPick) setMyPick(meData);

            // B. Fetch Leaderboard
            const lbRes = await fetch("/api/leaderboard/public");
            const lbData = await lbRes.json();
            if(lbData.leaderboard) setLeaderboard(lbData.leaderboard);
            
        } catch(e) {
            console.error("Dashboard fetch error", e);
        } finally {
            setLoading(false);
        }
    }
    init();
  }, [showPickModal]); // Refetch if modal closes (pick created)


  // 2. PROCESS LEADERBOARD
  const leaderboardData = useMemo(() => {
    if(leaderboard.length === 0) return null;

    const sorted = leaderboard.map((u: any) => ({
        username: u.username, 
        symbol: u.symbol,
        pnl: u.pnlPercent
    }));

    const winner = sorted[0];
    const loser = sorted[sorted.length - 1];
    
    // Runners up
    const runnersUp = sorted.slice(1, 3);
    const bottomRunners = sorted.length > 3 
        ? sorted.slice(sorted.length - 3, sorted.length - 1).reverse() 
        : [];

    const maxPnl = Math.max(Math.abs(winner.pnl), Math.abs(loser.pnl));
    const scaleMax = Math.max(25, maxPnl + 5); 

    return { winner, loser, runnersUp, bottomRunners, scaleMax };
  }, [leaderboard]);


  // 3. PROCESS MY PICK UI
  const currentPickUI = myPick ? {
    symbol: myPick.symbol,
    name: myPick.name,
    entryDate: new Date(myPick.entryDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
    pnl: myPick.pnl,
    isLocked: true, 
    unlockDate: "Next Month",
    rankPercent: "Top ?" 
  } : null;

  const handleSaveImage = (section: string) => {
    alert(`Snapshot feature for ${section} requires 'html2canvas'. Button is functional!`);
    if(section === 'pick') setSharingPick(false);
    if(section === 'board') setSharingBoard(false);
  };
  
  // --- RENDER ---
  if(loading) return <div className="min-h-screen pt-28 flex justify-center text-zinc-400">Loading market data...</div>

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[#FAF9F6]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 space-y-12">

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: CURRENT PICK CARD */}
          <div className={`rounded-3xl p-8 shadow-strong relative overflow-visible flex flex-col justify-between min-h-[400px] transition-all duration-300 ${sharingPick ? 'scale-[1.02]' : ''} bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 border border-purple-100`}>
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
             
             {currentPickUI ? (
                 <div className="relative z-10 flex flex-col items-center text-center h-full">
                    <div className="w-full flex justify-between items-start mb-4">
                        <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Current Pick</div>
                        {!sharingPick && (
                        <div className="px-2 py-1 bg-white/60 backdrop-blur rounded text-[10px] font-bold text-zinc-500 border border-zinc-100">LOCKED</div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <div className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight">{currentPickUI.symbol}</div>
                        <div className="text-lg text-zinc-500 font-medium mt-1">{currentPickUI.name}</div>
                        
                        <div className="flex items-center gap-8 mt-8 mb-8">
                            <div className="flex flex-col items-center">
                                <div className="text-xs text-zinc-400 font-bold uppercase mb-1">P&L</div>
                                <div className={`text-3xl font-black ${currentPickUI.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {currentPickUI.pnl > 0 ? "+" : ""}{currentPickUI.pnl.toFixed(2)}%
                                </div>
                            </div>
                            <div className="h-10 w-px bg-zinc-300"></div>
                            <div className="flex flex-col items-center">
                                <div className="text-xs text-zinc-400 font-bold uppercase mb-1">Entry</div>
                                <div className="text-xl font-bold text-zinc-700">{currentPickUI.entryDate}</div>
                            </div>
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="flex-1 flex items-center justify-center flex-col relative z-10">
                    <div className="text-2xl font-bold text-zinc-300 mb-6">No Active Pick</div>
                    {!showPickModal ? (
                         <button 
                            onClick={() => setShowPickModal(true)}
                            className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all"
                         >
                            Pick a Stock
                         </button>
                    ) : (
                        <div className="w-full max-w-sm">
                             <PickModal />
                             <button onClick={() => setShowPickModal(false)} className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 underline w-full text-center">Cancel</button>
                        </div>
                    )}
                 </div>
             )}

            {currentPickUI && (
                <div className="relative z-10 mt-6 w-full">
                {sharingPick ? (
                    <div className="animate-in fade-in duration-300 flex flex-col items-center text-center pb-4">
                    <div className="text-2xl font-bold text-zinc-900 tracking-tight">ISB Stock Mock <span className="text-purple-600">2026</span></div>
                    <div className="flex items-baseline gap-2 justify-center">
                        <div className="text-xs text-zinc-400 font-medium mt-1">Monthly Trading Competition</div>
                        <div className="text-[10px] text-purple-400 font-mono">(isbstockmock.vercel.app)</div>
                    </div>
                    </div>
                ) : (
                    <div className="flex gap-3 justify-center w-full">
                    <button disabled={true} className="flex-1 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Update Pick (Locked)
                    </button>
                    </div>
                )}
                </div>
            )}

            {currentPickUI && sharingPick && (
                <div className="absolute bottom-20 right-0 w-48 bg-white/60 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-zinc-200 z-30 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 text-center">Share Snapshot</div>
                    <div className="flex flex-col gap-2">
                        <button className="w-full py-2 bg-[#5865F2] text-white text-xs font-bold rounded-lg hover:opacity-90">Discord</button>
                        <button className="w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:opacity-80">X.com</button>
                        <button onClick={() => handleSaveImage('pick')} className="w-full py-2 bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-300">Save Image</button>
                    </div>
                </div>
            )}
            
            {currentPickUI && (
                <button onClick={() => setSharingPick(!sharingPick)} className={`absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all z-40 shadow-sm ${sharingPick ? "bg-red-500 border border-red-600 text-white" : "bg-white/50 backdrop-blur border border-zinc-200 text-zinc-400 hover:text-purple-600 hover:border-purple-200"}`}>
                {sharingPick ? "✕" : "☍"}
                </button>
            )}
          </div>


          {/* RIGHT: LEADERBOARD CARD */}
          <div className={`bg-white rounded-3xl p-6 shadow-soft border border-zinc-100 flex flex-col gap-4 relative transition-all duration-300 overflow-hidden ${sharingBoard ? 'scale-[1.02]' : ''}`}>

             <div className="flex justify-center items-center mb-2 relative">
                <div className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Live Rankings
                </div>
                {!sharingBoard && (
                   <div className="absolute right-0 top-0 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">LIVE</div>
                )}
             </div>

             {leaderboardData ? (
                 <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 h-[300px]">

                    {/* 1. Winner */}
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="text-3xl font-black text-zinc-900 leading-none mb-1">{leaderboardData.winner.username}</div>
                        <div className="text-xs font-bold text-zinc-400 mb-3 bg-white/50 px-2 py-0.5 rounded-full">{leaderboardData.winner.symbol}</div>
                        <div className="text-4xl font-black text-green-600 tracking-tight">+{leaderboardData.winner.pnl.toFixed(1)}%</div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-40"></div>
                    </div>

                    {/* 2. Runners Up */}
                    <div className="flex flex-col justify-center gap-6 relative border-l border-b border-zinc-100 pl-4 pb-4">
                        {leaderboardData.runnersUp.map((user, i) => (
                            <div key={i} className="w-full">
                                <div className="flex justify-between items-baseline text-[10px] mb-1.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-bold text-zinc-900 text-xs">{user.username}</span>
                                        <span className="text-zinc-400 text-[9px]">{user.symbol}</span>
                                    </div>
                                    <span className="font-mono font-bold text-green-600">+{user.pnl.toFixed(1)}%</span>
                                </div>
                                <div className="h-5 bg-zinc-50 w-full rounded-md overflow-hidden">
                                    <div 
                                    className="h-full bg-green-400/60 rounded-md" 
                                    style={{ width: `${(Math.abs(user.pnl) / leaderboardData.scaleMax) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Bottom Runners */}
                    <div className="flex flex-col justify-center gap-6 relative border-r border-t border-zinc-100 pr-4 pt-4">
                        {leaderboardData.bottomRunners.map((user, i) => (
                            <div key={i} className="w-full text-right">
                                <div className="flex justify-between items-baseline text-[10px] mb-1.5 flex-row-reverse">
                                    <div className="flex items-baseline gap-1.5 flex-row-reverse">
                                        <span className="font-bold text-zinc-900 text-xs">{user.username}</span>
                                        <span className="text-zinc-400 text-[9px]">{user.symbol}</span>
                                    </div>
                                    <span className="font-mono font-bold text-red-600">{user.pnl.toFixed(1)}%</span>
                                </div>
                                <div className="h-5 bg-zinc-50 w-full rounded-md overflow-hidden flex justify-end">
                                    <div 
                                    className="h-full bg-red-400/60 rounded-md" 
                                    style={{ width: `${(Math.abs(user.pnl) / leaderboardData.scaleMax) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 4. Loser */}
                    <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="text-3xl font-black text-zinc-900 leading-none mb-1">{leaderboardData.loser.username}</div>
                        <div className="text-xs font-bold text-zinc-400 mb-3 bg-white/50 px-2 py-0.5 rounded-full">{leaderboardData.loser.symbol}</div>
                        <div className="text-4xl font-black text-red-600 tracking-tight">{leaderboardData.loser.pnl.toFixed(1)}%</div>
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-40"></div>
                    </div>

                </div>
             ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-300">
                    Waiting for data...
                </div>
             )}

             {sharingBoard && (
                <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center animate-in fade-in">
                    <span className="font-bold text-zinc-900 text-xs">ISB Stock Mock <span className="text-purple-600">2026</span></span>
                    <span className="text-[10px] text-purple-400 font-mono">(isbstockmock.vercel.app)</span>
                </div>
             )}

             {sharingBoard && (
                <div className="absolute bottom-16 right-6 w-40 bg-white/60 backdrop-blur-md p-3 rounded-xl shadow-xl border border-zinc-200 z-30 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="flex flex-col gap-2">
                        <button className="w-full py-2 bg-[#5865F2] text-white text-[10px] font-bold rounded-lg hover:opacity-90">Discord</button>
                        <button className="w-full py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:opacity-80">X.com</button>
                        <button onClick={() => handleSaveImage('board')} className="w-full py-2 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-lg hover:bg-zinc-300">Save Img</button>
                    </div>
                </div>
            )}

             <button 
               onClick={() => setSharingBoard(!sharingBoard)}
               className={`absolute bottom-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-40 ${
                  sharingBoard
                  ? "bg-red-500 border border-red-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-400 hover:text-purple-600 hover:border-purple-200"
               }`}
             >
               {sharingBoard ? "✕" : "☍"}
             </button>

          </div>
        </section>

        {/* SEASON STANDING GRID */}
        <section>
           <h3 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
             Season Standing <span className="text-sm font-bold text-zinc-500 bg-zinc-200/50 px-3 py-1 rounded-full">2026</span>
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATIC_HISTORY.map((item, i) => (
                <HistoryCard key={i} data={item} />
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}

function HistoryCard({ data }: { data: any }) {
  if (data.status === "future") {
    return (
      <div className="aspect-[4/3] p-6 bg-[#FDFCF8] rounded-xl border border-zinc-100 flex flex-col justify-center items-center text-center shadow-inner transition-transform hover:-translate-y-1">
        <div className="text-sm font-serif italic text-zinc-400 leading-relaxed">"{data.quote}"</div>
        <div className="mt-4 text-xs font-bold text-zinc-300 uppercase tracking-widest">{data.month}</div>
      </div>
    );
  }
  const isPositive = data.userPnl >= 0;
  return (
    <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-soft bg-white border border-zinc-100 group transition-transform hover:-translate-y-1">
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-zinc-50 text-right">
        <div className="text-xs uppercase font-bold text-zinc-400">Winner</div>
        <div className="font-bold text-zinc-700 text-sm">{data.winner}</div>
        <div className="font-mono text-green-600 text-xs">+{data.winnerPnl}%</div>
      </div>
      <div className="absolute inset-0 bg-white diagonal-clip-upper drop-shadow-md z-10 p-5 flex flex-col justify-start">
         <div className="flex justify-between items-start">
            <div className="text-sm font-bold text-zinc-900 uppercase tracking-wide">{data.month}</div>
            {data.status === "active" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
         </div>
         <div className={`mt-2 text-3xl font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {data.userPnl}%
         </div>
      </div>
    </div>
  );
}