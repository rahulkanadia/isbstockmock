export async function fetchYahooDaily(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  const result = json.chart.result[0];
  return {
    open: result.indicators.quote[0].open.at(-1),
    close: result.indicators.quote[0].close.at(-1),
  };
}