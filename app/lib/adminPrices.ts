import prisma from "@/app/lib/prisma";

export async function overrideDailyPrice(
  baseSymbol: string,
  exchange: string,
  date: Date,
  open: number | null,
  close: number | null
) {
  const data: { open?: number; close?: number } = {};
  if (open != null) data.open = open;
  if (close != null) data.close = close;

  await prisma.dailyPrice.updateMany({
    where: { baseSymbol, exchange, date },
    data,
  });
}