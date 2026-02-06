// app/page.tsx
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient";

// Force dynamic rendering to ensure fresh prices on every load
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 1. Fetch All Data
  const users = await prisma.user.findMany({
    where: { isExcluded: false },
    include: { pick: true },
  });

  const benchmarks = await prisma.benchmark.findMany();
  const latestPrices = await prisma.latestPrice.findMany();

  // 2. Create Price Map for O(1) Lookup
  // Map Key: Symbol -> { price, seasonHigh, seasonLow }
  const priceMap = new Map(latestPrices.map(p => [
    p.symbol, 
    { price: p.price, high: p.seasonHigh, low: p.seasonLow }
  ]));

  // 3. Hydrate Users & Calculate Returns
  const hydratedUsers = users
    .filter(u => u.pick)
    .map(u => {
      const current = priceMap.get(u.pick!.symbol)?.price || u.pick!.entryPrice;
      
      // Season Return (Since Entry)
      const seasonRet = ((current - u.pick!.entryPrice) / u.pick!.entryPrice) * 100;
      
      // Monthly Return (Since Last Month Close)
      // Fallback: If no prev close (first month), use Entry Price
      const basePrice = u.pick!.previousMonthClose || u.pick!.entryPrice;
      const monthlyRet = ((current - basePrice) / basePrice) * 100;

      return {
        ...u,
        pick: {
          ...u.pick,
          latestPrice: current,
        },
        seasonReturn: seasonRet,
        monthlyReturn: monthlyRet,
      };
    });

  // 4. Hydrate Benchmarks
  const hydratedBenchmarks = benchmarks.map(b => {
    const data = priceMap.get(b.ticker);
    return {
      name: b.name,
      entry: b.openingPriceJan1,
      current: data?.price || b.openingPriceJan1,
      high: data?.high || b.openingPriceJan1,
      low: data?.low || b.openingPriceJan1,
    };
  });

  // 5. Calculate Competition Index (The "Fund" Total) for Benchmarking
  let totalEntry = 0;
  let totalCurrent = 0;
  hydratedUsers.forEach(u => {
    const entry = u.pick?.entryPrice || 1;
    const current = u.pick?.latestPrice as number || entry;
    const units = 100000 / entry; // Assuming 100k equal weight
    totalEntry += 100000;
    totalCurrent += (units * current);
  });
  
  // Add the "Participant Index" to the benchmarks list for the graph
  const competitionBenchmark = {
    name: 'ISB Index',
    entry: totalEntry,
    current: totalCurrent,
    high: totalCurrent, // Simplified for now (ideally track this too)
    low: totalEntry,
  };

  const finalBenchmarks = [competitionBenchmark, ...hydratedBenchmarks];

  // 6. Sort Leaderboards
  const seasonStandings = [...hydratedUsers].sort((a, b) => b.seasonReturn - a.seasonReturn);
  const monthlyStandings = [...hydratedUsers].sort((a, b) => b.monthlyReturn - a.monthlyReturn);

  return (
    <DashboardClient 
      seasonStandings={seasonStandings}
      monthlyStandings={monthlyStandings}
      benchmarks={finalBenchmarks}
      session={session}
    />
  );
}