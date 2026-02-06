/**
 * Normalized daily price candle
 */
export type NormalizedPrice = {
  open: number | null;
  close: number | null;
  isValid: boolean;
  issues: string[];
};

/**
 * Validates and normalizes OHLC data from Yahoo (or admin input later)
 *
 * Rules:
 * - open / close may be null (market holiday, partial data)
 * - negative prices are invalid
 * - extreme candles are flagged (not rejected)
 */
export function normalizeDailyPrice(input: {
  open?: number | null;
  close?: number | null;
}): NormalizedPrice {
  const issues: string[] = [];

  let open = input.open ?? null;
  let close = input.close ?? null;

  if (open !== null && open <= 0) {
    issues.push("Open price is non-positive");
    open = null;
  }

  if (close !== null && close <= 0) {
    issues.push("Close price is non-positive");
    close = null;
  }

  // Detect extreme candles (but do not block)
  if (open !== null && close !== null) {
    const changePct = Math.abs((close - open) / open) * 100;
    if (changePct > 40) {
      issues.push(`Extreme candle: ${changePct.toFixed(1)}% move`);
    }
  }

  return {
    open,
    close,
    isValid: issues.length === 0,
    issues,
  };
}