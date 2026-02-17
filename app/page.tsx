import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

// 1. TYPE DEFINITIONS
interface LatestPriceData {
  symbol: string;
  price: number;
  seasonHigh?: number;
  seasonLow?: number;
}

// SERVER-SIDE CACHE
const historyCache: Record<number, any> = {};

export default async function Home() {
  const session = await getServerSession(authOptions);

  const [users, benchmarks, latestPrices] = await Promise.all([
    prisma.user.findMany({ where: { isExcluded: false }, include: { pick: true } }),
    prisma.benchmark.findMany(),
    prisma.latestPrice.findMany(),
  ]);

  // FIX A: Typed Map
  const priceMap = new Map<string, LatestPriceData>(
    latestPrices.map(p => [p.symbol, p as unknown as LatestPriceData])
  );
  
  const currentMonthIndex = new Date().getMonth(); 
  const currentYear = 2026;

  const monthlyHistory = await Promise.all(
    Array.from({ length: currentMonthIndex + 1 }).map(async (_, monthIdx) => {

      if (monthIdx === currentMonthIndex) {
        const liveUsers = users.filter(u => u.pick).map(u => {
          const pick = u.pick!;
          // FIX B: Safely access .price
          const currentPrice = priceMap.get(pick.symbol)?.price ?? pick.entryPrice;
          const startPrice = pick.previousMonthClose || pick.entryPrice;
          return {
            username: u.username,
            monthlyReturn: ((currentPrice - startPrice) / startPrice) * 100,
            symbol: pick.symbol
          };
        });

        const winner = [...liveUsers].sort((a, b) => b.monthlyReturn - a.monthlyReturn)[0];
        return {
          monthIndex: monthIdx,
          cohortReturn: liveUsers.reduce((acc, u) => acc + u.monthlyReturn, 0) / (liveUsers.length || 1),
          winner: winner ? { 
            username: winner.username, 
            monthlyReturn: winner.monthlyReturn, 
            pick: { symbol: winner.symbol } 
          } : null
        };
      }

      if (historyCache[monthIdx]) return historyCache[monthIdx];

      const monthStart = new Date(currentYear, monthIdx, 1);
      const monthEnd = new Date(currentYear, monthIdx + 1, 0, 23, 59, 59);

      const historicalPrices = await prisma.priceHistory.findMany({
        where: { 
          symbol: { in: users.map(u => u.pick?.symbol).filter(Boolean) as string[] }, 
          date: { gte: monthStart, lte: monthEnd } 
        },
        orderBy: { date: 'desc' }
      });

      const historicalMap = new Map();
      historicalPrices.forEach((p: any) => {
        if (!historicalMap.has(p.symbol)) historicalMap.set(p.symbol, p.price);
      });

      const historicalUsers = users.filter(u => u.pick).map(u => {
        const pick = u.pick!;
        const monthEndPrice = historicalMap.get(pick.symbol) ?? pick.entryPrice;
        const startPrice = monthIdx === 0 ? pick.entryPrice : (pick.previousMonthClose || pick.entryPrice);

        return {
          username: u.username,
          monthlyReturn: ((monthEndPrice - startPrice) / startPrice) * 100,
          symbol: pick.symbol
        };
      });

      const winner = [...historicalUsers].sort((a, b) => b.monthlyReturn - a.monthlyReturn)[0];
      const result = {
        monthIndex: monthIdx,
        cohortReturn: historicalUsers.reduce((acc, u) => acc + u.monthlyReturn, 0) / (historicalUsers.length || 1),
        winner: winner ? { 
          username: winner.username, 
          monthlyReturn: winner.monthlyReturn, 
          pick: { symbol: winner.symbol } 
        } : null
      };

      historyCache[monthIdx] = result;
      return result;
    })
  );

  const hydratedUsers = users
    .filter(u => u.pick)
    .map(u => {
      const pick = u.pick!;
      // FIX C: Typed casting for liveData
      const liveData = priceMap.get(pick.symbol) as LatestPriceData | undefined;
      let entryPrice = pick.entryPrice;
      const currentPrice = liveData?.price ?? entryPrice;

      if (u.username.toLowerCase() === 'zoom') entryPrice = 1600; 
      if (!entryPrice || entryPrice === 0) entryPrice = currentPrice; 

      const prevMonthClose = pick.previousMonthClose || entryPrice;

      return {
        ...u,
        seasonReturn: ((currentPrice - entryPrice) / entryPrice) * 100,
        monthlyReturn: ((currentPrice - prevMonthClose) / prevMonthClose) * 100,
        latestPrice: currentPrice,
        pick: { ...pick, entryPrice, latestPrice: currentPrice }
      };
    });

  let totalEntry = 0, totalCurrent = 0;
  hydratedUsers.forEach(u => {
    totalEntry += u.pick.entryPrice;
    totalCurrent += u.latestPrice;
  });
  const isbIndexReturn = totalEntry > 0 ? ((totalCurrent - totalEntry) / totalEntry) * 100 : 0;

  const finalBenchmarks = [
    {
      name: 'ISB Index',
      entry: 100,
      current: 100 * (1 + (isbIndexReturn / 100)),
      high: 100 * (1 + ((isbIndexReturn + 1.5) / 100)), 
      low: 100 * (1 + ((isbIndexReturn - 1.5) / 100))
    },
    ...benchmarks.map(b => {
      // FIX D: Typed casting for Benchmark live data
      const live = priceMap.get(b.ticker) as LatestPriceData | undefined;
      const current = live?.price ?? b.openingPriceJan1;
      return {
        name: b.name,
        entry: b.openingPriceJan1,
        current,
        high: live?.seasonHigh ?? Math.max(current, b.openingPriceJan1),
        low: live?.seasonLow ?? Math.min(current, b.openingPriceJan1)
      };
    })
  ];

  const seasonStandings = [...hydratedUsers].sort((a, b) => b.seasonReturn - a.seasonReturn);
  const monthlyStandings = [...hydratedUsers].sort((a, b) => b.monthlyReturn - a.monthlyReturn);

  return (
    <DashboardClient 
      benchmarks={finalBenchmarks}
      seasonStandings={seasonStandings}
      monthlyStandings={monthlyStandings}
      monthlyHistory={monthlyHistory}
      session={session}
    />
  );
}