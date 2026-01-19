import { prisma } from "./prisma";

export async function canChangeThisMonth(userId: string): Promise<boolean> {
  const ym = new Date().toISOString().slice(0, 7);

  const existing = await prisma.monthlyChange.findUnique({
    where: {
      userId_yearMonth: {
        userId,
        yearMonth: ym,
      },
    },
  });

  return !existing;
}
