import { prisma } from "./db";
import { fetchMarketData } from "./marketData";
import { getDashboardData } from "./calculator";
export async function runPriceUpdateEngine() {
  const users = await prisma.user.findMany({
    where: { isExcluded: false },
    include: { pick: true }
  });
  const benchmarks = await prisma.benchmark.findMany();
  const symbols = [...new Set([
    ...users.map(u => u.pick?.symbol).filter(Boolean),
    ...benchmarks.map(b => b.ticker)
  ])] as string[];
  const prices = await fetchMarketData(symbols);
  if (!prices.length) return { success: false, message: "No data fetched." };
  const priceMap = new Map(prices.map(p => [p.symbol.toUpperCase(), p]));
  const now = new Date();
  const isNewMonth = now.getDate() === 1;
  // 1. Update Global Latest Prices (Fixed to properly map individual seasonHigh/seasonLow)
  for (const d of prices) {
    const existing = await prisma.latestPrice.findUnique({ where: { symbol: d.symbol } });
    const high = existing?.seasonHigh ? Math.max(existing.seasonHigh, d.dayHigh) : d.dayHigh;
    const low = existing?.seasonLow ? Math.min(existing.seasonLow, d.dayLow) : d.dayLow;
    await prisma.latestPrice.upsert({
      where: { symbol: d.symbol },
      update: {
        price: d.price,
        dayHigh: d.dayHigh,
        dayLow: d.dayLow,
        seasonHigh: high,
        seasonLow: low,
        updatedAt: now
      },
      create: {
        symbol: d.symbol,
        price: d.price,
        dayHigh: d.dayHigh,
        dayLow: d.dayLow,
        seasonHigh: d.dayHigh,
        seasonLow: d.dayLow
      }
    });
  }
  // 1.5. ISB Group Replacement Logic (Phase 3)
  let totalEntry = 0;
  let totalCurrent = 0;
  users.forEach(u => {
    if (u.pick && u.pick.symbol !== 'PENDING') {
      const entry = u.pick.entryPrice || 1;
      const liveData = priceMap.get(u.pick.symbol.toUpperCase());
      const current = liveData?.price || entry;
      totalEntry += entry;
      totalCurrent += current;
    }
  });
  if (totalEntry > 0) {
    const currentIsbReturn = ((totalCurrent - totalEntry) / totalEntry) * 100;
    const [highState, lowState] = await Promise.all([
      prisma.systemState.findUnique({ where: { key: 'ISB_GROUP_HIGH' } }),
      prisma.systemState.findUnique({ where: { key: 'ISB_GROUP_LOW' } })
    ]);
    const isbHigh = highState ? parseFloat(highState.value) : -Infinity;
    const isbLow = lowState ? parseFloat(lowState.value) : Infinity;
    const isNewHigh = currentIsbReturn > isbHigh || !highState;
    const isNewLow = currentIsbReturn < isbLow || !lowState;
    if (isNewHigh || isNewLow) {
      const activeSymbols = [...new Set(users.map(u => u.pick?.symbol).filter(Boolean))] as string[];
      for (const sym of activeSymbols) {
        const live = priceMap.get(sym.toUpperCase());
        if (!live) continue;
        const updateData: any = {};
        if (isNewHigh) updateData.groupHigh = live.price;
        if (isNewLow) updateData.groupLow = live.price;
        await prisma.latestPrice.update({
          where: { symbol: sym },
          data: updateData
        });
      }
      if (isNewHigh) {
        await prisma.systemState.upsert({
          where: { key: 'ISB_GROUP_HIGH' },
          update: { value: currentIsbReturn.toString() },
          create: { key: 'ISB_GROUP_HIGH', value: currentIsbReturn.toString() }
        });
      }
      if (isNewLow) {
        await prisma.systemState.upsert({
          where: { key: 'ISB_GROUP_LOW' },
          update: { value: currentIsbReturn.toString() },
          create: { key: 'ISB_GROUP_LOW', value: currentIsbReturn.toString() }
        });
      }
      console.log(`📈 ISB Group boundaries updated. New High: ${isNewHigh}, New Low: ${isNewLow}`);
    }
  }
  // 2. Handle Monthly Rollover
  if (isNewMonth) {
    console.log("📅 New month detected. Snapping Monthly Closes...");
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    for (const u of users) {
      if (!u.pick) continue;
      const liveData = priceMap.get(u.pick.symbol.toUpperCase());
      const current = liveData?.price || u.pick.entryPrice;
      await prisma.monthlyClose.upsert({
        where: {
          symbol_date: { symbol: u.pick.symbol, date: lastDayOfPrevMonth }
        },
        update: { close: current },
        create: { symbol: u.pick.symbol, date: lastDayOfPrevMonth, close: current }
      });
    }
  }
  // 3. Update User Standings
  const { hydratedUsers } = await getDashboardData();
  for (const u of hydratedUsers) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        currentSeasonReturn: u.seasonReturn,
        currentMonthlyReturn: u.monthlyReturn
      }
    });
  }
  return { success: true };
}