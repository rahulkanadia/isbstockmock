import { getMonthlyLeaderboard } from "@/app/lib/leaderboardArchive";
import { rateLimit } from "@/app/lib/rateLimit";
import { nowIST } from "@/app/lib/timezone";

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit({
    key: `leaderboard:archive:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  if (!month) {
    return Response.json(
      { error: "month query param required (YYYY-MM)" },
      { status: 400 }
    );
  }

  const leaderboard = await getMonthlyLeaderboard(month);

  return Response.json({
    month,
    generatedAt: nowIST().toISOString(),
    count: leaderboard.length,
    leaderboard,
  });
}