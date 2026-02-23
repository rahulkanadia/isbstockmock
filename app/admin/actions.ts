"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveAdminEdits(edits: Record<string, any>) {
  const session = await getServerSession(authOptions);
  
  // FIX: Allow local development to bypass the strict NextAuth server check
  const IS_LOCAL = process.env.NODE_ENV === "development";

  // Security Gate
  if (!IS_LOCAL && (!session?.user || session.user.adminLevel < 1)) {
    throw new Error("Unauthorized");
  }

  for (const [userId, userEdits] of Object.entries(edits)) {
    
    // 1. Update User Table fields (like banning or admin level)
    if (userEdits.isExcluded !== undefined || userEdits.adminLevel !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(userEdits.isExcluded !== undefined && { isExcluded: userEdits.isExcluded }),
          ...(userEdits.adminLevel !== undefined && { adminLevel: userEdits.adminLevel }),
        }
      });
    }

    // 2. Update Pick Table fields (symbol, price, date)
    if (userEdits.symbol !== undefined || userEdits.entryPrice !== undefined || userEdits.entryDate !== undefined) {
      await prisma.pick.updateMany({
        where: { userId: userId },
        data: {
          ...(userEdits.symbol !== undefined && { symbol: userEdits.symbol }),
          ...(userEdits.entryPrice !== undefined && { entryPrice: userEdits.entryPrice }),
          ...(userEdits.entryDate !== undefined && { entryDate: new Date(userEdits.entryDate) }),
        }
      });
    }
  }

  // Tells Next.js to immediately refresh the cached data on both pages
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}