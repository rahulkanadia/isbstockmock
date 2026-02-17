import yahooFinance from 'yahoo-finance2';

export interface StockData {
  symbol: string;
  price: number;
  dayHigh: number;
  dayLow: number;
}

/**
 * Bulk fetches symbols in chunks of 20 to avoid Yahoo Finance rate limits.
 */
export async function fetchMarketData(symbols: string[]): Promise<StockData[]> {
  const results: StockData[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const chunk = symbols.slice(i, i + BATCH_SIZE).filter(Boolean);
    
    if (chunk.length === 0) continue;

    try {
      // In v3, yahooFinance.quote handles arrays directly and is a pre-instantiated default export
      const quotes = await yahooFinance.quote(chunk);
      
      // Ensure we are working with an array (Yahoo returns single object if chunk is 1)
      const dataArray = Array.isArray(quotes) ? quotes : [quotes];

      dataArray.forEach((quote) => {
        if (!quote) return;

        results.push({
          symbol: quote.symbol,
          price: quote.regularMarketPrice ?? quote.preMarketPrice ?? quote.postMarketPrice ?? 0,
          dayHigh: quote.regularMarketDayHigh ?? quote.regularMarketPrice ?? 0,
          dayLow: quote.regularMarketDayLow ?? quote.regularMarketPrice ?? 0,
        });
      });

    } catch (error) {
      console.error(`Fetch failed for chunk starting at ${i}:`, error);
    }

    // Small delay between batches to stay safe
    if (i + BATCH_SIZE < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return results;
}
