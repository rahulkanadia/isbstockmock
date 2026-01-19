import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toUpperCase() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ symbols: [] });
  }

  const symbols = await prisma.symbol.findMany({
    where: {
      active: true,
      OR: [
        { baseSymbol: { startsWith: q } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ baseSymbol: "asc" }],
    take: 20,
  });

  return NextResponse.json({
    symbols: symbols.map((s) => ({
      baseSymbol: s.baseSymbol,
      exchange: s.exchange,
      name: s.name,
    })),
  });
}
