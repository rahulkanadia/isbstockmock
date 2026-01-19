import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { fetchYahooQuote } from "@/app/lib/yahoo";

export async function GET() {
  const activePicks = await prisma.pick.findMany({
    where: { active: true },
    distinct: ["baseSymbol", "exchange"],
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const pick of activePicks) {
    const quote = await fetchYahooQuote(pick.baseSymbol, pick.exchange);
    if (!quote.regularMarketPrice || !quote.regularMarketOpen) continue;

    await prisma.dailyPrice.upsert({
      where: {
        baseSymbol_exchange_date: {
          baseSymbol: pick.baseSymbol,
          exchange: pick.exchange,
          date: today,
        },
      },
      update: {},
      create: {
        baseSymbol: pick.baseSymbol,
        exchange: pick.exchange,
        date: today,
        open: quote.regularMarketOpen,
        close: quote.regularMarketPrice,
      },
    });
  }

  return NextResponse.json({ success: true });
}
