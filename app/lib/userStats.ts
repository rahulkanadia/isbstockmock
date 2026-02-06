import prisma from "@/app/lib/prisma";
import { calculatePNL } from "@/app/lib/pnl";
import { getLatestPrice } from "@/app/lib/prices";

export async function getUserStats(userId: string) {
  const picks = await prisma.pick.findMany({
    where: { userId },
    select: {
      baseSymbol: true,
      exchange: true,
      entryDate: true,
      entryPrice: true,
    },
  });

  let bestReturn = -Infinity;
  const months = new Set<string>();

  for (const p of picks) {
    const price = await getLatestPrice(
      p.baseSymbol,
      p.exchange
    );

    if (!price || price.close == null) continue;

    const pnl = calculatePNL(
      p.entryPrice,
      price.close
    );

    bestReturn = Math.max(bestReturn, pnl);

    months.add(p.entryDate.toISOString().slice(0, 7));
  }

  return {
    monthsParticipated: months.size,
    bestReturn:
      bestReturn === -Infinity
        ? null
        : Number(bestReturn.toFixed(2)),
  };
}