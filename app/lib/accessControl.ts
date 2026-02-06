import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

// Read real admins from Env
const envAdmins = (process.env.ADMIN_IDS || "").split(",");
const ADMIN_DISCORD_IDS = new Set<string>(envAdmins.map((id) => id.trim()));

type SessionUser = { id: string };

export async function requireAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) throw new Error("Unauthorized");

  // Localhost Dev Bypass (Optional - remove if you want strict checking in dev)
  if (process.env.NODE_ENV === "development") {
    // return user; 
  }

  // Live Check
  if (!ADMIN_DISCORD_IDS.has(user.id)) {
    console.error(`Access Denied. User ID: ${user.id}. Allowed: ${Array.from(ADMIN_DISCORD_IDS)}`);
    throw new Error("Forbidden");
  }

  return user;
}

export async function requireUser() {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) throw new Error("Unauthorized");
  return user;
}

// --- DB BASED CHECKS ---

export async function isUserBanned(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true }
  });
  return user?.isBanned ?? false;
}

export async function banUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true }
  });
}

export async function unbanUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false }
  });
}