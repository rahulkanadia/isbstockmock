import yahooFinance from 'yahoo-finance2';

export interface StockData {
  symbol: string;
  price: number;
  dayHigh: number;
  dayLow: number;
}

/**
 * Optimized for Vercel Serverless (60s limit)
 * Fetches 100+ symbols in bulk chunks to avoid rate limiting
 */
export async function fetchMarketData(symbols: string[]): Promise<StockData[]> {
  const results: StockData[] = [];
  
  // Yahoo allows bulk quotes. We'll chunk in 20s for maximum reliability.
  const BATCH_SIZE = 20;

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const chunk = symbols.slice(i, i + BATCH_SIZE);
    
    try {
      // Bulk fetch the chunk
      const quotes = await yahooFinance.quote(chunk);
      
      // Yahoo returns a single object if chunk size is 1, or an array if > 1
      const dataArray = Array.isArray(quotes) ? quotes : [quotes];

      dataArray.forEach((quote) => {
        if (!quote) return;

        results.push({
          symbol: quote.symbol,
          // Fallback chain for price
          price: quote.regularMarketPrice ?? quote.preMarketPrice ?? quote.postMarketPrice ?? 0,
          // Ensure High/Low are never 0 if a price exists
          dayHigh: quote.regularMarketDayHigh ?? quote.regularMarketPrice ?? 0,
          dayLow: quote.regularMarketDayLow ?? quote.regularMarketPrice ?? 0,
        });
      });

    } catch (error) {
      console.error(`Bulk fetch failed for chunk starting at ${i}:`, error);
    }

    // Small breather between chunks to stay under the radar
    if (i + BATCH_SIZE < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return results;
}
