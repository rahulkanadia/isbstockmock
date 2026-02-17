"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { motion, AnimatePresence } from "framer-motion";
import TheHeader from "@/components/TheHeader";
import BenchmarkBox from "@/components/BenchmarkBox";
import UserPickBox from "@/components/UserPickBox";
import SeasonHistoryBox from "@/components/SeasonHistoryBox";
import ArenaEngine from "@/components/ArenaEngine";

export default function DashboardClient({ 
  seasonStandings, 
  monthlyStandings, 
  benchmarks, 
  monthlyHistory, 
  session 
}: any) {
  const mode = useLayoutMode();
  const [showMyPick, setShowMyPick] = useState(true);
  const [nemesis, setNemesis] = useState<any>(null);
  const [isMock, setIsMock] = useState(false);

  const isLoggedIn = (!!session?.user || isMock);

  // 1. CLEAR NEMESIS ON LOGOUT
  useEffect(() => {
    if (!isLoggedIn) setNemesis(null);
  }, [isLoggedIn]);

  // 2. ACTIVE USER LOGIC
  const activeUser = useMemo(() => {
    if (!isLoggedIn) return null;
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const lookupName = isLocal ? "brownbobdowney" : (session?.user?.name || "Dev Mode");
    return seasonStandings.find((u: any) => u.username?.toLowerCase() === lookupName?.toLowerCase()) || null;
  }, [session, seasonStandings, isLoggedIn, isMock]);

  // 3. DYNAMIC ACTORS (Left vs Right)
  const isb = benchmarks.find((b: any) => b.name === 'ISB Index');
  const nifty = benchmarks.find((b: any) => b.name === 'Nifty 50');
  const isbRet = isb ? isb.current - 100 : 0;
  const niftyRet = nifty ? nifty.current - 100 : 0;

  // Logged In: [User] vs [Nemesis or ISB]
  // Logged Out: [Nemesis or Nifty] vs [ISB]
  const leftActor = isLoggedIn ? activeUser : (nemesis || { username: "Nifty 50", seasonReturn: niftyRet, isIndex: true });
  const rightActor = isLoggedIn ? (nemesis || { username: "ISB Index", seasonReturn: isbRet, isIndex: true }) : { username: "ISB Index", seasonReturn: isbRet, isIndex: true };

  const gap = (leftActor?.seasonReturn || 0) - (rightActor?.seasonReturn || 0);

  return (
    <div className="min-h-screen bg-eggshell pt-32 px-4 md:px-8 pb-20 font-sans text-ink">
      <TheHeader 
        user={leftActor} // Pass the primary actor (User or Nifty/Nemesis)
        rival={rightActor} // Pass the rival (ISB or Nemesis)
        gap={gap}
        session={session || (isMock ? { user: { name: "Dev Mode" } } : null)}
        onMockLogin={() => setIsMock(!isMock)}
        isLoggedIn={isLoggedIn} // Explicit flag to help header logic
      />

      <div className="mx-auto max-w-[1800px] mt-4">
        <div className={cn(
            "grid gap-8 transition-all duration-500 ease-out min-h-[360px]",
            mode === "expanded" ? (isLoggedIn ? "grid-cols-3" : "grid-cols-2") : "grid-cols-1"
        )}>
          <div className="h-[360px]"><BenchmarkBox benchmarks={benchmarks} /></div>

          <AnimatePresence mode="popLayout">
            {isLoggedIn && activeUser && (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-[360px]">
                 <UserPickBox user={activeUser} rank={0} total={seasonStandings.length} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-[360px]">
            <ArenaEngine 
              users={seasonStandings}
              onSetNemesis={setNemesis}
              activeUser={activeUser} // Null if logged out -> No sticky row
              currentNemesis={nemesis}
              featureOn={true} 
            />
          </div>
        </div>

        <div className="mt-12">
          <SeasonHistoryBox monthlyHistory={monthlyHistory} session={session} />
        </div>
      </div>
    </div>
  );
}