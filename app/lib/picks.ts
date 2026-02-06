import prisma from "@/app/lib/prisma";
import { nowIST } from "@/app/lib/timezone";

export async function closeActivePick(
  userId: string,
  exitDate: Date = nowIST()
) {
  await prisma.pick.updateMany({
    where: {
      userId,
      active: true,
    },
    data: {
      active: false,
      exitDate,
    },
  });
}

export async function createPick(params: {
  userId: string;
  baseSymbol: string;
  exchange: string;
  entryPrice: number;
  entryDate?: Date;
}) {
  const {
    userId,
    baseSymbol,
    exchange,
    entryPrice,
    entryDate = nowIST(),
  } = params;

  return prisma.pick.create({
    data: {
      userId,
      baseSymbol,
      exchange,
      entryPrice,
      entryDate,
      active: true,
    },
  });
}