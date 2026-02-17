"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleUserExclusion(userId: string, currentState: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { isExcluded: !currentState },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}