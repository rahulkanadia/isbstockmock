// app/lib/timezone.ts

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current Date adjusted to IST.
 * NOTE: Date object represents IST wall-clock time.
 */
export function nowIST(): Date {
  const now = new Date();
  const istString = now.toLocaleString("en-US", {
    timeZone: IST_TIMEZONE,
  });
  return new Date(istString);
}

/**
 * Returns IST date as YYYY-MM-DD string
 */
export function todayIST(): string {
  const d = nowIST();
  return d.toISOString().slice(0, 10);
}

/**
 * Returns IST day of week (0 = Sunday, 6 = Saturday)
 */
export function getISTDay(date: Date): number {
  const d = new Date(
    date.toLocaleString("en-US", { timeZone: IST_TIMEZONE })
  );
  return d.getDay();
}

/**
 * Checks whether two dates fall in the same IST calendar month
 */
export function isSameISTMonth(a: Date, b: Date): boolean {
  const da = new Date(
    a.toLocaleString("en-US", { timeZone: IST_TIMEZONE })
  );
  const db = new Date(
    b.toLocaleString("en-US", { timeZone: IST_TIMEZONE })
  );

  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth()
  );
}

/**
 * Checks if a date is a weekday in IST (Mon–Fri)
 */
export function isISTMarketDay(date: Date): boolean {
  const day = getISTDay(date);
  return day !== 0 && day !== 6;
}

/**
 * Returns the next IST market day (skips Sat/Sun)
 */
export function nextISTMarketDay(from: Date): Date {
  let d = new Date(from);
  do {
    d.setDate(d.getDate() + 1);
  } while (!isISTMarketDay(d));
  return d;
}