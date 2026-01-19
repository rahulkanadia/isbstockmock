export function calculatePnlPercent(entry: number, exit: number): number {
  return ((exit - entry) / entry) * 100;
}
