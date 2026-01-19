type YahooQuote = {
  regularMarketOpen: number | null;
  regularMarketPrice: number | null;
};

export function toYahooSymbol(
  baseSymbol: string,
  exchange: string
): string {
  switch (exchange) {
    case "NSE":
    case "NSE_SME":
      return `${baseSymbol}.NS`;
    case "BSE":
    case "BSE_SME":
      return `${baseSymbol}.BO`;
    default:
      throw new Error(`Unsupported exchange: ${exchange}`);
  }
}

export async function fetchYahooQuote(
  baseSymbol: string,
  exchange: string
): Promise<YahooQuote> {
  const yahooSymbol = toYahooSymbol(baseSymbol, exchange);

  const res = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Yahoo Finance fetch failed");
  }

  const data = await res.json();
  const quote = data?.quoteResponse?.result?.[0];

  return {
    regularMarketOpen: quote?.regularMarketOpen ?? null,
    regularMarketPrice: quote?.regularMarketPrice ?? null,
  };
}
