import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const picks = await prisma.pick.findMany({
    where: { active: true },
    include: { user: true },
  });

  const leaderboard = picks.map((p) => ({
    userId: p.userId,
    username: p.user.username,
    baseSymbol: p.baseSymbol,
    exchange: p.exchange,
    entryPrice: p.entryPrice,
    pnlPercent: null, // computed client-side from latest prices
  }));

  return NextResponse.json({ leaderboard });
}
