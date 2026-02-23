// [1]
import YahooFinance from 'yahoo-finance2';

// Why: Correctly instantiated for v3 to maintain internal context.
const yahooFinance = new YahooFinance();

const BATCH_SIZE = 5;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface StockData {
// [11]
  symbol: string;
  price: number;
  dayHigh: number;
  dayLow: number;
}

export async function fetchMarketData(symbols: string[]): Promise<StockData[]> {
  const results: StockData[] = [];

// [21]
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (symbol) => {
      try {
        // How: Passed validateResult: false to prevent the live engine from 
        // crashing on unexpected international fields from .NS or .BO stocks.
        const quote = await yahooFinance.quote(symbol, undefined, { validateResult: false }) as any;

        if (!quote) return null;
// [31]

        return {
          symbol: symbol, 
          price: quote.regularMarketPrice || 0,
          dayHigh: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
          dayLow: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
        };

      } catch (error: any) {
// [41]
        const errorMsg = error?.message || String(error);
        console.error(`:warning: Failed to fetch ${symbol}:`, errorMsg.split('\n')[0]);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...(batchResults.filter(r => r !== null) as StockData[]));

// [51]
    if (i + BATCH_SIZE < symbols.length) await delay(500);
  }

  return results;
}
// [57]