import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchMarketData } from '@/lib/marketData';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlSecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  
  const session = await getServerSession(authOptions);

  // Checks Vercel's automated header OR your Admin UI's URL parameter
  const isCronSecretValid = 
    authHeader === `Bearer ${process.env.CRON_SECRET}` || 
    urlSecret === process.env.CRON_SECRET;
    
  const isAdmin = session?.user && (session.user as any).adminLevel >= 2;
  const isLocal = process.env.NODE_ENV === "development";

  if (!isCronSecretValid && !isAdmin && !isLocal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));

      try {
        const benchmarks = await prisma.benchmark.findMany({ select: { ticker: true } });
        const userPicks = await prisma.pick.findMany({ select: { symbol: true } });

        const symbols = Array.from(new Set([
          ...benchmarks.map(b => b.ticker.toUpperCase()),
          ...userPicks.map(p => p.symbol.toUpperCase()).filter(s => s !== 'PENDING')
        ]));

        if (symbols.length === 0) {
          send({ type: 'done', attempted: 0, updatedCount: 0, failedCount: 0, failedSymbols: [] });
          controller.close();
          return;
        }

        const totalAttempted = symbols.length;
        send({ type: 'start', totalAttempted });

        const marketData = await fetchMarketData(symbols);

        let updatedCount = 0;
        let failedCount = 0;
        const failedSymbols: string[] = [];
        const now = new Date();

        for (let i = 0; i < symbols.length; i++) {
          const sym = symbols[i];
          const d = marketData.find((m: any) => m && m.symbol.toUpperCase() === sym);

          if (d && d.price > 0) {
            const existing = await prisma.latestPrice.findUnique({ where: { symbol: sym } });
            const high = existing?.seasonHigh ? Math.max(existing.seasonHigh, d.dayHigh) : d.dayHigh;
            const low = existing?.seasonLow ? Math.min(existing.seasonLow, d.dayLow) : d.dayLow;

            await prisma.latestPrice.upsert({
              where: { symbol: sym },
              update: { price: d.price, seasonHigh: high, seasonLow: low, updatedAt: now },
              create: { symbol: sym, price: d.price, seasonHigh: d.dayHigh, seasonLow: d.dayLow }
            });
            updatedCount++;
          } else {
            failedCount++;
            failedSymbols.push(sym);
          }

          send({ type: 'progress', attempted: i + 1, updatedCount, failedCount });
        }

        // ==========================================
        // SELF-HEALING MONTHLY ROLLOVER LOGIC
        // ==========================================
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const startOfLastDay = new Date(now.getFullYear(), now.getMonth(), 0, 0, 0, 0);

        const hasRolledOver = await prisma.monthlyClose.findFirst({
          where: {
            date: { gte: startOfLastDay, lte: lastDayOfPrevMonth }
          }
        });

        if (!hasRolledOver) {
          const activeUsers = await prisma.user.findMany({
            where: { isExcluded: false },
            include: { pick: true }
          });

          for (const u of activeUsers) {
            if (!u.pick || u.pick.symbol === 'PENDING') continue;

            const liveData = await prisma.latestPrice.findUnique({
              where: { symbol: u.pick.symbol.toUpperCase() }
            });

            const closingPrice = liveData?.price || u.pick.entryPrice;

            await prisma.monthlyClose.upsert({
              where: {
                symbol_date: { symbol: u.pick.symbol, date: lastDayOfPrevMonth }
              },
              update: { close: closingPrice },
              create: { symbol: u.pick.symbol, date: lastDayOfPrevMonth, close: closingPrice }
            });
          }
        }
        // ==========================================

        send({ type: 'done', attempted: totalAttempted, updatedCount, failedCount, failedSymbols, updatedAt: now.toISOString() });
      } catch (e: any) {
        send({ type: 'error', message: e.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, { 
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' } 
  });
}