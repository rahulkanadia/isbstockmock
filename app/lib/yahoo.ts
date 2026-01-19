type YahooQuote = {
  regularMarketOpen: number | null;
  regularMarketPrice: number | null;
};

export async function fetchYahooQuote(symbol: string): Promise<YahooQuote> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Yahoo Finance fetch failed");
  }

  const data = await res.json();
  const quote = data.quoteResponse.result[0];

  return {
    regularMarketOpen: quote?.regularMarketOpen ?? null,
    regularMarketPrice: quote?.regularMarketPrice ?? null,
  };
}
