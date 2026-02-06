import { NextResponse } from "next/server";
import { requireUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { todayIST } from "@/app/lib/timezone";
import { isUserBanned } from "@/app/lib/accessControl";
import { closeActivePick, createPick } from "@/app/lib/picks";
import { resolveEntryPrice } from "@/app/lib/pickRules";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const user = await requireUser();

  // 1. Check Ban Status
  if (await isUserBanned(user.id)) {
    return NextResponse.json(
      { error: "You are banned from participating" },
      { status: 403 }
    );
  }

  // 2. Rate Limit
  const rl = rateLimit({
    key: `pick:change:${user.id}`,
    limit: 2,
    windowMs: 60_000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // 3. Check Monthly Limit
  const yearMonth = todayIST().slice(0, 7); // "2026-02"

  const used = await prisma.monthlyChange.findUnique({
    where: {
      userId_yearMonth: {
        userId: user.id,
        yearMonth,
      },
    },
  });

  if (used) {
    return NextResponse.json(
      { error: "Monthly change limit reached" },
      { status: 400 }
    );
  }

  const { baseSymbol, exchange } = await req.json();

  try {
      // 4. Resolve New Price
      // Important: We must get the live price for the NEW stock
      const entryPrice = await resolveEntryPrice(baseSymbol, exchange);

      // 5. Execute Swap (Transaction implicit by order of operations, or use prisma.$transaction if critical)
      await closeActivePick(user.id);

      await createPick({
        userId: user.id,
        baseSymbol,
        exchange,
        entryPrice,
      });

      // 6. Record usage of monthly change
      await prisma.monthlyChange.create({
        data: {
          userId: user.id,
          yearMonth,
        },
      });

      return NextResponse.json({ ok: true, entryPrice });

  } catch (e: any) {
      console.error("Pick Change Failed:", e);
      return NextResponse.json(
          { error: e.message || "Failed to switch pick" },
          { status: 400 }
      );
  }
}