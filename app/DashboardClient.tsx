"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TheHeader from "@/components/TheHeader";
import BenchmarkBox from "@/components/BenchmarkBox";
import RankingGridBox from "@/components/RankingGridBox";
import UserPickBox from "@/components/UserPickBox";
import SeasonTable from "@/components/SeasonTable";
import TickerBox from "@/components/TickerBox"; // Replaces CompetitorTable

interface DashboardProps {
  seasonStandings: any[];
  monthlyStandings: any[];
  benchmarks: any[];
  session: any;
}

export default function DashboardClient({ 
  seasonStandings, 
  monthlyStandings, 
  benchmarks,
  session 
}: DashboardProps) {
  const [showMyPick, setShowMyPick] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // RIVALRY STATE
  const [customRival, setCustomRival] = useState<any>(null);

  useEffect(() => {
    setHasMounted(true);
    if (session?.user) {
        setShowMyPick(true);
    }
  }, [session]);

  if (!hasMounted) return null;

  // DATA PREP
  const myUser = session?.user?.id 
    ? seasonStandings.find(u => u.id === session.user.id) 
    : null;
    
  const isSplitMode = showMyPick && myUser;

  const toGridData = (users: any[], type: 'season' | 'monthly') => {
      return users.map(u => ({
          username: u.username,
          symbol: u.pick.symbol,
          returnPercent: type === 'season' ? u.seasonReturn : u.monthlyReturn
      }));
  };

  // RIVALRY LOGIC PREP FOR HEADER
  const competitionIndex = benchmarks.find(b => b.name === 'ISB Index');
  
  const rivalStats = customRival ? {
      username: customRival.username,
      return: customRival.seasonReturn,
      avatar: customRival.avatarUrl
  } : competitionIndex ? {
      username: "Competition Avg",
      return: ((competitionIndex.current - competitionIndex.entry) / competitionIndex.entry) * 100,
      avatar: null 
  } : null;

  const myStats = myUser ? {
      username: myUser.username,
      return: myUser.seasonReturn,
      avatar: session.user?.image || null
  } : null;


  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-6 px-4 pb-20 pt-28 sm:px-8">
      
      {/* 1. HEADER */}
      <TheHeader 
         showMyPick={showMyPick} 
         setShowMyPick={setShowMyPick}
         myStats={myStats}
         rivalStats={rivalStats}
      />

      {/* 2. TOP SECTION (Grid Boxes) */}
      <div className="relative flex w-full flex-col gap-6 lg:h-[600px] lg:flex-row">
            
            {/* COL 1: Benchmark Box */}
            <motion.div 
               layout 
               className="min-h-[400px] w-full rounded-3xl lg:h-full"
               initial={false}
               animate={{ width: isSplitMode && typeof window !== 'undefined' && window.innerWidth > 1024 ? "33%" : typeof window !== 'undefined' && window.innerWidth > 1024 ? "50%" : "100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
               <BenchmarkBox benchmarks={benchmarks} />
            </motion.div>

            {/* COL 2 (Conditional): User Pick Box */}
            <AnimatePresence mode="popLayout">
               {isSplitMode && (
                   <motion.div 
                      layout
                      className="min-h-[400px] w-full lg:h-full lg:w-[33%]"
                      initial={{ y: -50, opacity: 0, width: 0 }}
                      animate={{ y: 0, opacity: 1, width: "auto" }}
                      exit={{ y: -20, opacity: 0, width: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   >
                       <UserPickBox user={myUser} rank={seasonStandings.findIndex(u => u.id === myUser.id) + 1} />
                   </motion.div>
               )}
            </AnimatePresence>

            {/* COL 3: Rankings Stack */}
            <motion.div 
               layout 
               className="flex min-h-[600px] w-full flex-col gap-6 lg:h-full"
               animate={{ width: isSplitMode && typeof window !== 'undefined' && window.innerWidth > 1024 ? "33%" : typeof window !== 'undefined' && window.innerWidth > 1024 ? "50%" : "100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
               <div className="flex-1">
                  <RankingGridBox 
                    title="2026 Season Standings" 
                    users={toGridData(seasonStandings, 'season')} 
                  />
               </div>
               <div className="flex-1">
                  <RankingGridBox 
                    title="Monthly Standings" 
                    users={toGridData(monthlyStandings, 'monthly')} 
                  />
               </div>
            </motion.div>
      </div>

      {/* 3. BOTTOM SECTION: Season Table & Ticker */}
      <div className="flex w-full flex-col gap-6 lg:h-[280px] lg:flex-row">
         
         {/* Left: Season Table (3/4 width on desktop) */}
         <div className="h-[280px] w-full lg:h-full lg:w-3/4">
            <SeasonTable 
                currentMonthIndex={new Date().getMonth()} 
                currentLeader={monthlyStandings[0]} 
            />
         </div>

         {/* Right: Ticker Box (1/4 width on desktop) */}
         <div className="h-[280px] w-full lg:h-full lg:w-1/4">
            <TickerBox 
                users={seasonStandings} 
                showSearch={!!isSplitMode} 
                onNemesisSelect={setCustomRival}
            />
         </div>
      </div>

    </div>
  );
}