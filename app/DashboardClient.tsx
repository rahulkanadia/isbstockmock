"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Swords, LogOut, Disc, Share2, UserCircle, X } from "lucide-react";

import BenchmarkBox from "@/components/BenchmarkBox";
import UserPickBox from "@/components/UserPickBox";
import SeasonHistoryBox from "@/components/SeasonHistoryBox";
import ArenaEngine from "@/components/ArenaEngine";
import ShareMenu from "@/components/ShareMenu";

export default function DashboardClient({
  seasonStandings,
  monthlyStandings,
  benchmarks,
  monthlyHistory,
  session
}: any) {
  const mode = useLayoutMode();
  const [nemesis, setNemesis] = useState<any>(null);
  const [isMock, setIsMock] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);

  // FIX: Persist Mock Login across page reloads in local dev
  useEffect(() => {
    if (sessionStorage.getItem('isb_mock_login') === 'true') {
      setIsMock(true);
    }
  }, []);

  const isLoggedIn = (!!session?.user || isMock);
  const isAdmin = session?.user?.adminLevel >= 1 || isMock; 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) setNemesis(null);
  }, [isLoggedIn]);

  const activeUser = useMemo(() => {
    if (!isLoggedIn) return null;
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const lookupName = isLocal ? "brownbobdowney" : (session?.user?.name || "Dev Mode");
    return seasonStandings.find((u: any) => u.username?.toLowerCase() === lookupName?.toLowerCase()) || null;
  }, [session, seasonStandings, isLoggedIn, isMock]);

  const userRank = activeUser 
    ? seasonStandings.findIndex((u: any) => u.username === activeUser.username) + 1 
    : 0;

  const isb = benchmarks.find((b: any) => b.name === 'ISB Index');
  const nifty = benchmarks.find((b: any) => b.name === 'Nifty 50');
  const isbRet = isb ? isb.current - 100 : 0;
  const niftyRet = nifty ? nifty.current - 100 : 0;
  
  const leftActor = isLoggedIn ? activeUser : (nemesis || { username: "Nifty 50", seasonReturn: niftyRet, isIndex: true });
  const rightActor = isLoggedIn ? (nemesis || { username: "ISB Index", seasonReturn: isbRet, isIndex: true }) : { username: "ISB Index", seasonReturn: isbRet, isIndex: true };
  const gap = (leftActor?.seasonReturn || 0) - (rightActor?.seasonReturn || 0);
  const sliderPos = Math.min(Math.max(50 + (gap * 2.5), 5), 95);

  const handleLogin = () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      setIsMock(true);
      sessionStorage.setItem('isb_mock_login', 'true');
    } else {
      signIn("discord");
    }
  };

  const handleLogout = () => {
    if (window.location.hostname.includes('localhost')) {
      setIsMock(false);
      sessionStorage.removeItem('isb_mock_login');
    } else {
      signOut();
    }
  };

  return (
    <div className="min-h-screen bg-eggshell pt-32 px-4 md:px-8 pb-20 font-sans text-ink">
      
      {/* HEADER */}
      <motion.header 
        ref={headerRef}
        initial={{ height: "4.5rem" }}
        animate={{ height: "4.5rem" }} 
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm flex items-center"
      >
        <div className="relative z-10 w-full max-w-[1800px] mx-auto h-full grid grid-cols-3 items-center">
          
          <div className="flex justify-start">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 bg-discord text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-float transition-transform hover:-translate-y-0.5">
                Go to Admin Console
              </Link>
            )}
          </div>

          <div className="flex justify-center text-center">
            <h1 className="font-black tracking-tighter text-ink uppercase whitespace-nowrap text-2xl">
              ISB Stock Mock <span className="text-discord">2026</span>
            </h1>
          </div>

          <div className="flex flex-col items-end justify-center h-full">
            <AnimatePresence mode="wait">
                {isLoggedIn ? (
                   <motion.button key="in" onClick={handleLogout} className="flex items-center gap-2 text-xs font-black uppercase text-discord">
                     Sign Out <LogOut size={12} />
                   </motion.button>
                ) : (
                  <motion.div key="out" className="flex flex-col items-end gap-1">
                      <button onClick={handleLogin} className="flex items-center gap-2 bg-discord text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-float transition-transform hover:-translate-y-0.5">
                          <Disc size={16} /> connect your discord avatar
                      </button>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* DASHBOARD BODY */}
      <div className="mx-auto max-w-[1800px] mt-4">
        
        {/* TOP ROW GRID */}
        <div className={cn(
            "grid gap-8 transition-all duration-500 ease-out",
            isLoggedIn ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
        )}>
          
          {/* Column 1: Benchmarks */}
          <div className="h-[650px]">
            <BenchmarkBox benchmarks={benchmarks} />
          </div>
          
          {/* Column 2: User Pick (60%) & Rivalry Box (40%) Stack */}
          <AnimatePresence mode="popLayout">
            {isLoggedIn && activeUser && (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-[650px] flex flex-col gap-6">
                 
                 {/* Top 60%: User Pick Box */}
                 <div className="flex-[3] min-h-0">
                    <UserPickBox user={activeUser} rank={userRank} total={seasonStandings.length} />
                 </div>
                 
                 {/* Bottom 40%: Rivalry Box */}
                 <div className="flex-[2] min-h-0 relative">
                    <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 w-full h-full flex flex-col justify-center gap-4 relative shadow-sm group">
                        
                        {/* Actors Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 w-[35%]">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden text-2xl">
                                   {leftActor?.isIndex ? (leftActor.username.includes("Nifty") ? "🇮🇳" : "😶‍🌫️") : (leftActor?.image ? <img src={leftActor.image} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400"/>)}
                                </div>
                                <span className="text-sm font-black text-gray-700 uppercase truncate">
                                    {leftActor?.isIndex ? leftActor.username.split(' ')[0] : `@${leftActor?.username}`}
                                </span>
                            </div>

                            <div className="flex flex-col items-center justify-center w-[30%]">
                                <div className="flex items-center gap-1">
                                    <Swords size={14} className={cn(gap < 0 ? "text-danger" : "text-success")} />
                                    <span className={cn("font-mono font-black text-xl leading-none", gap >= 0 ? "text-success" : "text-danger")}>
                                        {gap > 0 ? "+" : ""}{gap.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 w-[35%]">
                                <span className="text-sm font-black text-gray-700 uppercase truncate text-right">
                                    {rightActor?.isIndex ? rightActor.username.split(' ')[0] : `@${rightActor?.username}`}
                                </span>
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden text-2xl">
                                   {rightActor?.isIndex ? (rightActor.username.includes("Nifty") ? "🇮🇳" : "😶‍🌫️") : (rightActor?.image ? <img src={rightActor.image} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400"/>)}
                                </div>
                            </div>
                        </div>

                        {/* Slider Row */}
                        <div className="w-full h-3 bg-gray-100 rounded-full relative shadow-inner overflow-visible">
                           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-danger/20 via-gray-200 to-success/20" />
                           <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-400 z-0" />
                           <motion.div 
                             className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-md z-10", gap >= 0 ? "border-success" : "border-danger")}
                             animate={{ left: `${sliderPos}%` }} 
                           />
                        </div>

                        {/* Share Teardrop */}
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-12 h-6 bg-white border-b border-x border-gray-200 rounded-b-full flex items-center justify-center -mt-[1px] z-10 shadow-sm">
                            <ShareMenu targetRef={headerRef} fileName="rivalry_status.png" onOpenChange={setIsShareOpen} icon={
                              <div className={cn("p-1 rounded-full transition-all cursor-pointer", isShareOpen ? "bg-danger text-white" : "bg-gray-100 text-gray-400")} onClick={() => setIsShareOpen(!isShareOpen)}>
                                {isShareOpen ? <X size={12} /> : <Share2 size={12} />}
                              </div>
                            } />
                        </div>

                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Column 3: Arena Engine */}
          <div className="h-[650px]">
             <ArenaEngine
               users={seasonStandings}
               monthlyStandings={monthlyStandings}
               onSetNemesis={setNemesis}
               activeUser={activeUser}
               currentNemesis={nemesis}
               featureOn={true}
             />
          </div>

        </div>

        {/* BOTTOM ROW */}
        <div className="mt-12">
          <SeasonHistoryBox monthlyHistory={monthlyHistory} session={session} />
        </div>
      </div>
    </div>
  );
}