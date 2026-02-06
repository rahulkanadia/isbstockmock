import { requireUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { calculatePNL } from "@/app/lib/pnl";
import { getActiveRules } from "@/app/lib/rules";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const pick = await prisma.pick.findFirst({
    where: { userId: user.id, active: true },
    // Removed invalid include
  });

  const rules = getActiveRules();

  if (!pick) {
    return Response.json({ hasPick: false, rules });
  }

  // Fix: Manual Price Fetch
  const latestPrice = await prisma.dailyPrice.findFirst({
    where: { 
        baseSymbol: pick.baseSymbol, 
        exchange: pick.exchange 
    },
    orderBy: { date: "desc" },
  });

  const currentPrice = latestPrice?.close ?? pick.entryPrice;
  const pnl = calculatePNL(pick.entryPrice, currentPrice);

  return Response.json({
    hasPick: true,
    symbol: pick.baseSymbol,
    exchange: pick.exchange,
    name: pick.baseSymbol, 
    entryPrice: pick.entryPrice,
    currentPrice,
    pnl,
    entryDate: pick.entryDate,
    rules
  });
}