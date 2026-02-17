Current lib/marketData.ts:

import YahooFinance from 'yahoo-finance2';

// v3 Requirement: Instantiate the class
const yahooFinance = new YahooFinance();

const BATCH_SIZE = 5;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface StockData {
  symbol: string;
  price: number;
  dayHigh: number;
  dayLow: number;
}

export async function fetchMarketData(symbols: string[]): Promise<StockData[]> {
  const results: StockData[] = [];

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);

        if (!quote) return null;

        return {
          symbol,
          price: quote.regularMarketPrice || 0,
          // Use today's high/low if available, else fallback to current
          dayHigh: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
          dayLow: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
        };

      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...(batchResults.filter(r => r !== null) as StockData[]));

    if (i + BATCH_SIZE < symbols.length) await delay(500);
  }

  return results;
}