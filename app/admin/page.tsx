import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminConsole from "./AdminConsole";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const IS_LOCAL = process.env.NODE_ENV === "development";

  if (!IS_LOCAL && (!session?.user || session.user.adminLevel < 1)) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: { pick: true },
    orderBy: { username: 'asc' }
  });

  const latestPrice = await prisma.latestPrice.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  // Category Arrays
  const activeParticipants = users.filter(u => u.pick && u.pick.symbol !== 'PENDING');
  const legacyEntries = users.filter(u => u.id.startsWith('legacy_'));

  // Stat Builder Helper
  const buildStat = (arr: typeof users) => ({
    total: arr.length,
    allowed: arr.filter(u => !u.isExcluded).length,
    banned: arr.filter(u => u.isExcluded).length
  });

  // Calculate Stocks w/ Multiple Users
  const symbolCounts = activeParticipants.reduce((acc, u) => {
    const sym = u.pick!.symbol;
    acc[sym] = (acc[sym] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const multiUserStocks = Object.values(symbolCounts).filter(count => count > 1).length;

  const stats = {
    users: buildStat(users),
    entries: buildStat(activeParticipants),
    legacy: buildStat(legacyEntries),
    multiPickUsers: 0, 
    multiUserStocks: multiUserStocks,
    lastUpdate: latestPrice 
      ? latestPrice.updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      : "No data fetched yet"
  };

  const admins = users
    .filter(u => u.adminLevel > 0)
    .map(u => ({ id: u.id, username: u.username, level: u.adminLevel }));

  const tableUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    isExcluded: u.isExcluded,
    symbol: u.pick?.symbol || "PENDING",
    entryPrice: u.pick?.entryPrice || 0,
    entryDate: u.pick?.entryDate?.toISOString() || new Date().toISOString()
  }));

  return <AdminConsole initialUsers={tableUsers} admins={admins} stats={stats} />;
}
