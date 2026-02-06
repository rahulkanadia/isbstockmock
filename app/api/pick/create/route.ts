import { NextResponse } from "next/server";
import { requireUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { resolveEntryPrice } from "@/app/lib/pickRules";
import { isUserBanned } from "@/app/lib/accessControl";
import { createPick } from "@/app/lib/picks";

export async function POST(req: Request) {
  const user = await requireUser();

  // 1. Check Ban Status (Async DB call)
  if (await isUserBanned(user.id)) {
    return NextResponse.json(
      { error: "You are banned from participating" },
      { status: 403 }
    );
  }

  // 2. Rate Limit
  const rl = rateLimit({
    key: `pick:create:${user.id}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // 3. Parse Body
  const { baseSymbol, exchange } = await req.json();

  if (!baseSymbol || !exchange) {
    return NextResponse.json(
      { error: "Symbol and Exchange are required" },
      { status: 400 }
    );
  }

  try {
      // 4. Resolve Price (Live Yahoo -> DB Fallback)
      const entryPrice = await resolveEntryPrice(
        baseSymbol,
        exchange
      );

      // 5. Create Pick in DB
      await createPick({
        userId: user.id,
        baseSymbol,
        exchange,
        entryPrice,
      });

      return NextResponse.json({ ok: true, entryPrice });

  } catch (e: any) {
      console.error("Pick Creation Failed:", e);
      return NextResponse.json(
        { error: e.message || "Failed to fetch price data" }, 
        { status: 400 }
      );
  }
}