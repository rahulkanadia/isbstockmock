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
        const users = await prisma.user.findMany({
          where: { isExcluded: false },
          include: { pick: true }
        });
        const symbols = Array.from(new Set([
          ...benchmarks.map(b => b.ticker.toUpperCase()),
          ...users.map(u => u.pick?.symbol?.toUpperCase()).filter(Boolean)
        ])) as string[];
        if (symbols.length === 0) {
          send({ type: 'done', attempted: 0, updatedCount: 0, failedCount: 0, failedSymbols: [] });
          controller.close();
          return;
        }
        const totalAttempted = symbols.length;
        send({ type: 'start', totalAttempted });
        const marketData = await fetchMarketData(symbols);
        const priceMap = new Map(marketData.map((m: any) => [m?.symbol?.toUpperCase(), m]));
        let updatedCount = 0;
        let failedCount = 0;
        const failedSymbols: string[] = [];
        const now = new Date();
        for (let i = 0; i < symbols.length; i++) {
          const sym = symbols[i];
          const d = priceMap.get(sym);
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
        // ISB GROUP REPLACEMENT LOGIC
        // ==========================================
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
          }
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
          for (const u of users) {
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