import prisma from "@/app/lib/prisma";

export async function searchSymbols(q: string) {
  if (!q) return [];

  return prisma.symbol.findMany({
    where: {
      active: true,
      OR: [
        { baseSymbol: { startsWith: q } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [
      { baseSymbol: "asc" },
      { exchange: "asc" },
    ],
    take: 100,
    select: {
      baseSymbol: true,
      exchange: true,
      name: true,
    },
  });
}