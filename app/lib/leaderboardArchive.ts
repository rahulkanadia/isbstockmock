import prisma from "@/app/lib/prisma";

export async function getMonthlyLeaderboard(month: string) {
  return prisma.pick.findMany({
    where: {
      entryDate: {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-31`),
      },
    },
    orderBy: { pnlPercent: "desc" },
  });
}