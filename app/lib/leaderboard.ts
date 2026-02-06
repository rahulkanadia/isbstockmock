import prisma from "@/app/lib/prisma";
import { calculatePNL } from "@/app/lib/pnl";

export type LeaderboardRow = {
  rank: number;
  username: string;
  symbol: string;
  pnlPercent: number;
  entryPrice: number;
  currentPrice: number;
};

export async function getActiveLeaderboard(): Promise<LeaderboardRow[]> {
  // 1. Fetch all active picks
  const picks = await prisma.pick.findMany({
    where: { active: true },
    include: {
      user: { select: { username: true } },
    },
  });

  const rows: Omit<LeaderboardRow, "rank">[] = [];

  // 2. Loop and fetch prices
  // (For larger scale, we would cache this, but for <1000 users this is fine)
  for (const p of picks) {
    const latestPrice = await prisma.dailyPrice.findFirst({
      where: { 
        baseSymbol: p.baseSymbol, 
        exchange: p.exchange 
      },
      orderBy: { date: "desc" },
    });

    const currentPrice = latestPrice?.close ?? p.entryPrice;
    
    const pnl =
      p.entryPrice > 0
        ? calculatePNL(p.entryPrice, currentPrice)
        : 0;

    rows.push({
      username: p.user.username,
      symbol: p.baseSymbol,
      entryPrice: p.entryPrice,
      currentPrice: currentPrice,
      pnlPercent: Number(pnl.toFixed(2)),
    });
  }

  // 3. Sort and Rank
  return rows
    .sort((a, b) => b.pnlPercent - a.pnlPercent)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
}

export async function getTopWinnersLosers(limit = 5) {
  const sorted = await getActiveLeaderboard();

  return {
    winners: sorted.slice(0, limit),
    losers: [...sorted].reverse().slice(0, limit),
  };
}