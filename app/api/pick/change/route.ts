import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { fetchYahooQuote } from "@/app/lib/yahoo";
import { calculatePnlPercent } from "@/app/lib/pnl";
import { canChangeThisMonth } from "@/app/lib/rules";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { baseSymbol, exchange } = await req.json();

  if (!(await canChangeThisMonth(session.user.id))) {
    return NextResponse.json(
      { error: "Monthly change already used" },
      { status: 400 }
    );
  }

  const activePick = await prisma.pick.findFirst({
    where: { userId: session.user.id, active: true },
  });

  if (!activePick) {
    return NextResponse.json(
      { error: "No active pick to change" },
      { status: 400 }
    );
  }

  const quote = await fetchYahooQuote(
    activePick.baseSymbol,
    activePick.exchange
  );

  if (!quote.regularMarketPrice) {
    return NextResponse.json(
      { error: "Market price unavailable" },
      { status: 500 }
    );
  }

  const pnl = calculatePnlPercent(
    activePick.entryPrice,
    quote.regularMarketPrice
  );

  await prisma.$transaction([
    prisma.pick.update({
      where: { id: activePick.id },
      data: {
        exitDate: new Date(),
        exitPrice: quote.regularMarketPrice,
        pnlPercent: pnl,
        active: false,
      },
    }),
    prisma.monthlyChange.create({
      data: {
        userId: session.user.id,
        yearMonth: new Date().toISOString().slice(0, 7),
      },
    }),
    prisma.pick.create({
      data: {
        userId: session.user.id,
        baseSymbol,
        exchange,
        entryDate: new Date(),
        entryPrice: quote.regularMarketPrice,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
