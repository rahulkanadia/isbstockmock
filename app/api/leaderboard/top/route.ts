import { rateLimit } from "@/app/lib/rateLimit";
import { nowIST, todayIST } from "@/app/lib/timezone";
import { getTopWinnersLosers } from "@/app/lib/leaderboard";

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit({
    key: `leaderboard:top:${ip}`,
    limit: 300,
    windowMs: 60_000,
  });

  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests", retryAfter: rl.retryAfter },
      { status: 429 }
    );
  }

  const { winners, losers } = await getTopWinnersLosers(5);

  return Response.json({
    asOf: todayIST(),
    timestampIST: nowIST().toISOString(),
    winners,
    losers,
  });
}