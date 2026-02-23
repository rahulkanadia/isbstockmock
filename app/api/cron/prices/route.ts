import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchMarketData } from '@/lib/marketData';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const session = await getServerSession(authOptions);

  const isCronSecretValid = secret === process.env.CRON_SECRET;
  const isAdmin = session?.user && (session.user as any).adminLevel >= 2;
  const isLocal = process.env.NODE_ENV === "development";

  if (!isCronSecretValid && !isAdmin && !isLocal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create a ReadableStream to stream progress to the client
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

        // Bulk fetch all data from Yahoo Finance
        const marketData = await fetchMarketData(symbols);
        
        let updatedCount = 0;
        let failedCount = 0;
        const failedSymbols: string[] = [];
        const now = new Date();

        // Loop through and write to the DB, streaming progress as we go
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

          // Emit progress to UI
          send({ type: 'progress', attempted: i + 1, updatedCount, failedCount });
        }

        send({ type: 'done', attempted: totalAttempted, updatedCount, failedCount, failedSymbols, updatedAt: now.toISOString() });
      } catch (e: any) {
        send({ type: 'error', message: e.message });
      } finally {
        controller.close();
      }
    }
  });

  // Return NDJSON (Newline Delimited JSON) stream
  return new Response(stream, { 
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' } 
  });
}