import prisma from "@/app/lib/prisma";

/**
 * Returns the timestamp of the most recent DailyPrice entry
 * Used for "Last Updated" indicators
 */
export async function getLastPriceUpdate(): Promise<Date | null> {
  const latest = await prisma.dailyPrice.findFirst({
    orderBy: {
      date: "desc",
    },
    select: {
      date: true,
    },
  });

  return latest?.date ?? null;
}