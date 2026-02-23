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
  
  // Dynamic Month Rollover Check
  // In production, cron runs daily. If today is the 1st of the month, we snapshot yesterday's close.
  const isNewMonth = now.getDate() === 1; 

  // 1. Update Global Latest Prices
  for (const d of prices) {
    await prisma.latestPrice.upsert({
      where: { symbol: d.symbol },
      update: { 
        price: d.price, 
        dayHigh: d.dayHigh, 
        dayLow: d.dayLow, 
        updatedAt: now 
      },
      create: { 
        symbol: d.symbol, 
        price: d.price, 
        dayHigh: d.dayHigh, 
        dayLow: d.dayLow 
      }
    });
  }

  // 2. Handle Monthly Rollover (Snapshots the rigid MonthlyClose table)
  if (isNewMonth) {
    console.log(":date: New month detected. Snapping Monthly Closes...");
    
    // Create a date object representing the last day of the previous month
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

  // 3. Update User Standings (Returns) using the Central Calculator
  // This guarantees the database values perfectly match the UI dashboard values.
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