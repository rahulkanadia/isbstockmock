export function isMarketDay(date: Date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function nextMarketDay(date: Date) {
  const d = new Date(date);
  do {
    d.setDate(d.getDate() + 1);
  } while (!isMarketDay(d));
  return d;
}