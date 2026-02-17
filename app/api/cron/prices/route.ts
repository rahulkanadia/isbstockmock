import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchMarketData } from '@/lib/marketData';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const benchmarks = await prisma.benchmark.findMany({ select: { ticker: true } });
    const userPicks = await prisma.pick.findMany({ select: { symbol: true } });

    const symbols = Array.from(new Set([
      ...benchmarks.map(b => b.ticker),
      ...userPicks.map(p => p.symbol)
    ]));

    const marketData = await fetchMarketData(symbols);

    let updated = 0;
    const now = new Date();

    for (const d of marketData) {
      const existing = await prisma.latestPrice.findUnique({
        where: { symbol: d.symbol }
      });

      const high = existing?.seasonHigh ? Math.max(existing.seasonHigh, d.dayHigh) : d.dayHigh;
      const low = existing?.seasonLow ? Math.min(existing.seasonLow, d.dayLow) : d.dayLow;

      await prisma.latestPrice.upsert({
        where: { symbol: d.symbol },
        update: { price: d.price, seasonHigh: high, seasonLow: low },
        create: { symbol: d.symbol, price: d.price, seasonHigh: d.dayHigh, seasonLow: d.dayLow }
      });

      await prisma.priceHistory.upsert({
        where: {
          symbol_date: {
            symbol: d.symbol,
            date: now
          }
        },
        update: { price: d.price },
        create: {
          symbol: d.symbol,
          date: now,
          price: d.price
        }
      });

      updated++;
    }

    return NextResponse.json({ success: true, message: updated });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}