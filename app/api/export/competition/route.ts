import prisma from "@/app/lib/prisma";
import { calculatePNL } from "@/app/lib/pnl";

export async function GET() {
  const picks = await prisma.pick.findMany();
  const rows: string[] = [];

  rows.push([
    "UserId",
    "Symbol",
    "Exchange",
    "Entry Date",
    "Entry Price",
    "Exit Date",
    "Last Close",
    "PnL %",
    "Status",
  ].join(","));

  for (const p of picks) {
    const lastPrice = await prisma.dailyPrice.findFirst({
      where: {
        baseSymbol: p.baseSymbol,
        exchange: p.exchange,
      },
      orderBy: { date: "desc" },
    });

    const close = lastPrice?.close ?? null;
    const pnl =
      close != null
        ? calculatePNL(p.entryPrice, close).toFixed(2)
        : "";

    rows.push([
      p.userId,
      p.baseSymbol,
      p.exchange,
      p.entryDate.toISOString(),
      p.entryPrice.toString(),
      p.exitDate?.toISOString() ?? "",
      close?.toString() ?? "",
      pnl,
      p.active ? "ACTIVE" : "CLOSED",
    ].join(","));
  }

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="competition.csv"',
    },
  });
}
