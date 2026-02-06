import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // OR import { prisma } from '@/lib/db';
import { fetchMarketData } from '@/lib/marketData';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

// If you created lib/db.ts, change this to: import { prisma } from '@/lib/db';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log("🚀 Starting Price Update Job...");

    // 1. Fetch Symbols (With Retry for Cold Start)
    let uniqueSymbols: string[] = [];
    
    // Simple retry loop for the initial connection
    for (let i = 0; i < 3; i++) {
        try {
            const benchmarks = await prisma.benchmark.findMany({ select: { ticker: true } });
            const userPicks = await prisma.pick.findMany({ select: { symbol: true } });
            
            uniqueSymbols = Array.from(new Set([
                ...benchmarks.map(b => b.ticker),
                ...userPicks.map(p => p.symbol)
            ]));
            break; // Success
        } catch (e: any) {
            console.warn(`DB Connection failed (Attempt ${i+1}). Retrying...`);
            await new Promise(r => setTimeout(r, 1500));
            if (i === 2) throw e; // Fail on last attempt
        }
    }

    // 2. Fetch Live Data
    const marketData = await fetchMarketData(uniqueSymbols);

    // 3. Update DB
    let updatedCount = 0;
    for (const data of marketData) {
       const existing = await prisma.latestPrice.findUnique({ where: { symbol: data.symbol } });

       const newSeasonHigh = existing?.seasonHigh 
            ? Math.max(existing.seasonHigh, data.dayHigh) 
            : data.dayHigh;
            
       const newSeasonLow = existing?.seasonLow 
            ? Math.min(existing.seasonLow, data.dayLow) 
            : data.dayLow;

       await prisma.latestPrice.upsert({
         where: { symbol: data.symbol },
         update: {
            price: data.price,
            seasonHigh: newSeasonHigh,
            seasonLow: newSeasonLow,
         },
         create: {
            symbol: data.symbol,
            price: data.price,
            seasonHigh: data.dayHigh,
            seasonLow: data.dayLow
         }
       });
       updatedCount++;
    }

    return NextResponse.json({ success: true, message: `Updated ${updatedCount} symbols` });

  } catch (error: any) {
    console.error("CRON JOB FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}