
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Swords, LogOut, Disc, Share2, UserCircle, X, Info } from "lucide-react";

import BenchmarkBox from "@/components/BenchmarkBox";
import LeaderboardBox from "@/components/LeaderboardBox";
import UserPickBox from "@/components/UserPickBox";
import SeasonHistoryBox from "@/components/SeasonHistoryBox";
import ArenaEngine from "@/components/ArenaEngine";
import ShareMenu from "@/components/ShareMenu";
import RivalryBox from "@/components/RivalryBox";

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
  const [showPendingBanner, setShowPendingBanner] = useState(true);

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

  // Determine if the user is logged in but hasn't had a pick assigned yet
  const isPendingUser = activeUser?.symbol === 'PENDING';
  const showMiddleColumn = isLoggedIn && activeUser && !isPendingUser;

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
    <div className="min-h-screen bg-[#FDFBF7] pt-32 px-4 md:px-8 pb-20 font-sans text-ink">

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
              <Link href="/admin" className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-float transition-transform hover:-translate-y-0.5">
                Go to Admin Console
              </Link>
            )}
          </div>

          <div className="flex justify-center text-center">
            <h1 className="font-black tracking-tighter text-ink uppercase whitespace-nowrap text-2xl">
              ISB Stock Mock <span className="text-[#5865F2]">2026</span>
            </h1>
          </div>

          <div className="flex flex-col items-end justify-center h-full">
            <AnimatePresence mode="wait">
                {isLoggedIn ? (
                   <motion.button key="in" onClick={handleLogout} className="flex items-center gap-2 text-xs font-black uppercase text-[#5865F2] hover:text-[#4752C4] transition-colors">
                     Sign Out <LogOut size={12} />
                   </motion.button>
                ) : (
                  <motion.div key="out" className="flex flex-col items-end gap-1">
                      <button onClick={handleLogin} className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-float transition-transform hover:-translate-y-0.5">
                          <Disc size={16} /> connect your discord avatar
                      </button>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* PENDING BANNER */}
      <AnimatePresence>
        {isLoggedIn && isPendingUser && showPendingBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[4.5rem] left-0 right-0 z-[90] bg-[#5865F2] text-[#FDFBF7] px-6 py-2.5 flex justify-between items-center text-xs font-bold shadow-md"
          >
            <div className="flex items-center gap-2 max-w-[1800px] mx-auto w-full justify-between">
              <span className="flex items-center gap-2"><Info size={14} /> Welcome to the Arena! Please contact an admin to lock in your stock pick.</span>
              <button onClick={() => setShowPendingBanner(false)} className="flex items-center gap-1 hover:text-white/80 transition-colors uppercase tracking-wider text-[10px] font-black">
                Dismiss <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD BODY */}
      <div className="mx-auto max-w-[1800px] mt-4 relative z-0">

        {/* TOP ROW GRID */}
        <div className={cn(
            "grid gap-8 transition-all duration-500 ease-out relative z-40",
            showMiddleColumn ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
        )}>

          {/* Column 1: Benchmarks & Leaderboard Stack */}
          <div className="flex flex-col gap-6 h-[650px] relative z-10">
            <div className="flex-1 min-h-0">
              <BenchmarkBox benchmarks={benchmarks} />
            </div>
            <div className="flex-1 min-h-0">
              {/* Passed the benchmarks array down as marketData for wick rendering */}
              <LeaderboardBox standings={seasonStandings} marketData={benchmarks} />
            </div>
          </div>

          {/* Column 2: User Pick (60%) & Rivalry Box (40%) Stack */}
          <AnimatePresence mode="popLayout">
            {showMiddleColumn && (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-[650px] flex flex-col gap-6 relative z-[50]">

                 {/* Top 60%: User Pick Box */}
                 <div className="flex-[3] min-h-0 relative z-10">
                    <UserPickBox user={activeUser} rank={userRank} total={seasonStandings.length} />
                 </div>

                 {/* Bottom 40%: Rivalry Box (NEW STANDALONE COMPONENT) */}
                 <div className="flex-[2] min-h-0 relative z-[60]">
                    {/* Add a placeholder info notice in logged out mode if no nemesis selected */}
                    <AnimatePresence>
                      {!isLoggedIn && !nemesis && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center p-6 text-center gap-2 z-10 pointer-events-none">
                            <Info size={24} className="text-gray-200" />
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Rivalry Arena</div>
                            <div className="text-xs font-bold text-gray-400">Click a name in the Compettion Roster<br/>to begin head-to-head tracking</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Structure left/right data so component doesn't care who is who */}
                    {/* We attach the main container Ref here so the box can screenshot the whole dashboard */}
                    <RivalryBox
                      leftActor={{ ...leftActor, targetRef: headerRef }} // Attach Ref for capture
                      rightActor={rightActor}
                      activeUser={activeUser}
                      isShareOpen={isShareOpen}
                      setIsShareOpen={setIsShareOpen}
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Column 3: Arena Engine */}
          <div className="h-[650px] relative z-10">
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

        {/* BOTTOM ROW - Forced below the top grid with z-0 */}
        <div className="mt-12 relative z-0">
          <SeasonHistoryBox monthlyHistory={monthlyHistory} session={session} />
        </div>
      </div>
    </div>
  );
}

