// app/page.tsx
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

export default async function Home() {
  const session = await getServerSession(authOptions);

  // 1. Fetch Data
  const [users, benchmarks, latestPrices] = await Promise.all([
    prisma.user.findMany({ where: { isExcluded: false }, include: { pick: true } }),
    prisma.benchmark.findMany(),
    prisma.latestPrice.findMany(),
  ]);

  // 2. Price Map
  const priceMap = new Map(latestPrices.map(p => [
    p.symbol, 
    { price: p.price, high: p.seasonHigh, low: p.seasonLow }
  ]));

  // 3. Hydrate Users
  const hydratedUsers = users
    .filter(u => u.pick)
    .map(u => {
      const current = priceMap.get(u.pick!.symbol)?.price || u.pick!.entryPrice;
      const seasonRet = ((current - u.pick!.entryPrice) / u.pick!.entryPrice) * 100;
      const basePrice = u.pick!.previousMonthClose || u.pick!.entryPrice;
      const monthlyRet = ((current - basePrice) / basePrice) * 100;

      return {
        ...u,
        pick: { ...u.pick, latestPrice: current },
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

  // 5. Calculate Competition Index
  let totalEntry = 0;
  let totalCurrent = 0;
  hydratedUsers.forEach(u => {
    const entry = u.pick?.entryPrice || 1;
    const current = u.pick?.latestPrice as number || entry;
    totalEntry += 100000;
    totalCurrent += (100000 / entry) * current;
  });

  const finalBenchmarks = [
    {
      name: 'ISB Index',
      entry: totalEntry,
      current: totalCurrent,
      high: totalCurrent * 1.02, // Mocked for visual wicks
      low: totalCurrent * 0.98,
    },
    ...hydratedBenchmarks
  ];

  // 6. Sort
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
