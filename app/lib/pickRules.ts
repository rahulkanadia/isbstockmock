import { isISTMarketDay } from "@/app/lib/timezone";
import { getLatestPrice } from "@/app/lib/prices";
import { fetchYahooDaily } from "@/app/lib/yahoo";
import { normalizeDailyPrice } from "@/app/lib/priceNormalize";

// Helper to check if market is currently open (9:15 AM - 3:30 PM IST)
export function isMarketOpenIST(now: Date): boolean {
  if (!isISTMarketDay(now)) return false;

  // IST Offset is UTC+5:30. 
  // We use the raw UTC hours to determine relative time
  const utcHours = now.getUTCHours();
  const utcMins = now.getUTCMinutes();
  const totalMins = utcHours * 60 + utcMins;

  // 09:15 IST = 03:45 UTC = 3 * 60 + 45 = 225 mins
  // 15:30 IST = 10:00 UTC = 10 * 60 = 600 mins
  
  return totalMins >= 225 && totalMins <= 600;
}

export async function resolveEntryPrice(
  baseSymbol: string,
  exchange: string
): Promise<number> {
  const now = new Date();
  
  // 1. If Market is OPEN, we MUST try to fetch the live price
  if (isMarketOpenIST(now)) {
     try {
        const yahooSymbol = exchange === "NSE" ? `${baseSymbol}.NS` : `${baseSymbol}.BO`;
        const liveData = await fetchYahooDaily(yahooSymbol);
        const normalized = normalizeDailyPrice(liveData);
        
        // If we got a valid close (which is current price during market hours), use it
        if (normalized.close && normalized.close > 0) {
            return normalized.close;
        }
     } catch (e) {
         console.warn("Live fetch failed, falling back to DB", e);
     }
  }

  // 2. Fallback: Use the Database (Yesterday's Close)
  const price = await getLatestPrice(baseSymbol, exchange);

  if (!price || price.close == null) {
    throw new Error("No price data available (Live or DB)");
  }

  return price.close;
}