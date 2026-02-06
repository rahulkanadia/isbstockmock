import { rateLimit } from "@/app/lib/rateLimit";
import { getLastPriceUpdate } from "@/app/lib/priceStatus";
import { nowIST } from "@/app/lib/timezone";

/**
 * GET /api/status/prices
 *
 * Public endpoint
 * - Last successful price update timestamp
 * - No auth
 * - Bot friendly
 */
export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit({
    key: `status:prices:${ip}`,
    limit: 300,
    windowMs: 60_000,
  });

  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests", retryAfter: rl.retryAfter },
      { status: 429 }
    );
  }

  const lastUpdate = await getLastPriceUpdate();

  return Response.json({
    lastUpdatedAt: lastUpdate,
    timestampIST: nowIST().toISOString(),
  });
}