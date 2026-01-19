import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { fetchYahooQuote } from "@/app/lib/yahoo";
import { isMarketOpenNow, nextTradingDay } from "@/app/lib/marketCalendar";
import { canChangeThisMonth } from "@/app/lib/rules";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { baseSymbol, exchange } = await req.json();

  const symbol = await prisma.symbol.findUnique({
    where: { baseSymbol_exchange: { baseSymbol, exchange } },
  });

  if (!symbol || !symbol.active) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const existingPick = await prisma.pick.findFirst({
    where: { userId: session.user.id, active: true },
  });

  if (existingPick) {
    return NextResponse.json(
      { error: "Active pick already exists" },
      { status: 400 }
    );
  }

  if (!(await canChangeThisMonth(session.user.id))) {
    return NextResponse.json(
      { error: "Monthly change already used" },
      { status: 400 }
    );
  }

  const quote = await fetchYahooQuote(baseSymbol, exchange);
  if (!quote.regularMarketOpen) {
    return NextResponse.json(
      { error: "Market data unavailable" },
      { status: 500 }
    );
  }

  const entryDate = isMarketOpenNow()
    ? new Date()
    : nextTradingDay(new Date());

  await prisma.pick.create({
    data: {
      userId: session.user.id,
      baseSymbol,
      exchange,
      entryDate,
      entryPrice: quote.regularMarketOpen,
    },
  });

  return NextResponse.json({ success: true });
}
