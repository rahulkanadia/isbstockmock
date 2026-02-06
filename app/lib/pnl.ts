export function calculatePNL(entry: number, current: number) {
  return ((current - entry) / entry) * 100;
}