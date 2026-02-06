import prisma from "@/app/lib/prisma";
import { requireAdmin, isUserBanned } from "@/app/lib/accessControl";
import { calculatePNL } from "@/app/lib/pnl";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  // 1. Fetch Users and their active picks (Raw)
  const users = await prisma.user.findMany({
    include: {
      picks: {
        where: { active: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Process them (Fetch prices manually)
  const formattedUsers = await Promise.all(users.map(async (u) => {
    const activePick = u.picks[0] || null;
    let pnl = 0;
    let currentPrice = 0;
    
    if (activePick) {
        // Fix: Manual Price Fetch
        const latestPrice = await prisma.dailyPrice.findFirst({
            where: { 
                baseSymbol: activePick.baseSymbol, 
                exchange: activePick.exchange 
            },
            orderBy: { date: 'desc' }
        });

        currentPrice = latestPrice?.close ?? activePick.entryPrice;
        
        if(activePick.entryPrice > 0) {
             pnl = calculatePNL(activePick.entryPrice, currentPrice);
        }
    }

    return {
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      isBanned: await isUserBanned(u.id), 
      activePick: activePick ? {
        id: activePick.id,
        symbol: activePick.baseSymbol,
        exchange: activePick.exchange,
        entryPrice: activePick.entryPrice,
        currentPrice: currentPrice,
        entryDate: activePick.entryDate,
        pnl: pnl
      } : null
    };
  }));

  return Response.json(formattedUsers);
}
