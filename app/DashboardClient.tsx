"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // <-- FIXED: Added missing import
import TheHeader from "@/components/TheHeader";
import BenchmarkBox from "@/components/BenchmarkBox";
import RankingGridBox from "@/components/RankingGridBox";
import SeasonTable from "@/components/SeasonTable";
import TickerBox from "@/components/TickerBox";
import UserPickBox from "@/components/UserPickBox";

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
  const [isMockUser, setIsMockUser] = useState(false);
  const [customRival, setCustomRival] = useState<any>(null);

  // LOGGED IN LOGIC: Uses real session OR mock session if on localhost
  const activeUser = session?.user || (isMockUser ? seasonStandings[0] : null);
  const isSplitMode = showMyPick && activeUser;

  // DATA PREP
  // Finds the stock data for the currently "logged in" user
  const myData = activeUser 
    ? seasonStandings.find((u: any) => 
        u.id === activeUser.id || 
        u.username.toLowerCase() === activeUser.name?.toLowerCase() ||
        (isMockUser && u.username === seasonStandings[0].username)
      ) 
    : null;

  // RIVALRY LOGIC PREP
  const competitionIndex = benchmarks.find(b => b.name === 'ISB Index');
  const rivalData = customRival ? customRival : {
      username: "Competition Avg",
      seasonReturn: competitionIndex ? ((competitionIndex.current - competitionIndex.entry) / competitionIndex.entry) * 100 : 0
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-6 px-8 pb-20">
      
      {/* 1. HEADER */}
      <TheHeader 
         showMyPick={showMyPick} 
         setShowMyPick={setShowMyPick}
         myStats={myData ? { username: "Me", return: myData.seasonReturn } : null}
         rivalStats={rivalData ? { username: rivalData.username, return: rivalData.seasonReturn } : null}
         isMock={isMockUser}
         onMockLogin={() => setIsMockUser(true)}
      />

      {/* 2. TOP SECTION: Grid Boxes */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[600px] items-stretch">

            {/* COL 1: Benchmarks */}
            <motion.div 
               layout 
               className={cn(
                 "min-h-[400px] transition-all duration-500", 
                 isSplitMode ? "lg:w-1/3" : "lg:w-1/2"
               )}
            >
               <BenchmarkBox benchmarks={benchmarks} />
            </motion.div>

            {/* COL 2 (Conditional): User Pick Box */}
            <AnimatePresence mode="popLayout">
               {isSplitMode && (
                   <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9, x: 20 }} 
                      animate={{ opacity: 1, scale: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="lg:w-1/3 h-full"
                   >
                       <UserPickBox 
                          user={myData} 
                          rank={seasonStandings.findIndex((u:any) => u.username === myData.username) + 1} 
                       />
                   </motion.div>
               )}
            </AnimatePresence>

            {/* COL 3: Rankings Stack */}
            <motion.div 
               layout 
               className={cn(
                 "flex flex-col gap-6 transition-all duration-500", 
                 isSplitMode ? "lg:w-1/3" : "lg:w-1/2"
               )}
            >
               <div className="flex-1 overflow-hidden">
                  <RankingGridBox 
                    title="2026 Season Rankings" 
                    users={seasonStandings.map((u:any) => ({ ...u, returnPercent: u.seasonReturn }))} 
                  />
               </div>
               <div className="flex-1 overflow-hidden">
                  <RankingGridBox 
                    title="Monthly Performance" 
                    users={monthlyStandings.map((u:any) => ({ ...u, returnPercent: u.monthlyReturn }))} 
                  />
               </div>
            </motion.div>
      </div>

      {/* 3. BOTTOM SECTION: Season Table & Ticker */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[320px] items-stretch">
         <div className="flex-1 min-h-full">
            <SeasonTable currentMonthIndex={new Date().getMonth()} />
         </div>
         <div className="w-full lg:w-1/4 min-h-full">
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