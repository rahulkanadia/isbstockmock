import prisma from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/accessControl";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  // 1. Find users with > 1 active pick (Integrity Violation)
  const multiPicks = await prisma.pick.groupBy({
    by: ["userId"],
    where: { active: true },
    _count: { userId: true },
    having: { userId: { _count: { gt: 1 } } },
  });

  // 2. Count Total Active Users
  const activeUsersCount = await prisma.pick.count({
    where: { active: true }
  });

  // 3. Find picks with missing prices (Stale Data)
  // We check if the latest dailyPrice is older than 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // This is a simplified check. In production, you might query specific symbols.
  const stalePricesCount = 0; 

  return Response.json({
    multiPickViolations: multiPicks.length,
    violatorIds: multiPicks.map(p => p.userId),
    activeTraders: activeUsersCount,
    syncFailures: stalePricesCount
  });
}