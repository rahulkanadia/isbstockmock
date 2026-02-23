// [1]
import { NextRequest, NextResponse } from "next/server";
import { runPriceUpdateEngine } from "@/lib/engine";
// Why: Prevents build-time static caching of the cron handler.
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Secret or Manual Admin Secret
  // How: Vercel automatically injects this Bearer token when triggering crons.
  const authHeader = req.headers.get('authorization');
// [11]
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== expectedAuth) {
    console.warn("⚠️ Unauthorized Cron Attempt blocked.");
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    console.log("🚀 Starting Production Price Update Engine...");
    const result = await runPriceUpdateEngine();
// [21]
    if (result.success) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        message: "Market prices and leaderboard returns updated successfully."
      });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
// [31]
  } catch (error: any) {
    console.error("❌ CRON_ERROR:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
// [41]