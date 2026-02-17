import { prisma } from "./db";
import { fetchMarketData } from "./marketData";

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

  const priceMap = new Map(prices.map(p => [p.symbol, p.price]));
  const now = new Date();
  const isNewMonth = now.getDate() === 1; // Simplistic check for 1st of month

  // 1. Update Global Prices
  for (const d of prices) {
    await prisma.latestPrice.upsert({
      where: { symbol: d.symbol },
      update: { price: d.price, updatedAt: now },
      create: { symbol: d.symbol, price: d.price }
    });
  }

  // 2. Handle Monthly Rollover
  if (isNewMonth) {
    console.log("📅 New month detected. Performing rollover...");
    for (const u of users) {
      if (!u.pick) continue;
      const current = priceMap.get(u.pick.symbol) || u.pick.entryPrice;
      
      await prisma.pick.update({
        where: { userId: u.id },
        data: { previousMonthClose: current }
      });
    }
  }

  // 3. Update User Standings (Returns)
  for (const u of users) {
    if (!u.pick) continue;
    const current = priceMap.get(u.pick.symbol) ?? u.pick.entryPrice;
    
    // Season: (Current - Initial Entry)
    const seasonRet = ((current - u.pick.entryPrice) / u.pick.entryPrice) * 100;
    
    // Monthly: (Current - Start of Month)
    const startPrice = u.pick.previousMonthClose || u.pick.entryPrice;
    const monthRet = ((current - startPrice) / startPrice) * 100;

    await prisma.user.update({
      where: { id: u.id },
      data: { currentSeasonReturn: seasonRet, currentMonthlyReturn: monthRet }
    });
  }

  return { success: true };
}
