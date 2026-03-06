import { prisma } from "./db";

export async function getDashboardData() {
  // 1. Fetch all required data in a single optimized batch
  const users = await prisma.user.findMany({
    where: { isExcluded: false },
    include: { pick: true }
  });
  const benchmarks = await prisma.benchmark.findMany();
  const latestPrices = await prisma.latestPrice.findMany();
  const monthlyCloses = await prisma.monthlyClose.findMany({
    orderBy: { date: 'asc' }
  });

  // 2. Build fast lookup maps
  const priceMap = new Map(latestPrices.map(p => [p.symbol.toUpperCase(), p]));
  const closeMap = new Map<string, typeof monthlyCloses>();

  monthlyCloses.forEach(mc => {
    const sym = mc.symbol.toUpperCase();
    if (!closeMap.has(sym)) closeMap.set(sym, []);
    closeMap.get(sym)!.push(mc);
  });

  // 3. HYDRATE USERS (Calculate % since entry & % for current month)
  const hydratedUsers = users.filter(u => u.pick).map(u => {
    const pick = u.pick!;
    const symbol = pick.symbol.toUpperCase();

    const liveData = priceMap.get(symbol);
    const entryPrice = pick.entryPrice || 1; // Safety: prevent divide by zero
    const currentPrice = liveData?.price ?? entryPrice;

    // For Individual OHLC (Leaderboard)
    const highPrice = liveData?.seasonHigh ?? currentPrice;
    const lowPrice = liveData?.seasonLow ?? currentPrice;
    
    // NEW: For Portfolio OHLC (ISB Index)
    const groupHigh = liveData?.groupHigh ?? currentPrice;
    const groupLow = liveData?.groupLow ?? currentPrice;

    const closes = closeMap.get(symbol) || [];

    // Metric 1: % Since Competition Entry
    const seasonReturn = ((currentPrice - entryPrice) / entryPrice) * 100;

    // Metric 3: % For Current Month
    const prevMonthClose = closes.length > 0 ? closes[closes.length - 1].close : entryPrice;
    const monthlyReturn = ((currentPrice - prevMonthClose) / prevMonthClose) * 100;

    return {
      ...u,
      seasonReturn,
      monthlyReturn,
      latestPrice: currentPrice,
      pick: { ...pick, entryPrice, latestPrice: currentPrice, highPrice, lowPrice, groupHigh, groupLow }
    };
  });

  // 4. ISB INDEX (Cohort Average applying exact portfolio math)
  let totalEntry = 0, totalCurrent = 0, totalHigh = 0, totalLow = 0;
  hydratedUsers.forEach(u => {
    totalEntry += u.pick.entryPrice;
    totalCurrent += u.latestPrice;
    // We sum the synchronized group highs/lows, NOT the individual all-time highs
    totalHigh += u.pick.groupHigh;
    totalLow += u.pick.groupLow;
  });

  const isbIndexReturn = totalEntry > 0 ? ((totalCurrent - totalEntry) / totalEntry) * 100 : 0;
  const isbIndexHigh = totalEntry > 0 ? ((totalHigh - totalEntry) / totalEntry) * 100 : 0;
  const isbIndexLow = totalEntry > 0 ? ((totalLow - totalEntry) / totalEntry) * 100 : 0;

  // 5. BENCHMARKS
  const finalBenchmarks = [
    {
      name: 'ISB Index',
      entry: 100, // Mathematical base to keep the graph scaling correct
      current: 100 * (1 + (isbIndexReturn / 100)),
      high: 100 * (1 + (isbIndexHigh / 100)),
      low: 100 * (1 + (isbIndexLow / 100)),
      // Explicit display values to feed straight into the OHLC box
      displayOpen: 0,
      displayHigh: isbIndexHigh,
      displayLow: isbIndexLow,
      displayClose: isbIndexReturn
    },
    ...benchmarks.map(b => {
      const live = priceMap.get(b.ticker.toUpperCase());
      const current = live?.price ?? b.openingPriceJan1;
      const high = live?.seasonHigh ?? Math.max(current, b.openingPriceJan1);
      const low = live?.seasonLow ?? Math.min(current, b.openingPriceJan1);
      return {
        name: b.name,
        entry: b.openingPriceJan1,
        current,
        high,
        low,
        // Explicit display values
        displayOpen: b.openingPriceJan1,
        displayHigh: high,
        displayLow: low,
        displayClose: current
      };
    })
  ];

  // 6. MONTHLY HISTORY (Metric 2: % for each past month based on opening/closing)
  const currentMonthIndex = new Date().getMonth();
  const monthlyHistory: any[] = [];

  for (let m = 0; m <= currentMonthIndex; m++) {
    if (m === currentMonthIndex) {
       // Current Month Cohort
       const winner = [...hydratedUsers].sort((a,b) => b.monthlyReturn - a.monthlyReturn)[0];
       const cohortReturn = hydratedUsers.reduce((acc, u) => acc + u.monthlyReturn, 0) / (hydratedUsers.length || 1);
       monthlyHistory.push({
         monthIndex: m,
         cohortReturn,
         winner: winner ? { username: winner.username, monthlyReturn: winner.monthlyReturn, pick: { symbol: winner.pick.symbol } } : null
       });
    } else {
       // Past Months Cohort (Uses the rigid MonthlyClose table)
       const historicalUsers = users.filter(u => u.pick).map(u => {
         const sym = u.pick!.symbol.toUpperCase();
         const closes = closeMap.get(sym) || [];
         const entry = u.pick!.entryPrice || 1;

         const startPrice = m === 0 ? entry : (closes[m - 1]?.close ?? entry);
         const endPrice = closes[m]?.close ?? startPrice;

         const mRet = ((endPrice - startPrice) / startPrice) * 100;
         return { username: u.username, monthlyReturn: mRet, symbol: sym };
       });

       const winner = [...historicalUsers].sort((a,b) => b.monthlyReturn - a.monthlyReturn)[0];
       const cohortReturn = historicalUsers.reduce((acc, u) => acc + u.monthlyReturn, 0) / (historicalUsers.length || 1);

       monthlyHistory.push({
         monthIndex: m,
         cohortReturn,
         winner: winner ? { username: winner.username, monthlyReturn: winner.monthlyReturn, pick: { symbol: winner.symbol } } : null
       });
    }
  }

  const seasonStandings = [...hydratedUsers].sort((a, b) => b.seasonReturn - a.seasonReturn);
  const monthlyStandings = [...hydratedUsers].sort((a, b) => b.monthlyReturn - a.monthlyReturn);

  return { finalBenchmarks, seasonStandings, monthlyStandings, monthlyHistory, hydratedUsers };
}
