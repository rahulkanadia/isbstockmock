import prisma from "@/app/lib/prisma";

/**
 * Derive Yahoo symbol from baseSymbol + exchange
 */
export function getYahooSymbol(
  baseSymbol: string,
  exchange: string
): string {
  if (exchange === "NSE") return `${baseSymbol}.NS`;
  if (exchange === "BSE") return `${baseSymbol}.BO`;
  return baseSymbol;
}

/**
 * Latest available price
 */
export async function getLatestPrice(
  baseSymbol: string,
  exchange: string
) {
  return prisma.dailyPrice.findFirst({
    where: { baseSymbol, exchange },
    orderBy: { date: "desc" },
  });
}

/**
 * Price on or before a given date
 */
export async function getPriceOnOrBefore(
  baseSymbol: string,
  exchange: string,
  date: Date
) {
  return prisma.dailyPrice.findFirst({
    where: {
      baseSymbol,
      exchange,
      date: { lte: date },
    },
    orderBy: { date: "desc" },
  });
}
