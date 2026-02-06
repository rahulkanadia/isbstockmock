import prisma from "@/app/lib/prisma";
import { calculatePNL } from "@/app/lib/pnl";

export async function recomputePnLForPick(pickId: string) {
  const pick = await prisma.pick.findUnique({
    where: { id: pickId },
  });

  if (!pick) return;

  const latest = await prisma.dailyPrice.findFirst({
    where: {
      baseSymbol: pick.baseSymbol,
      exchange: pick.exchange,
    },
    orderBy: { date: "desc" },
  });

  if (!latest?.close) return;

  const pnl = calculatePNL(pick.entryPrice, latest.close);

  await prisma.pick.update({
    where: { id: pick.id },
    data: {
      pnlPercent: pnl,
      exitPrice: pick.active ? null : latest.close,
    },
  });
}