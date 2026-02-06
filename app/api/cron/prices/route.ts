import prisma from "@/app/lib/prisma";
import { fetchYahooDaily } from "@/app/lib/yahoo";
import { normalizeDailyPrice } from "@/app/lib/priceNormalize";
import { todayIST, nowIST } from "@/app/lib/timezone";
import { logAuditEvent } from "@/app/lib/auditLog";
import { requireAdmin } from "@/app/lib/accessControl";

export async function GET() {
  const admin = await requireAdmin();
  const symbols = await prisma.symbol.findMany({ where: { active: true } });
  const today = todayIST();

  for (const s of symbols) {
    try {
      const yahooSymbol =
        s.exchange === "NSE" ? `${s.baseSymbol}.NS` : `${s.baseSymbol}.BO`;

      const raw = await fetchYahooDaily(yahooSymbol);
      const normalized = normalizeDailyPrice(raw);

      if (normalized.open == null || normalized.close == null) continue;

      await prisma.dailyPrice.upsert({
        where: {
          baseSymbol_exchange_date: {
            baseSymbol: s.baseSymbol,
            exchange: s.exchange,
            date: new Date(today),
          },
        },
        update: {
          open: normalized.open,
          close: normalized.close,
        },
        create: {
          baseSymbol: s.baseSymbol,
          exchange: s.exchange,
          date: nowIST(),
          open: normalized.open,
          close: normalized.close,
        },
      });
    } catch {
      continue;
    }
  }

  await logAuditEvent({
    adminId: admin.id,
    action: "PRICE_UPDATE",
    message: "Manual price update completed",
  });

  return Response.json({ ok: true });
}