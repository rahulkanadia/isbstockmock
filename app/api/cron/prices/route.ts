import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchMarketData } from '@/lib/marketData';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // 1. AUTH CHECK: Allow if Admin session exists OR Secret is in URL
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const session = await getServerSession(authOptions);

    const isCronSecretValid = secret === process.env.CRON_SECRET;
    const isAdmin = session?.user && (process.env.ADMIN_IDS?.split(',').includes(session.user.id));

    if (!isCronSecretValid && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. DATA FETCHING
    const benchmarks = await prisma.benchmark.findMany({ select: { ticker: true } });
    const userPicks = await prisma.pick.findMany({ select: { symbol: true } });

    const symbols = Array.from(new Set([
      ...benchmarks.map(b => b.ticker),
      ...userPicks.map(p => p.symbol)
    ]));

    const marketData = await fetchMarketData(symbols);

    let updated = 0;
    const now = new Date();
    // Normalize date to start of day for PriceHistory uniqueness if needed, 
    // though your schema uses symbol_date.
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const d of marketData) {
      const existing = await prisma.latestPrice.findUnique({
        where: { symbol: d.symbol }
      });

      // Calculate Running Highs/Lows
      const high = existing?.seasonHigh ? Math.max(existing.seasonHigh, d.dayHigh) : d.dayHigh;
      const low = existing?.seasonLow ? Math.min(existing.seasonLow, d.dayLow) : d.dayLow;

      // Update Latest Prices
      await prisma.latestPrice.upsert({
        where: { symbol: d.symbol },
        update: { 
          price: d.price, 
          seasonHigh: high, 
          seasonLow: low,
          updatedAt: now 
        },
        create: { 
          symbol: d.symbol, 
          price: d.price, 
          seasonHigh: d.dayHigh, 
          seasonLow: d.dayLow 
        }
      });

      // Update Historical Log (Using normalized 'today' to avoid duplicate rows for the same day)
      await prisma.priceHistory.upsert({
        where: {
          symbol_date: {
            symbol: d.symbol,
            date: today
          }
        },
        update: { price: d.price },
        create: {
          symbol: d.symbol,
          date: today,
          price: d.price
        }
      });

      updated++;
    }

    return NextResponse.json({ success: true, updatedCount: updated });

  } catch (e: any) {
    console.error("Cron Error:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
